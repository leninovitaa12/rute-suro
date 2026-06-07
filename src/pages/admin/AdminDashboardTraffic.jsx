import React from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import Swal from 'sweetalert2'
import { supabase } from '../../lib/supabase'
import {
  getClosures,
  createClosure,
  updateClosure,
  deleteClosure,
  deriveEdges as deriveEdgesApi,
} from '../../lib/backendApi'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Supabase helpers ──────────────────────────────────────────────────────────
const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: false })
  if (error) throw error
  return data || []
}

// ── SweetAlert helpers ────────────────────────────────────────────────────────
const swalOK = (title, text) => Swal.fire({
  icon: 'success', title, text,
  timer: 2500, timerProgressBar: true,
  showConfirmButton: false,
  toast: true, position: 'top-end',
  didOpen: (popup) => {
    const container = popup.closest('.swal2-container')
    if (container) container.style.zIndex = '99999'
  },
})
const swalErr = (title, text) => Swal.fire({
  icon: 'error', title, text: text || 'Terjadi kesalahan.',
  confirmButtonColor: '#dc2626', confirmButtonText: 'Tutup',
  customClass: { container: 'swal-on-top' },
})
const swalDel = (name) => Swal.fire({
  icon: 'warning', title: 'Hapus data ini?',
  html: `<span style="color:#374151;font-size:14px"><b>${name}</b> akan dihapus permanen.</span>`,
  showCancelButton: true,
  confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
  confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal',
  reverseButtons: true, customClass: { container: 'swal-on-top' },
})

function toIsoOrNull(v) {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d) ? null : d.toISOString()
}

function MapPicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard({ section = 'traffic' }) {
  const navigate = useNavigate()

  // ── Auth check ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (localStorage.getItem('adminLoggedIn') !== 'true') navigate('/admin/login')
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    navigate('/admin/login')
  }

  // ── Shared state ────────────────────────────────────────────────────────────
  const [events,         setEvents]         = React.useState([])
  const [loadingEvents,  setLoadingEvents]   = React.useState(true)

  React.useEffect(() => {
    fetchEvents()
      .then(d => setEvents(d))
      .catch(e => console.error('[AdminDashboard] event load error:', e))
      .finally(() => setLoadingEvents(false))
  }, [])

  // ══════════════════════════════════════════════════════════════════════════
  // TRAFFIC SECTION
  // ══════════════════════════════════════════════════════════════════════════
  if (section === 'traffic') {
    const [closures,       setClosures]       = React.useState([])
    const [loadingCl,      setLoadingCl]       = React.useState(true)
    const [saving,         setSaving]          = React.useState(false)
    const [clForm, setClForm] = React.useState({
      id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '',
    })
    const [pickA,         setPickA]           = React.useState(null)
    const [pickB,         setPickB]           = React.useState(null)
    const [derivedEdges,  setDerivedEdges]    = React.useState([])
    const [deriving,      setDeriving]        = React.useState(false)

    const loadClosures = React.useCallback(async () => {
      setLoadingCl(true)
      try {
        const data = await getClosures(false)
        setClosures(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('[AdminDashboard] closure load error:', e)
        setClosures([])
      } finally {
        setLoadingCl(false)
      }
    }, [])

    React.useEffect(() => { loadClosures() }, [loadClosures])

    function resetPick() { setPickA(null); setPickB(null); setDerivedEdges([]) }
    function resetForm() {
      setClForm({ id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' })
      resetPick()
    }

    function onMapClick(p) {
      if (!pickA)       { setPickA(p) }
      else if (!pickB)  { setPickB(p) }
      else              { setPickA(p); setPickB(null); setDerivedEdges([]) }
    }

    async function handleDeriveEdges() {
      if (!pickA || !pickB) {
        swalErr('Perlu 2 Titik', 'Klik 2 titik di peta (A lalu B) terlebih dahulu.')
        return
      }
      setDeriving(true)
      try {
        const edges = await deriveEdgesApi(pickA.lat, pickA.lng, pickB.lat, pickB.lng)
        setDerivedEdges(edges || [])
        Swal.fire({
          icon: 'success', title: 'Ruas Jalan Terdeteksi',
          text: `${(edges||[]).length} ruas jalan berhasil di-derive.`,
          timer: 2000, timerProgressBar: true, showConfirmButton: false,
          didOpen: p => { const c = p.closest('.swal2-container'); if (c) c.style.zIndex = '99999' },
        })
      } catch {
        const fallback = [{ polyline: [pickA, { lat: (pickA.lat+pickB.lat)/2, lng: (pickA.lng+pickB.lng)/2 }, pickB] }]
        setDerivedEdges(fallback)
        swalErr('Fallback Mode', 'Server tidak merespons. Menggunakan garis lurus.')
      } finally {
        setDeriving(false)
      }
    }

    async function saveClosure() {
      if (!derivedEdges.length) {
        swalErr('Ruas Jalan Kosong', 'Pilih 2 titik di peta lalu klik Derive Edges.')
        return
      }
      if (!clForm.reason.trim()) {
        swalErr('Alasan Wajib Diisi', 'Mohon isi field Alasan Rekayasa.')
        return
      }
      setSaving(true)
      const payload = {
        event_id:   clForm.event_id || null,
        type:       clForm.type,
        reason:     clForm.reason.trim(),
        start_time: toIsoOrNull(clForm.start_time),
        end_time:   toIsoOrNull(clForm.end_time),
        edges:      derivedEdges,
        is_active:  true,
      }
      try {
        if (clForm.id) {
          await updateClosure(clForm.id, payload)
          await swalOK('Berhasil Diperbarui!', 'Data rekayasa telah diperbarui.')
        } else {
          await createClosure(payload)
          await swalOK('Berhasil Disimpan!', 'Rekayasa baru berhasil ditambahkan.')
        }
        resetForm()
        await loadClosures()
      } catch (e) {
        swalErr('Gagal Menyimpan', e?.message || 'Terjadi kesalahan.')
      } finally {
        setSaving(false)
      }
    }

    function editClosure(c) {
      setClForm({
        id:         c.id,
        event_id:   c.event_id || '',
        type:       c.type || 'CLOSED',
        reason:     c.reason || '',
        start_time: c.start_time?.slice(0, 16) || '',
        end_time:   c.end_time?.slice(0, 16)   || '',
      })
      setDerivedEdges(c.edges || [])
    }

    async function handleDeleteClosure(c) {
      const r = await swalDel(`${c.type}${c.reason ? ' — ' + c.reason : ''}`)
      if (!r.isConfirmed) return
      try {
        await deleteClosure(c.id)
        if (clForm.id === c.id) resetForm()
        await swalOK('Berhasil Dihapus!', 'Data rekayasa telah dihapus.')
        await loadClosures()
      } catch (e) {
        swalErr('Gagal Menghapus', e?.message)
      }
    }

    return (
      <div>
        <style>{`.swal-on-top { z-index: 99999 !important; }`}</style>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rekayasa Lalu Lintas</h1>
          <p className="text-gray-600 mt-1">Kelola penutupan jalan dan pengalihan rute</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Form Panel ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}
              </h2>

              <div className="space-y-4">
                {/* Event */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Event</label>
                  <select
                    value={clForm.event_id}
                    onChange={e => setClForm({ ...clForm, event_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition bg-white"
                  >
                    <option value="">-- Pilih Event (opsional) --</option>
                    {loadingEvents
                      ? <option disabled>Memuat event…</option>
                      : events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)
                    }
                  </select>
                </div>

                {/* Tipe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Rekayasa</label>
                  <select
                    value={clForm.type}
                    onChange={e => setClForm({ ...clForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition bg-white"
                  >
                    <option value="CLOSED">CLOSED (Jalan Ditutup)</option>
                    <option value="DIVERSION">DIVERSION (Dialihkan)</option>
                  </select>
                </div>

                {/* Alasan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Rekayasa *</label>
                  <input
                    type="text"
                    value={clForm.reason}
                    onChange={e => setClForm({ ...clForm, reason: e.target.value })}
                    placeholder="Contoh: Kirab pusaka"
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                  />
                </div>

                {/* Waktu Mulai */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={clForm.start_time}
                    onChange={e => setClForm({ ...clForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                  />
                </div>

                {/* Waktu Selesai */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={clForm.end_time}
                    onChange={e => setClForm({ ...clForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                  />
                </div>

                {/* Picker info */}
                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs">
                  <p className="font-semibold text-blue-900 mb-1">Pilih ruas jalan:</p>
                  <p className="text-blue-700">Klik 2 titik di peta (A lalu B), lalu klik Derive.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-100 text-xs space-y-1">
                  <p><span className="font-semibold">Titik A:</span> {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}</p>
                  <p><span className="font-semibold">Titik B:</span> {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}</p>
                </div>

                {/* Derive + Reset */}
                <div className="flex gap-2">
                  <button onClick={resetPick}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded hover:bg-gray-200 transition">
                    Reset
                  </button>
                  <button onClick={handleDeriveEdges} disabled={deriving}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
                    {deriving ? 'Memproses…' : 'Derive Edges'}
                  </button>
                </div>

                <div className={`p-3 rounded border text-xs font-semibold ${derivedEdges.length > 0 ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  Ruas jalan terdeteksi: <span className="font-bold text-base">{derivedEdges.length}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {clForm.id && (
                    <button onClick={resetForm}
                      className="flex-1 px-4 py-3 font-bold text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
                      Batal
                    </button>
                  )}
                  <button onClick={saveClosure} disabled={saving}
                    className={`${clForm.id ? 'flex-1' : 'w-full'} px-4 py-3 font-bold text-sm rounded transition
                      ${saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                               : clForm.id ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                           : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                    {saving ? 'Menyimpan…' : clForm.id ? 'Update Rekayasa' : 'Simpan Rekayasa'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Map Panel ── */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '600px', width: '100%' }}>
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker onPick={onMapClick} />
              {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup><b>Titik A</b></Popup></Marker>}
              {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup><b>Titik B</b></Popup></Marker>}
              {derivedEdges.map((e, i) => (
                <Polyline key={'d'+i} positions={e.polyline.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: clForm.type === 'CLOSED' ? 'red' : 'orange', weight: 6, opacity: 0.85 }} />
              ))}
              {closures.flatMap(c => (c.edges||[]).map((e, i) => (
                <Polyline key={c.id+'_'+i} positions={e.polyline.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: c.type === 'CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                  <Popup>
                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{c.type}</p>
                    <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{c.reason || '—'}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => editClosure(c)}
                        style={{ flex: 1, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClosure(c)}
                        style={{ flex: 1, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Hapus
                      </button>
                    </div>
                  </Popup>
                </Polyline>
              )))}
            </MapContainer>
          </div>
        </div>

        {/* ── Histori Closure ── */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Histori Rekayasa Lalu Lintas</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">{closures.length} data</span>
              <button onClick={loadClosures}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                Refresh
              </button>
            </div>
          </div>
          {loadingCl ? (
            <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
              Memuat data…
            </div>
          ) : closures.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada rekayasa lalu lintas terdaftar.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {closures.map(c => (
                <div key={c.id} className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition ${clForm.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${c.type === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.type}
                      </span>
                      {c.reason && <span className="text-sm font-semibold text-gray-900 truncate">{c.reason}</span>}
                      {clForm.id === c.id && <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">Sedang Diedit</span>}
                    </div>
                    <p className="text-xs text-gray-500">
                      {c.edges?.length || 0} ruas jalan
                      {c.start_time && <> &middot; {dayjs(c.start_time).format('DD/MM/YYYY HH:mm')}</>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button onClick={() => editClosure(c)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClosure(c)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEFAULT / CONTENT SECTIONS
  // ══════════════════════════════════════════════════════════════════════════
  const contentSections = {
    sejarah:  { title: 'Manajemen Konten - Sejarah',  description: 'Kelola halaman sejarah Grebeg Suro' },
    jadwal:   { title: 'Manajemen Konten - Jadwal',   description: 'Kelola jadwal acara Grebeg Suro' },
    tentang:  { title: 'Manajemen Konten - Tentang',  description: 'Kelola halaman tentang Rute Suro' },
  }
  const content = contentSections[section] || contentSections.sejarah

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          <p className="text-gray-600 mt-1">{content.description}</p>
        </div>
        <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition">
          Logout
        </button>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-md">
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Menu manajemen konten untuk {section} sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>
  )
}