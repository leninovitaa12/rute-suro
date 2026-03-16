import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import Swal from 'sweetalert2'
import { getClosures, getEvents, deriveEdges, createClosure, updateClosure, deleteClosure } from '../../lib/backendApi'
import { api } from '../../lib/api'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const mockEvents   = [
  { id: 1, name: 'Kirab Pusaka Grebeg Suro', start_time: '2024-08-01T08:00:00', end_time: '2024-08-01T12:00:00', lat: -7.871, lng: 111.462 },
  { id: 2, name: 'Festival Reog',            start_time: '2024-08-02T10:00:00', end_time: '2024-08-02T16:00:00', lat: -7.873, lng: 111.465 },
]
const mockClosures = [
  { id: 1, event_id: 1, type: 'CLOSED', reason: 'Jalur kirab pusaka', start_time: '2024-08-01T07:00:00', end_time: '2024-08-01T13:00:00', edges: [{ polyline: [{ lat:-7.871,lng:111.462 },{ lat:-7.872,lng:111.463 },{ lat:-7.873,lng:111.464 }] }], created_at: '2024-07-20T10:00:00' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toIso   = v => { const d = new Date(v); return isNaN(d) ? null : d.toISOString() }
const swal    = (icon, title, opts = {}) => Swal.fire({ icon, title, confirmButtonColor: icon === 'success' ? '#16a34a' : icon === 'error' ? '#dc2626' : '#2563eb', confirmButtonText: icon === 'error' ? 'Tutup' : 'OK', ...opts })
const swalOK  = (title, text) => swal('success', title, { text, timer: 3000, timerProgressBar: true })
const swalErr = (title, text) => swal('error', title, { text: text || 'Terjadi kesalahan.' })
const swalDel = name  => Swal.fire({ icon: 'warning', title: 'Hapus data ini?', html: `<span style="color:#374151;font-size:14px"><b>${name}</b> akan dihapus permanen.</span>`, showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true })

function MapPicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// ─── Reusable shared form field components ────────────────────────────────────
const Lbl  = ({ text }) => <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{text}</label>
const Sel  = ({ value, onChange, cls = '', children }) => <select value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${cls}`}>{children}</select>
const Inp  = ({ value, onChange, placeholder, cls = '' }) => <input type="text" value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition ${cls}`} />
const DtIn = ({ value, onChange, cls = '' }) => <input type="datetime-local" value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition ${cls}`} />

// ─── Shared hook: map pick + derive ──────────────────────────────────────────
function useEdgePicker() {
  const [pickA, setPickA]   = useState(null)
  const [pickB, setPickB]   = useState(null)
  const [edges, setEdges]   = useState([])

  const reset = () => { setPickA(null); setPickB(null); setEdges([]) }
  const onMapClick = p => {
    if (!pickA) setPickA(p)
    else if (!pickB) setPickB(p)
    else { setPickA(p); setPickB(null); setEdges([]) }
  }
  const derive = async () => {
    if (!pickA || !pickB) { swal('info', 'Perlu 2 titik', { text: 'Klik 2 titik di peta (A lalu B).' }); return }
    try {
      const e = await deriveEdges(pickA.lat, pickA.lng, pickB.lat, pickB.lng)
      setEdges(e || [])
      Swal.fire({ icon: 'success', title: 'Ruas Jalan Terdeteksi', text: `${(e||[]).length} ruas jalan berhasil di-derive.`, timer: 2000, timerProgressBar: true, showConfirmButton: false })
    } catch {
      const fallback = [{ polyline: [pickA, { lat:(pickA.lat+pickB.lat)/2, lng:(pickA.lng+pickB.lng)/2 }, pickB] }]
      setEdges(fallback)
      swal('info', 'Fallback Mode', { text: 'Server tidak merespons. Menggunakan garis lurus.' })
    }
  }
  return { pickA, pickB, edges, setEdges, reset, onMapClick, derive }
}

// ─── Reusable: titik A/B display + derive buttons ────────────────────────────
function PickerPanel({ pickA, pickB, edges, onDerive, onReset, accentColor = 'bg-blue-600' }) {
  return (
    <>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs">
        <p className="font-semibold text-blue-900 mb-1">Pilih ruas jalan di peta:</p>
        <p className="text-blue-700">Klik 2 titik di peta (A lalu B), lalu tekan Derive.</p>
      </div>
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
        {[['A', pickA, 'bg-gray-700'], ['B', pickB, 'bg-gray-500']].map(([lbl, pt, bg]) => (
          <div key={lbl} className="flex items-center gap-2 text-xs">
            <span className={`w-5 h-5 rounded-full ${bg} text-white font-bold flex items-center justify-center text-[10px]`}>{lbl}</span>
            <span className="text-gray-700 font-mono">{pt ? `${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}` : '(belum dipilih)'}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onReset} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">Reset</button>
        <button onClick={onDerive} className={`flex-1 px-3 py-2 ${accentColor} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition`}>Derive</button>
      </div>
      <div className={`p-3 rounded-lg border text-xs font-semibold ${edges.length > 0 ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        Ruas jalan terdeteksi: <span className="font-bold text-base">{edges.length}</span>
      </div>
    </>
  )
}

