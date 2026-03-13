import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getParkingSpots,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot,
} from '../../lib/backendApi'

// ─── Leaflet icons ─────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const blueIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41], iconAnchor:  [12, 41], popupAnchor: [1, -34], shadowSize:  [41, 41],
})

// ─── Mock fallback ─────────────────────────────────────────────────────────────
const mockEvents = [
  { id: '1', name: 'Kirab Pusaka Grebeg Suro', description: 'Kirab pusaka dari alun-alun ke Ponorogo', location: 'Alun-alun Ponorogo', start_time: '2024-08-01T08:00:00', end_time: '2024-08-01T12:00:00', lat: -7.871, lng: 111.462 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function toIsoOrNull(v) {
  if (!v) return null
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function MapPicker({ onPick }) {
  useMapEvents({ click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) } })
  return null
}

// ─── Toast system ─────────────────────────────────────────────────────────────
// Toast dirender di BODY-level agar tidak tertindih elemen lain
function useToast() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])
  return { toasts, push }
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div
      className="fixed z-[99999] flex flex-col gap-2.5 pointer-events-none"
      style={{ top: 24, right: 24, minWidth: 320, maxWidth: 420 }}
    >
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold pointer-events-auto"
          style={{
            background: 'white',
            boxShadow: '0 6px 32px rgba(0,0,0,0.18)',
            borderColor: t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#f87171' : t.type === 'warning' ? '#fbbf24' : '#60a5fa',
            color:       t.type === 'success' ? '#166534' : t.type === 'error' ? '#991b1b' : t.type === 'warning' ? '#92400e' : '#1e40af',
          }}
        >
          {/* icon */}
          <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
            style={{ background: t.type === 'success' ? '#dcfce7' : t.type === 'error' ? '#fee2e2' : t.type === 'warning' ? '#fef3c7' : '#dbeafe' }}>
            {t.type === 'success' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {(t.type === 'info' || t.type === 'warning') && (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            )}
          </span>
          <span className="leading-snug flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Custom Confirm Dialog ─────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}>
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
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Field helper ──────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400/20 focus:border-gray-400 transition'

// ─── Modal: Form Event ────────────────────────────────────────────────────────
function EventModal({ editingId, formData, markerPos, onChange, onMapPick, onSubmit, onClose, saving }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[500] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {editingId ? 'Edit Event' : 'Tambah Event Baru'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          <div className="p-6 space-y-4 lg:col-span-1">
            <Field label="Nama Event" required>
              <input type="text" name="name" value={formData.name} onChange={onChange}
                placeholder="Nama event" className={inputCls} />
            </Field>
            <Field label="Deskripsi">
              <textarea name="description" value={formData.description} onChange={onChange}
                placeholder="Deskripsi singkat" rows={3} className={inputCls} />
            </Field>
            <Field label="Lokasi">
              <input type="text" name="location" value={formData.location} onChange={onChange}
                placeholder="Nama lokasi" className={inputCls} />
            </Field>
            <Field label="Waktu Mulai" required>
              <input type="datetime-local" name="start_time" value={formData.start_time} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Waktu Selesai">
              <input type="datetime-local" name="end_time" value={formData.end_time} onChange={onChange} className={inputCls} />
            </Field>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Koordinat Event</p>
              <p className="text-xs text-gray-700 font-mono">{markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Klik peta untuk ubah lokasi pin</p>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                Batal
              </button>
              <button type="button" onClick={onSubmit} disabled={saving}
                className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition
                  ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}>
                {saving ? 'Menyimpan...' : 'Simpan Event'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Klik peta untuk pin lokasi event (merah)</p>
            <MapContainer center={[markerPos.lat, markerPos.lng]} zoom={14} className="h-[420px] w-full rounded-lg border border-gray-200">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <MapPicker onPick={onMapPick} />
              <Marker position={[markerPos.lat, markerPos.lng]}>
                <Popup>Lokasi Event<br />{markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Kelola Parkir ─────────────────────────────────────────────────────
function ParkingModal({ event, spots, onClose, onRefresh, toast }) {
  const EMPTY = { name: '', description: '', capacity: '', lat: event.lat, lng: event.lng }
  const [form, setForm]     = useState(EMPTY)
  const [marker, setMarker] = useState({ lat: event.lat, lng: event.lng })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Confirm delete state
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)

  const eventSpots = spots.filter(s => String(s.event_id) === String(event.id))

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleMapPick(pos) {
    setMarker(pos)
    setForm(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }))
  }

  function startEdit(spot) {
    setEditId(spot.id)
    setMarker({ lat: spot.lat, lng: spot.lng })
    setForm({ name: spot.name, description: spot.description || '', capacity: spot.capacity != null ? String(spot.capacity) : '', lat: spot.lat, lng: spot.lng })
  }

  function resetForm() {
    setEditId(null)
    setForm(EMPTY)
    setMarker({ lat: event.lat, lng: event.lng })
  }

  async function handleSave() {
    if (!form.name.trim()) { toast('Nama titik parkir wajib diisi.', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        event_id:    event.id,
        name:        form.name.trim(),
        description: form.description || null,
        capacity:    form.capacity ? parseInt(form.capacity) : null,
        lat:         parseFloat(form.lat),
        lng:         parseFloat(form.lng),
      }
      if (editId) {
        await updateParkingSpot(editId, payload)
        toast(`Titik parkir "${form.name}" berhasil diperbarui.`, 'success')
      } else {
        await createParkingSpot(payload)
        toast(`Titik parkir "${form.name}" berhasil ditambahkan.`, 'success')
      }
      resetForm()
      await onRefresh()
    } catch (err) {
      toast('Gagal menyimpan: ' + (err?.message || 'Terjadi kesalahan'), 'error')
    } finally {
      setSaving(false)
    }
  }

  function requestDelete(id, name) {
    setConfirmTarget({ id, name })
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!confirmTarget) return
    setConfirmOpen(false)
    try {
      await deleteParkingSpot(confirmTarget.id)
      toast(`Titik parkir "${confirmTarget.name}" berhasil dihapus.`, 'success')
      if (editId === confirmTarget.id) resetForm()
      await onRefresh()
    } catch (err) {
      toast('Gagal menghapus: ' + (err?.message || 'Terjadi kesalahan'), 'error')
    } finally {
      setConfirmTarget(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[500] flex items-center justify-center p-4">
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Titik Parkir?"
        message={confirmTarget ? `Titik parkir "${confirmTarget.name}" akan dihapus permanen.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null) }}
      />

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Titik Parkir</h2>
            <p className="text-xs text-gray-500 mt-0.5">Event: <span className="font-semibold text-gray-700">{event.name}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          {/* Kiri: form + daftar */}
          <div className="p-6 flex flex-col gap-5">
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-3">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                {editId ? 'Edit Titik Parkir' : 'Tambah Titik Parkir'}
              </p>
              <Field label="Nama" required>
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Contoh: Parkir Utara, Parkir Selatan" className={inputCls} />
              </Field>
              <Field label="Keterangan">
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Keterangan opsional" rows={2} className={inputCls} />
              </Field>
              <Field label="Kapasitas Kendaraan">
                <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                  placeholder="Opsional" min={0} className={inputCls} />
              </Field>
              <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-xs text-gray-500 font-mono">{parseFloat(form.lat).toFixed(5)}, {parseFloat(form.lng).toFixed(5)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Klik peta untuk pin lokasi parkir</p>
              </div>
              <div className="flex gap-2">
                {editId && (
                  <button onClick={resetForm}
                    className="flex-1 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                    Batal Edit
                  </button>
                )}
                <button onClick={handleSave} disabled={saving}
                  className={`flex-1 px-3 py-2 text-sm font-semibold text-white rounded-lg transition
                    ${saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}>
                  {saving ? 'Menyimpan...' : editId ? 'Update' : 'Tambah'}
                </button>
              </div>
            </div>

            {/* Daftar parkir */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Daftar Parkir ({eventSpots.length})
              </p>
              {eventSpots.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                  <p className="text-sm text-gray-400">Belum ada titik parkir untuk event ini.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {eventSpots.map(spot => (
                    <div key={spot.id}
                      className={`flex items-start justify-between px-3 py-2.5 rounded-lg border transition
                        ${editId === spot.id ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{spot.name}</p>
                        {spot.description && <p className="text-xs text-gray-500 truncate">{spot.description}</p>}
                        {spot.capacity != null && <p className="text-xs text-blue-700 font-medium">Kapasitas: {spot.capacity} kendaraan</p>}
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{spot.lat?.toFixed(5)}, {spot.lng?.toFixed(5)}</p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0 ml-3">
                        <button onClick={() => startEdit(spot)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition">
                          Edit
                        </button>
                        <button onClick={() => requestDelete(spot.id, spot.name)}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kanan: peta */}
          <div className="p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Klik peta untuk pin lokasi parkir
              <span className="text-gray-400 ml-1">(merah = event, biru = parkir)</span>
            </p>
            <MapContainer center={[event.lat, event.lng]} zoom={15} className="h-[520px] w-full rounded-lg border border-gray-200">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <MapPicker onPick={handleMapPick} />
              <Marker position={[event.lat, event.lng]}>
                <Popup><strong>Lokasi Event</strong><br />{event.name}</Popup>
              </Marker>
              {eventSpots.map(spot => (
                <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={blueIcon}>
                  <Popup><strong>{spot.name}</strong><br />{spot.description || '—'}<br />{spot.capacity != null ? `Kapasitas: ${spot.capacity}` : ''}</Popup>
                </Marker>
              ))}
              <Marker position={[marker.lat, marker.lng]} icon={blueIcon}>
                <Popup>Posisi parkir<br />{marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Komponen utama AdminEvent ────────────────────────────────────────────────
export default function AdminEvent() {
  const { toasts, push: toast } = useToast()

  const [events, setEvents]           = useState([])
  const [parkingSpots, setParkingSpots] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null) // { id, name }

  // Event form state
  const EMPTY_EVENT = { name: '', description: '', location: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingId, setEditingId]           = useState(null)
  const [markerPos, setMarkerPos]           = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
  const [formData, setFormData]             = useState(EMPTY_EVENT)
  const [savingEvent, setSavingEvent]       = useState(false)

  // Parking modal state
  const [showParkingModal, setShowParkingModal]               = useState(false)
  const [selectedEventForParking, setSelectedEventForParking] = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    try {
      setLoading(true)
      const [ev, pk] = await Promise.all([getEvents(), getParkingSpots()])
      setEvents(ev || [])
      setParkingSpots(pk || [])
      setError(null)
    } catch (err) {
      console.error('[AdminEvent] loadAll error:', err)
      setError('Tidak dapat terhubung ke server.')
      setEvents(mockEvents)
    } finally {
      setLoading(false)
    }
  }

  async function refreshParking() {
    try {
      const pk = await getParkingSpots()
      setParkingSpots(pk || [])
    } catch (err) {
      console.error('[AdminEvent] refreshParking error:', err)
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function openAdd() {
    setEditingId(null)
    setFormData(EMPTY_EVENT)
    setMarkerPos({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    setShowEventModal(true)
  }

  function openEdit(ev) {
    setEditingId(ev.id)
    setMarkerPos({ lat: ev.lat, lng: ev.lng })
    setFormData({
      name:        ev.name,
      description: ev.description || '',
      location:    ev.location    || '',
      start_time:  ev.start_time  ? ev.start_time.slice(0, 16) : '',
      end_time:    ev.end_time    ? ev.end_time.slice(0, 16)   : '',
      lat:         ev.lat,
      lng:         ev.lng,
    })
    setShowEventModal(true)
  }

  async function handleSubmit() {
    if (!formData.name.trim())  { toast('Nama event wajib diisi.', 'error'); return }
    if (!formData.start_time)   { toast('Waktu mulai wajib diisi.', 'error'); return }
    setSavingEvent(true)
    try {
      const payload = {
        name:        formData.name.trim(),
        description: formData.description || null,
        location:    formData.location    || null,
        start_time:  toIsoOrNull(formData.start_time),
        end_time:    toIsoOrNull(formData.end_time),
        lat:         parseFloat(formData.lat),
        lng:         parseFloat(formData.lng),
      }
      if (editingId) {
        const updated = await updateEvent(editingId, payload)
        setEvents(prev => prev.map(ev => ev.id === editingId ? updated : ev))
        toast(`Event "${payload.name}" berhasil diperbarui.`, 'success')
      } else {
        const created = await createEvent(payload)
        setEvents(prev => [...prev, created])
        toast(`Event "${payload.name}" berhasil ditambahkan.`, 'success')
      }
      setShowEventModal(false)
    } catch (err) {
      toast('Gagal menyimpan event: ' + (err?.message || 'Terjadi kesalahan'), 'error')
    } finally {
      setSavingEvent(false)
    }
  }

  function requestDeleteEvent(id, name) {
    setConfirmTarget({ id, name })
    setConfirmOpen(true)
  }

  async function confirmDeleteEvent() {
    if (!confirmTarget) return
    setConfirmOpen(false)
    try {
      await deleteEvent(confirmTarget.id)
      setEvents(prev => prev.filter(ev => ev.id !== confirmTarget.id))
      setParkingSpots(prev => prev.filter(s => String(s.event_id) !== String(confirmTarget.id)))
      toast(`Event "${confirmTarget.name}" berhasil dihapus.`, 'success')
    } catch (err) {
      toast('Gagal menghapus event: ' + (err?.message || 'Terjadi kesalahan'), 'error')
    } finally {
      setConfirmTarget(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toast — z-index sangat tinggi, selalu tampil di atas segalanya */}
      <ToastContainer toasts={toasts} />

      {/* Confirm dialog hapus event */}
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus Event?"
        message={confirmTarget ? `Event "${confirmTarget.name}" beserta semua titik parkirnya akan dihapus permanen.` : ''}
        onConfirm={confirmDeleteEvent}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null) }}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Event</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola event Grebeg Suro dan titik parkir terkait.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Event
        </button>
      </div>

      {/* Modals */}
      {showEventModal && (
        <EventModal
          editingId={editingId}
          formData={formData}
          markerPos={markerPos}
          onChange={handleChange}
          onMapPick={(pos) => { setMarkerPos(pos); setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng })) }}
          onSubmit={handleSubmit}
          onClose={() => setShowEventModal(false)}
          saving={savingEvent}
        />
      )}

      {showParkingModal && selectedEventForParking && (
        <ParkingModal
          event={selectedEventForParking}
          spots={parkingSpots}
          onClose={() => { setShowParkingModal(false); setSelectedEventForParking(null) }}
          onRefresh={refreshParking}
          toast={toast}
        />
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center gap-3 text-sm text-gray-400 py-14 justify-center">
          <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          Memuat data...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Nama Event</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Lokasi</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Waktu Mulai</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Parkir</th>
                <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map(ev => {
                const spotCount = parkingSpots.filter(s => String(s.event_id) === String(ev.id)).length
                return (
                  <tr key={ev.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{ev.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{ev.location || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {ev.start_time ? ev.start_time.replace('T', ' ').slice(0, 16) : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                        ${spotCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                        {spotCount} titik parkir
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedEventForParking(ev); setShowParkingModal(true) }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-md hover:bg-blue-50 transition">
                          Parkir
                        </button>
                        <button
                          onClick={() => openEdit(ev)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition">
                          Edit
                        </button>
                        <button
                          onClick={() => requestDeleteEvent(ev.id, ev.name)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-sm text-gray-400">
                    Belum ada event terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}