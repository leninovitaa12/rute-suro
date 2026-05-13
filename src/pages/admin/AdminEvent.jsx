import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import Swal from 'sweetalert2'

// ─── SweetAlert2 z-index fix (harus tampil di atas modal z-99999) ──────────────
const SWAL_Z = {
  didOpen: () => {
    const el = document.querySelector('.swal2-container')
    if (el) el.style.zIndex = '999999'
  },
}

// ─── SweetAlert2 helpers ────────────────────────────────────────────────────────
const swalOK  = (title, text) => Swal.fire({ ...SWAL_Z, icon: 'success', title, text, timer: 3000, timerProgressBar: true, confirmButtonColor: '#16a34a', confirmButtonText: 'OK' })
const swalErr = (title, text) => Swal.fire({ ...SWAL_Z, icon: 'error',   title, text: text || 'Terjadi kesalahan.', confirmButtonColor: '#dc2626', confirmButtonText: 'Tutup' })
const swalDel = (name)        => Swal.fire({ ...SWAL_Z, icon: 'warning', title: 'Hapus data ini?', html: `<span style="color:#374151;font-size:14px"><b>${name}</b> akan dihapus permanen.</span>`, showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true })

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
  // Lock body scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const modal = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Kotak modal */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: 960,
        height: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>
            {editingId ? 'Edit Event' : 'Tambah Event Baru'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9ca3af', fontSize: 18, lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Panel kiri: form */}
          <div style={{
            width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column',
            borderRight: '1px solid #f0f0f0',
          }}>
            {/* scroll area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0 20px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>Nama Event <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={onChange}
                  placeholder="Nama event" style={inpStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>Deskripsi</label>
                <textarea name="description" value={formData.description} onChange={onChange}
                  placeholder="Deskripsi singkat" rows={3}
                  style={{ ...inpStyle, resize: 'vertical', minHeight: 70 }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>Lokasi</label>
                <input type="text" name="location" value={formData.location} onChange={onChange}
                  placeholder="Nama lokasi" style={inpStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>Waktu Mulai <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="datetime-local" name="start_time" value={formData.start_time}
                  onChange={onChange} style={inpStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lblStyle}>Waktu Selesai</label>
                <input type="datetime-local" name="end_time" value={formData.end_time}
                  onChange={onChange} style={inpStyle} />
              </div>
              <div style={{
                background: '#f9fafb', borderRadius: 8, padding: '10px 12px',
                border: '1px solid #e5e7eb', marginBottom: 8,
              }}>
                <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Koordinat Event</p>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontFamily: 'monospace', color: '#374151' }}>
                  {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: '#9ca3af' }}>Klik peta untuk ubah lokasi pin</p>
              </div>
            </div>

            {/* Tombol — sticky bawah */}
            <div style={{
              flexShrink: 0, padding: '14px 20px',
              borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8,
            }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600,
                color: '#374151', background: '#f3f4f6', border: 'none',
                borderRadius: 8, cursor: 'pointer',
              }}>Batal</button>
              <button type="button" onClick={onSubmit} disabled={saving} style={{
                flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600,
                color: '#fff', background: saving ? '#9ca3af' : '#111827',
                border: 'none', borderRadius: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Menyimpan...' : 'Simpan Event'}
              </button>
            </div>
          </div>

          {/* Panel kanan: peta */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 14, minWidth: 0 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: '#6b7280', flexShrink: 0 }}>
              Klik peta untuk pin lokasi event
            </p>
            <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <MapContainer
                center={[markerPos.lat, markerPos.lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <MapPicker onPick={onMapPick} />
                <Marker position={[markerPos.lat, markerPos.lng]}>
                  <Popup>
                    Lokasi Event<br />
                    {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render ke document.body agar bebas dari stacking context navbar
  return createPortal(modal, document.body)
}

// ── Style helpers untuk modal ──────────────────────────────────────────────────
const lblStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4,
}
const inpStyle = {
  width: '100%', padding: '8px 10px', fontSize: 13, color: '#111827',
  border: '1px solid #e5e7eb', borderRadius: 8, outline: 'none',
  background: '#fff', boxSizing: 'border-box',
}

// ─── Modal: Kelola Parkir ─────────────────────────────────────────────────────
function ParkingModal({ event, spots, onClose, onRefresh }) {
  const EMPTY = { name: '', description: '', capacity: '', lat: event.lat, lng: event.lng }
  const [form, setForm]     = useState(EMPTY)
  const [marker, setMarker] = useState({ lat: event.lat, lng: event.lng })
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

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
    if (!form.name.trim()) { swalErr('Validasi Gagal', 'Nama titik parkir wajib diisi.'); return }
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
        await swalOK('Berhasil Diperbarui!', `Titik parkir "${form.name}" berhasil diperbarui.`)
      } else {
        await createParkingSpot(payload)
        await swalOK('Berhasil Ditambahkan!', `Titik parkir "${form.name}" berhasil ditambahkan.`)
      }
      resetForm()
      await onRefresh()
    } catch (err) {
      swalErr('Gagal Menyimpan', err?.response?.data?.detail || err?.message || 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  async function requestDelete(id, name) {
    const result = await swalDel(name)
    if (!result.isConfirmed) return
    try {
      await deleteParkingSpot(id)
      await swalOK('Berhasil Dihapus!', `Titik parkir "${name}" berhasil dihapus.`)
      if (editId === id) resetForm()
      await onRefresh()
    } catch (err) {
      swalErr('Gagal Menghapus', err?.response?.data?.detail || err?.message || 'Terjadi kesalahan.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[500] flex items-center justify-center p-4">
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

  const [events, setEvents]           = useState([])
  const [parkingSpots, setParkingSpots] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)

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
    if (!formData.name.trim())  { swalErr('Validasi Gagal', 'Nama event wajib diisi.'); return }
    if (!formData.start_time)   { swalErr('Validasi Gagal', 'Waktu mulai wajib diisi.'); return }
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
        setShowEventModal(false)
        await swalOK('Berhasil Diperbarui!', `Event "${payload.name}" berhasil diperbarui.`)
      } else {
        const created = await createEvent(payload)
        setEvents(prev => [...prev, created])
        setShowEventModal(false)
        await swalOK('Berhasil Ditambahkan!', `Event "${payload.name}" berhasil ditambahkan.`)
      }
    } catch (err) {
      swalErr('Gagal Menyimpan Event', err?.response?.data?.detail || err?.message || 'Terjadi kesalahan.')
    } finally {
      setSavingEvent(false)
    }
  }

  async function requestDeleteEvent(id, name) {
    const result = await swalDel(name)
    if (!result.isConfirmed) return
    try {
      await deleteEvent(id)
      setEvents(prev => prev.filter(ev => ev.id !== id))
      setParkingSpots(prev => prev.filter(s => String(s.event_id) !== String(id)))
      await swalOK('Berhasil Dihapus!', `Event "${name}" berhasil dihapus.`)
    } catch (err) {
      swalErr('Gagal Menghapus Event', err?.response?.data?.detail || err?.message || 'Terjadi kesalahan.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
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