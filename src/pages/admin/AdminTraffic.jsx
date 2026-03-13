import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import {
  getClosures,
  getEvents,
  deriveEdges,
  createClosure,
  updateClosure,
  deleteClosure
} from '../../lib/backendApi'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockEventsData = [
  { id: 1, name: 'Kirab Pusaka Grebeg Suro', start_time: '2024-08-01T08:00:00', end_time: '2024-08-01T12:00:00', location: 'Alun-alun Ponorogo', lat: -7.871, lng: 111.462 },
  { id: 2, name: 'Festival Reog', start_time: '2024-08-02T10:00:00', end_time: '2024-08-02T16:00:00', location: 'Lapangan Kesehatan', lat: -7.873, lng: 111.465 }
]
const mockClosuresData = [
  { id: 1, event_id: 1, type: 'CLOSED', reason: 'Jalur kirab pusaka', start_time: '2024-08-01T07:00:00', end_time: '2024-08-01T13:00:00', edges: [{ polyline: [{ lat: -7.871, lng: 111.462 }, { lat: -7.872, lng: 111.463 }, { lat: -7.873, lng: 111.464 }] }], created_at: '2024-07-20T10:00:00' }
]

function toIsoOrNull(dtLocal) {
  if (!dtLocal) return null
  const d = new Date(dtLocal)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function MapPicker({ onPick }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  return null
}

// ─── Toast system ──────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])
  return { toasts, push }
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none" style={{ minWidth: 300 }}>
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-xl text-sm font-semibold pointer-events-auto
            ${t.type === 'success' ? 'bg-white border-green-400 text-green-800'  : ''}
            ${t.type === 'error'   ? 'bg-white border-red-400   text-red-800'    : ''}
            ${t.type === 'info'    ? 'bg-white border-blue-400  text-blue-800'   : ''}
            ${t.type === 'warning' ? 'bg-white border-yellow-400 text-yellow-800': ''}
          `}
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.13)' }}
        >
          {/* Icon */}
          <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5
            ${t.type === 'success' ? 'bg-green-100 text-green-700'  : ''}
            ${t.type === 'error'   ? 'bg-red-100   text-red-700'    : ''}
            ${t.type === 'info'    ? 'bg-blue-100  text-blue-700'   : ''}
            ${t.type === 'warning' ? 'bg-yellow-100 text-yellow-700': ''}
          `}>
            {t.type === 'success' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {t.type === 'info' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
              </svg>
            )}
            {t.type === 'warning' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </span>
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Custom Confirm Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Hapus', confirmColor = 'bg-red-600 hover:bg-red-700' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>
        <div className="flex items-start gap-4 mb-5">
          <span className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
            Batal
          </button>
          <button onClick={onConfirm}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition ${confirmColor}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTraffic() {
  const { toasts, push: toast } = useToast()

  const [closures, setClosures] = useState([])
  const [events, setEvents]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null) // { id, label }

  // Form state
  const EMPTY_FORM = { id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' }
  const [clForm, setClForm]         = useState(EMPTY_FORM)
  const [pickA, setPickA]           = useState(null)
  const [pickB, setPickB]           = useState(null)
  const [derivedEdges, setDerivedEdges] = useState([])
  const [saving, setSaving]         = useState(false)

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const [closuresData, eventsData] = await Promise.all([getClosures(false), getEvents()])
        setClosures(closuresData || [])
        setEvents(eventsData || [])
        setError(null)
      } catch (err) {
        console.error('[AdminTraffic] Error loading data:', err)
        setError('Tidak dapat terhubung ke server. Menampilkan data contoh.')
        setClosures([...mockClosuresData])
        setEvents([...mockEventsData])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetPick = () => { setPickA(null); setPickB(null); setDerivedEdges([]) }

  const resetForm = () => {
    setClForm(EMPTY_FORM)
    resetPick()
  }

  const deriveEdgesFromBackend = async () => {
    if (!pickA || !pickB) { toast('Klik 2 titik di peta terlebih dahulu (A lalu B).', 'warning'); return }
    toast('Mengambil data ruas jalan dari server...', 'info')
    try {
      const edges = await deriveEdges(pickA.lat, pickA.lng, pickB.lat, pickB.lng)
      setDerivedEdges(edges || [])
      toast(`Berhasil: ${(edges || []).length} ruas jalan terdeteksi.`, 'success')
    } catch (err) {
      console.error('[AdminTraffic] Error deriving edges:', err)
      // Fallback mock edges
      const mockEdges = [{ polyline: [{ lat: pickA.lat, lng: pickA.lng }, { lat: (pickA.lat + pickB.lat) / 2, lng: (pickA.lng + pickB.lng) / 2 }, { lat: pickB.lat, lng: pickB.lng }] }]
      setDerivedEdges(mockEdges)
      toast('Server tidak merespons. Menggunakan garis lurus sebagai fallback.', 'warning')
    }
  }

  const saveClosure = async () => {
    if (!derivedEdges.length) { toast('Belum ada ruas jalan. Klik 2 titik di peta lalu tekan Derive.', 'error'); return }
    setSaving(true)
    const payload = {
      event_id:   clForm.event_id || null,
      type:       clForm.type,
      reason:     clForm.reason || null,
      start_time: toIsoOrNull(clForm.start_time),
      end_time:   toIsoOrNull(clForm.end_time),
      edges:      derivedEdges,
      created_at: new Date().toISOString()
    }
    try {
      if (clForm.id) {
        const updated = await updateClosure(clForm.id, payload)
        setClosures(prev => prev.map(c => c.id === clForm.id ? updated : c))
        toast('Rekayasa lalu lintas berhasil diperbarui.', 'success')
      } else {
        const created = await createClosure(payload)
        setClosures(prev => [created, ...prev])
        toast('Rekayasa lalu lintas berhasil disimpan.', 'success')
      }
      resetForm()
    } catch (err) {
      console.error('[AdminTraffic] Error saving closure:', err)
      toast('Gagal menyimpan rekayasa: ' + (err?.message || 'Terjadi kesalahan.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  // FIX: editClosure sekarang scroll ke atas form supaya user sadar form berubah
  const editClosure = (c) => {
    setClForm({
      id:         c.id,
      event_id:   c.event_id || '',
      type:       c.type || 'CLOSED',
      reason:     c.reason || '',
      start_time: c.start_time ? c.start_time.slice(0, 16) : '',
      end_time:   c.end_time   ? c.end_time.slice(0, 16)   : ''
    })
    setDerivedEdges(c.edges || [])
    toast(`Mode edit aktif: "${c.type}${c.reason ? ' - ' + c.reason : ''}". Ubah data lalu klik Simpan.`, 'info')
    // Scroll ke form
    setTimeout(() => {
      document.getElementById('closure-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Trigger confirm dialog
  const requestDelete = (id, label) => {
    setConfirmTarget({ id, label })
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!confirmTarget) return
    setConfirmOpen(false)
    try {
      await deleteClosure(confirmTarget.id)
      setClosures(prev => prev.filter(c => c.id !== confirmTarget.id))
      toast(`Rekayasa "${confirmTarget.label}" berhasil dihapus.`, 'success')
    } catch (err) {
      console.error('[AdminTraffic] Error deleting closure:', err)
      toast('Gagal menghapus rekayasa: ' + (err?.message || 'Terjadi kesalahan.'), 'error')
    } finally {
      setConfirmTarget(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <ToastContainer toasts={toasts} />

      {/* Custom confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Rekayasa Lalu Lintas?"
        message={confirmTarget ? `Rekayasa "${confirmTarget.label}" akan dihapus permanen dan tidak dapat dikembalikan.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null) }}
        confirmLabel="Ya, Hapus"
      />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rekayasa Lalu Lintas</h1>
        <p className="text-gray-600 mt-1">Kelola penutupan jalan dan pengalihan rute</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Form ── */}
        <div className="lg:col-span-1" id="closure-form">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
            {/* Form header dengan indikator mode */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}
                </h2>
                {clForm.id && (
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">Mode edit aktif — ubah data lalu simpan</p>
                )}
              </div>
              {clForm.id && (
                <button onClick={resetForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Batal Edit
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Terkait Event */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Terkait Event</label>
                <select
                  value={clForm.event_id}
                  onChange={e => setClForm({ ...clForm, event_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition bg-white"
                >
                  <option value="">-- Pilih Event (opsional) --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>

              {/* Tipe */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Tipe Rekayasa</label>
                <select
                  value={clForm.type}
                  onChange={e => setClForm({ ...clForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition bg-white"
                >
                  <option value="CLOSED">CLOSED (Jalan Ditutup)</option>
                  <option value="DIVERSION">DIVERSION (Dialihkan)</option>
                </select>
              </div>

              {/* Alasan */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Alasan Rekayasa</label>
                <input
                  type="text"
                  value={clForm.reason}
                  onChange={e => setClForm({ ...clForm, reason: e.target.value })}
                  placeholder="Contoh: Kirab pusaka"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition"
                />
              </div>

              {/* Waktu */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Waktu Mulai</label>
                <input type="datetime-local" value={clForm.start_time}
                  onChange={e => setClForm({ ...clForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Waktu Selesai</label>
                <input type="datetime-local" value={clForm.end_time}
                  onChange={e => setClForm({ ...clForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition" />
              </div>

              {/* Petunjuk ruas jalan */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-1">Pilih ruas jalan di peta:</p>
                <p className="text-xs text-blue-700">Klik 2 titik di peta (A lalu B), kemudian klik tombol Derive.</p>
              </div>

              {/* Koordinat A & B */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center text-[10px]">A</span>
                  <span className="text-gray-700 font-mono">
                    {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-gray-500 text-white font-bold flex items-center justify-center text-[10px]">B</span>
                  <span className="text-gray-700 font-mono">
                    {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}
                  </span>
                </div>
              </div>

              {/* Tombol Reset + Derive */}
              <div className="flex gap-2">
                <button onClick={resetPick}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
                  Reset
                </button>
                <button onClick={deriveEdgesFromBackend}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">
                  Derive
                </button>
              </div>

              {/* Edges counter */}
              <div className={`p-3 rounded-lg border text-xs font-semibold ${derivedEdges.length > 0 ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                Ruas jalan terdeteksi: <span className="font-bold text-base">{derivedEdges.length}</span>
              </div>

              {/* Simpan */}
              <button onClick={saveClosure} disabled={saving}
                className={`w-full px-4 py-3 font-bold text-sm rounded-lg transition
                  ${saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : clForm.id ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                {saving ? 'Menyimpan...' : clForm.id ? 'Update Rekayasa' : 'Simpan Rekayasa'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Peta Rekayasa Lalu Lintas</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-red-500 rounded inline-block" />Ditutup</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-400 rounded inline-block" />Dialihkan</span>
            </div>
          </div>
          <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '520px', width: '100%' }}>
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapPicker onPick={(p) => {
              if (!pickA) setPickA(p)
              else if (!pickB) setPickB(p)
              else { setPickA(p); setPickB(null); setDerivedEdges([]) }
            }} />

            {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup><strong>Titik A</strong><br />Awal ruas jalan</Popup></Marker>}
            {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup><strong>Titik B</strong><br />Akhir ruas jalan</Popup></Marker>}

            {derivedEdges.map((e, idx) => (
              <Polyline key={'d' + idx} positions={e.polyline.map(p => [p.lat, p.lng])}
                pathOptions={{ color: clForm.type === 'CLOSED' ? 'red' : 'orange', weight: 6, opacity: 0.85 }} />
            ))}

            {closures.flatMap(c => (c.edges || []).map((e, idx) => (
              <Polyline key={c.id + '_' + idx} positions={e.polyline.map(p => [p.lat, p.lng])}
                pathOptions={{ color: c.type === 'CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{c.type}</p>
                    <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{c.reason || '—'}</p>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => editClosure(c)}
                        style={{ flex: 1, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >Edit</button>
                      <button
                        onClick={() => requestDelete(c.id, `${c.type}${c.reason ? ' - ' + c.reason : ''}`)}
                        style={{ flex: 1, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >Hapus</button>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            )))}
          </MapContainer>
        </div>
      </div>

      {/* ── Histori / Daftar ── */}
      <div className="mt-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Histori Rekayasa Lalu Lintas</h2>
            <span className="text-xs text-gray-400 font-medium">{closures.length} data</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
              Memuat data...
            </div>
          ) : closures.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              Belum ada rekayasa lalu lintas yang terdaftar.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {closures.map(c => (
                <div key={c.id}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors
                    ${clForm.id === c.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide
                        ${c.type === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.type}
                      </span>
                      {c.reason && (
                        <span className="text-sm font-semibold text-gray-900 truncate">{c.reason}</span>
                      )}
                      {clForm.id === c.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">Sedang diedit</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {c.edges?.length || 0} ruas jalan
                      {c.start_time && <> &middot; {dayjs(c.start_time).format('DD/MM/YYYY HH:mm')}</>}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => editClosure(c)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                      Edit
                    </button>
                    <button
                      onClick={() => requestDelete(c.id, `${c.type}${c.reason ? ' - ' + c.reason : ''}`)}
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
    </div>
  )
}