// ─── Reusable: histori list row ───────────────────────────────────────────────
function HistoryRow({ item, editingId, onEdit, onDelete, badgeClass, badgeLabel, extraInfo }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${editingId === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${badgeClass}`}>{badgeLabel}</span>
          {item.reason && <span className="text-sm font-semibold text-gray-900 truncate">{item.reason}</span>}
          {editingId === item.id && <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">Sedang diedit</span>}
        </div>
        <p className="text-xs text-gray-500">{item.edges?.length || 0} ruas jalan{item.start_time && <> &middot; {dayjs(item.start_time).format('DD/MM/YYYY HH:mm')}</>}{extraInfo}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition">Edit</button>
        <button onClick={() => onDelete(item)} className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Hapus</button>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTraffic() {
  const [activeTab, setActiveTab] = useState('closure')

  // Closures
  const [closures,  setClosures]  = useState([])
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [saving,    setSaving]    = useState(false)
  const EMPTY_CL = { id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' }
  const [clForm, setClForm] = useState(EMPTY_CL)
  const clPicker = useEdgePicker()

  // Congestion
  const [congestions,   setCongestions]   = useState([])
  const [loadingCong,   setLoadingCong]   = useState(true)
  const [cgSaving,      setCgSaving]      = useState(false)
  const EMPTY_CG = { id: null, event_id: '', level: 'MODERATE', reason: '', start_time: '', end_time: '' }
  const [cgForm, setCgForm] = useState(EMPTY_CG)
  const cgPicker = useEdgePicker()

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        const [cl, ev] = await Promise.all([getClosures(false), getEvents()])
        setClosures(cl || []); setEvents(ev || [])
      } catch {
        setError('Tidak dapat terhubung ke server. Menampilkan data contoh.')
        setClosures([...mockClosures]); setEvents([...mockEvents])
      } finally { setLoading(false) }
    })()
  }, [])

  useEffect(() => {
    api.get('/congestion_zones')
      .then(r => setCongestions(r.data || []))
      .catch(() => setCongestions([]))
      .finally(() => setLoadingCong(false))
  }, [])

  // ── Closure CRUD ──────────────────────────────────────────────────────────
  const resetCl = () => { setClForm(EMPTY_CL); clPicker.reset() }

  const saveClosure = async () => {
    if (!clPicker.edges.length) { swalErr('Ruas Jalan Kosong', 'Klik 2 titik lalu tekan Derive.'); return }
    setSaving(true)
    const p = { event_id: clForm.event_id || null, type: clForm.type, reason: clForm.reason || null, start_time: toIso(clForm.start_time), end_time: toIso(clForm.end_time), edges: clPicker.edges, created_at: new Date().toISOString() }
    try {
      if (clForm.id) {
        const u = await updateClosure(clForm.id, p)
        setClosures(prev => prev.map(c => c.id === clForm.id ? u : c))
        await swalOK('Berhasil Diperbarui!', 'Data rekayasa telah diperbarui.')
      } else {
        const c = await createClosure(p)
        setClosures(prev => [c, ...prev])
        await swalOK('Berhasil Disimpan!', 'Rekayasa baru berhasil ditambahkan.')
      }
      resetCl()
    } catch (e) { swalErr('Gagal Menyimpan', e?.message) }
    finally { setSaving(false) }
  }

  const editClosure = c => {
    setClForm({ id: c.id, event_id: c.event_id||'', type: c.type||'CLOSED', reason: c.reason||'', start_time: c.start_time?.slice(0,16)||'', end_time: c.end_time?.slice(0,16)||'' })
    clPicker.setEdges(c.edges || [])
    setTimeout(() => document.getElementById('closure-form')?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
  }

  const deleteCl = async c => {
    const r = await swalDel(`${c.type}${c.reason ? ' - '+c.reason : ''}`)
    if (!r.isConfirmed) return
    try { await deleteClosure(c.id); setClosures(p => p.filter(x => x.id !== c.id)); await swalOK('Berhasil Dihapus!', '') }
    catch (e) { swalErr('Gagal Menghapus', e?.message) }
  }

  // ── Congestion CRUD ───────────────────────────────────────────────────────
  const resetCg = () => { setCgForm(EMPTY_CG); cgPicker.reset() }

  const saveCongestion = async () => {
    if (!cgPicker.edges.length) { swalErr('Ruas Jalan Kosong', 'Klik 2 titik lalu tekan Derive.'); return }
    setCgSaving(true)
    const p = { event_id: cgForm.event_id||null, level: cgForm.level, reason: cgForm.reason||null, start_time: toIso(cgForm.start_time), end_time: toIso(cgForm.end_time), edges: cgPicker.edges }
    try {
      if (cgForm.id) {
        const r = await api.put(`/congestion_zones/${cgForm.id}`, p)
        setCongestions(prev => prev.map(c => c.id === cgForm.id ? r.data : c))
        await swalOK('Berhasil Diperbarui!', 'Zona kemacetan diperbarui.')
      } else {
        const r = await api.post('/congestion_zones', p)
        setCongestions(prev => [r.data, ...prev])
        await swalOK('Berhasil Disimpan!', 'Zona kemacetan ditambahkan.')
      }
      resetCg()
    } catch (e) { swalErr('Gagal Menyimpan', e?.message) }
    finally { setCgSaving(false) }
  }

  const editCongestion = cg => {
    setCgForm({ id: cg.id, event_id: cg.event_id||'', level: cg.level||'MODERATE', reason: cg.reason||'', start_time: cg.start_time?.slice(0,16)||'', end_time: cg.end_time?.slice(0,16)||'' })
    cgPicker.setEdges(cg.edges || [])
    setTimeout(() => document.getElementById('congestion-form')?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
  }

  const deleteCg = async cg => {
    const r = await swalDel(cg.reason || cg.level)
    if (!r.isConfirmed) return
    try { await api.delete(`/congestion_zones/${cg.id}`); setCongestions(p => p.filter(x => x.id !== cg.id)); await swalOK('Berhasil Dihapus!', '') }
    catch (e) { swalErr('Gagal Menghapus', e?.message) }
  }

  // ── Shared field style shortcuts ──────────────────────────────────────────
  const fcl = 'focus:ring-red-500/20 focus:border-red-400'
  const fcg = 'focus:ring-orange-500/20 focus:border-orange-400'

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rekayasa Lalu Lintas</h1>
        <p className="text-gray-600 mt-1">Kelola penutupan jalan dan zona kemacetan</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          {error}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[['closure','bg-red-600','bg-red-400','Penutupan Jalan'],['congestion','bg-orange-500','bg-orange-400','Zona Kemacetan']].map(([tab, act, dot, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab===tab ? `${act} text-white shadow-md` : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`}>
            <span className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />{label}
            </span>
          </button>
        ))}
      </div>

      {/* ══ TAB: CLOSURE ══════════════════════════════════════════════════════ */}
      {activeTab === 'closure' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1" id="closure-form">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}</h2>
                    {clForm.id && <p className="text-xs text-blue-600 font-semibold mt-0.5">Mode edit aktif</p>}
                  </div>
                  {clForm.id && (
                    <button onClick={resetCl} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Batal Edit
                    </button>
                  )}
                </div>

                <div><Lbl text="Terkait Event" /><Sel value={clForm.event_id} onChange={e=>setClForm({...clForm,event_id:e.target.value})} cls={fcl}><option value="">-- Pilih Event (opsional) --</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}</Sel></div>
                <div><Lbl text="Tipe Rekayasa" /><Sel value={clForm.type} onChange={e=>setClForm({...clForm,type:e.target.value})} cls={fcl}><option value="CLOSED">CLOSED (Jalan Ditutup)</option><option value="DIVERSION">DIVERSION (Dialihkan)</option></Sel></div>
                <div><Lbl text="Alasan Rekayasa" /><Inp value={clForm.reason} onChange={e=>setClForm({...clForm,reason:e.target.value})} placeholder="Contoh: Kirab pusaka" cls={fcl} /></div>
                <div><Lbl text="Waktu Mulai" /><DtIn value={clForm.start_time} onChange={e=>setClForm({...clForm,start_time:e.target.value})} cls={fcl} /></div>
                <div><Lbl text="Waktu Selesai" /><DtIn value={clForm.end_time} onChange={e=>setClForm({...clForm,end_time:e.target.value})} cls={fcl} /></div>

                <PickerPanel pickA={clPicker.pickA} pickB={clPicker.pickB} edges={clPicker.edges} onDerive={clPicker.derive} onReset={clPicker.reset} accentColor="bg-blue-600" />

                <button onClick={saveClosure} disabled={saving}
                  className={`w-full px-4 py-3 font-bold text-sm rounded-lg transition ${saving?'bg-gray-300 text-gray-500 cursor-not-allowed':clForm.id?'bg-blue-600 hover:bg-blue-700 text-white':'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {saving ? 'Menyimpan...' : clForm.id ? '✏️ Update Rekayasa' : '➕ Simpan Rekayasa'}
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Peta Rekayasa Lalu Lintas</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-red-500 rounded inline-block" />Ditutup</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-400 rounded inline-block" />Dialihkan</span>
                </div>
              </div>
              <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: 520, width: '100%' }}>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapPicker onPick={clPicker.onMapClick} />
                {clPicker.pickA && <Marker position={[clPicker.pickA.lat, clPicker.pickA.lng]}><Popup><b>Titik A</b></Popup></Marker>}
                {clPicker.pickB && <Marker position={[clPicker.pickB.lat, clPicker.pickB.lng]}><Popup><b>Titik B</b></Popup></Marker>}
                {clPicker.edges.map((e,i) => <Polyline key={'d'+i} positions={e.polyline.map(p=>[p.lat,p.lng])} pathOptions={{ color: clForm.type==='CLOSED'?'red':'orange', weight:6, opacity:.85 }} />)}
                {closures.flatMap(c => (c.edges||[]).map((e,i) => (
                  <Polyline key={c.id+'_'+i} positions={e.polyline.map(p=>[p.lat,p.lng])} pathOptions={{ color:c.type==='CLOSED'?'red':'orange', weight:4, opacity:.6 }}>
                    <Popup>
                      <p style={{fontWeight:'bold',marginBottom:4}}>{c.type}</p>
                      <p style={{fontSize:12,color:'#555',marginBottom:8}}>{c.reason||'—'}</p>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>editClosure(c)} style={{flex:1,padding:'4px 8px',background:'#2563eb',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>Edit</button>
                        <button onClick={()=>deleteCl(c)} style={{flex:1,padding:'4px 8px',background:'#dc2626',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>Hapus</button>
                      </div>
                    </Popup>
                  </Polyline>
                )))}
              </MapContainer>
            </div>
          </div>

          {/* Histori */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Histori Rekayasa Lalu Lintas</h2>
              <span className="text-xs text-gray-400 font-medium">{closures.length} data</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center"><span className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />Memuat data...</div>
            ) : closures.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada rekayasa lalu lintas terdaftar.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {closures.map(c => (
                  <HistoryRow key={c.id} item={c} editingId={clForm.id} onEdit={editClosure} onDelete={deleteCl}
                    badgeClass={c.type==='CLOSED'?'bg-red-100 text-red-700':'bg-orange-100 text-orange-700'}
                    badgeLabel={c.type} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ TAB: CONGESTION ═══════════════════════════════════════════════════ */}
      {activeTab === 'congestion' && (
        <>
          <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p className="font-bold mb-0.5">Tentang Zona Kemacetan</p>
              <p className="text-xs text-orange-800 leading-relaxed">Jalan macet <b>tetap bisa dilewati</b> — A* memberi bobot lebih tinggi. Ditampilkan <span className="font-bold text-orange-600">garis oranye</span> di peta pengguna. <b>MODERATE</b> = 2.5× lebih lambat, <b>HEAVY</b> = 5× lebih lambat.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1" id="congestion-form">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{cgForm.id ? 'Edit Kemacetan' : 'Tambah Zona Macet'}</h2>
                    {cgForm.id && <p className="text-xs text-orange-600 font-semibold mt-0.5">Mode edit aktif</p>}
                  </div>
                  {cgForm.id && (
                    <button onClick={resetCg} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Batal Edit
                    </button>
                  )}
                </div>

                <div><Lbl text="Terkait Event" /><Sel value={cgForm.event_id} onChange={e=>setCgForm({...cgForm,event_id:e.target.value})} cls={fcg}><option value="">-- Pilih Event (opsional) --</option>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}</Sel></div>
                <div>
                  <Lbl text="Level Kemacetan" />
                  <Sel value={cgForm.level} onChange={e=>setCgForm({...cgForm,level:e.target.value})} cls={fcg}>
                    <option value="MODERATE">MODERATE — Macet Sedang (ETA 2.5×)</option>
                    <option value="HEAVY">HEAVY — Macet Parah (ETA 5×)</option>
                  </Sel>
                  <p className="mt-1 text-[11px] text-gray-400">A* akan menghindari jika ada jalur alternatif lebih cepat.</p>
                </div>
                <div><Lbl text="Keterangan" /><Inp value={cgForm.reason} onChange={e=>setCgForm({...cgForm,reason:e.target.value})} placeholder="Contoh: Antrian kirab, pasar malam" cls={fcg} /></div>
                <div><Lbl text="Waktu Mulai" /><DtIn value={cgForm.start_time} onChange={e=>setCgForm({...cgForm,start_time:e.target.value})} cls={fcg} /></div>
                <div><Lbl text="Waktu Selesai" /><DtIn value={cgForm.end_time} onChange={e=>setCgForm({...cgForm,end_time:e.target.value})} cls={fcg} /></div>

                <PickerPanel pickA={cgPicker.pickA} pickB={cgPicker.pickB} edges={cgPicker.edges} onDerive={cgPicker.derive} onReset={cgPicker.reset} accentColor="bg-orange-500" />

                <button onClick={saveCongestion} disabled={cgSaving}
                  className={`w-full px-4 py-3 font-bold text-sm rounded-lg transition ${cgSaving?'bg-gray-300 text-gray-500 cursor-not-allowed':cgForm.id?'bg-blue-600 hover:bg-blue-700 text-white':'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  {cgSaving ? 'Menyimpan...' : cgForm.id ? '✏️ Update Zona Macet' : '➕ Simpan Zona Macet'}
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Peta Zona Kemacetan</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-400 rounded inline-block" />Macet Sedang</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-600 rounded inline-block" />Macet Parah</span>
                </div>
              </div>
              <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: 520, width: '100%' }}>
                <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapPicker onPick={cgPicker.onMapClick} />
                {cgPicker.pickA && <Marker position={[cgPicker.pickA.lat, cgPicker.pickA.lng]}><Popup><b>Titik A</b></Popup></Marker>}
                {cgPicker.pickB && <Marker position={[cgPicker.pickB.lat, cgPicker.pickB.lng]}><Popup><b>Titik B</b></Popup></Marker>}
                {cgPicker.edges.map((e,i) => <Polyline key={'cgd'+i} positions={e.polyline.map(p=>[p.lat,p.lng])} pathOptions={{ color:cgForm.level==='HEAVY'?'#ea580c':'#fb923c', weight:6, opacity:.85, dashArray:'8,4' }} />)}
                {congestions.flatMap(cg => (cg.edges||[]).map((e,i) => (
                  <Polyline key={cg.id+'_cg_'+i} positions={e.polyline.map(p=>[p.lat,p.lng])} pathOptions={{ color:cg.level==='HEAVY'?'#ea580c':'#fb923c', weight:5, opacity:.7, dashArray:'8,4' }}>
                    <Popup>
                      <p style={{fontWeight:'bold',marginBottom:2}}>🚦 {cg.level==='HEAVY'?'Macet Parah':'Macet Sedang'}</p>
                      <p style={{fontSize:12,color:'#555',marginBottom:8}}>{cg.reason||'—'}</p>
                      <div style={{display:'flex',gap:6}}>
                        <button onClick={()=>editCongestion(cg)} style={{flex:1,padding:'4px 8px',background:'#2563eb',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>Edit</button>
                        <button onClick={()=>deleteCg(cg)} style={{flex:1,padding:'4px 8px',background:'#dc2626',color:'white',border:'none',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}>Hapus</button>
                      </div>
                    </Popup>
                  </Polyline>
                )))}
              </MapContainer>
            </div>
          </div>

          {/* Histori */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Daftar Zona Kemacetan</h2>
              <span className="text-xs text-gray-400 font-medium">{congestions.length} data</span>
            </div>
            {loadingCong ? (
              <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center"><span className="w-4 h-4 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />Memuat data...</div>
            ) : congestions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada zona kemacetan terdaftar.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {congestions.map(cg => (
                  <HistoryRow key={cg.id} item={cg} editingId={cgForm.id} onEdit={editCongestion} onDelete={deleteCg}
                    badgeClass={cg.level==='HEAVY'?'bg-orange-200 text-orange-800':'bg-orange-100 text-orange-600'}
                    badgeLabel={`🚦 ${cg.level}`}
                    extraInfo={cg.end_time ? <> s/d {dayjs(cg.end_time).format('DD/MM HH:mm')}</> : null} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}