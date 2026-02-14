import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { 
  getEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent 
} from '../../lib/backendApi'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const mockEventsData = [
  {
    id: 1,
    name: 'Kirab Pusaka Grebeg Suro',
    description: 'Kirab pusaka dari alun-alun ke Ponorogo',
    location: 'Alun-alun Ponorogo',
    start_time: '2024-08-01T08:00:00',
    end_time: '2024-08-01T12:00:00',
    lat: -7.871,
    lng: 111.462
  },
  {
    id: 2,
    name: 'Festival Reog',
    description: 'Pertunjukan reog di lapangan',
    location: 'Lapangan Kesehatan',
    start_time: '2024-08-02T10:00:00',
    end_time: '2024-08-02T16:00:00',
    lat: -7.873,
    lng: 111.465
  }
]

// ✅ helper ISO (tanpa mengubah tampilan)
function toIsoOrNull(dtLocal) {
  if (!dtLocal) return null
  const d = new Date(dtLocal)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

function MapPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

export default function AdminEvent() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [markerPos, setMarkerPos] = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1]
  })

  // Load events from backend on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const eventsData = await getEvents()
        setEvents(eventsData || [])
        setError(null)
      } catch (err) {
        console.error('[AdminEvent] Error loading events:', err)
        setError('Gagal memuat events dari backend')
        // Fallback to mock data
        setEvents(mockEventsData)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', location: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    setMarkerPos({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    setShowForm(true)
  }

  const handleEditClick = (event) => {
    setEditingId(event.id)
    setMarkerPos({ lat: event.lat, lng: event.lng })
    setFormData({
      name: event.name,
      description: event.description || '',
      location: event.location || '',
      start_time: event.start_time ? event.start_time.slice(0, 16) : '',
      end_time: event.end_time ? event.end_time.slice(0, 16) : '',
      lat: event.lat,
      lng: event.lng
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.start_time) {
      alert('Nama event dan waktu mulai wajib diisi!')
      return
    }

    try {
      // ✅ FIX: konversi time -> ISO, biar Supabase timestamptz aman
      const payload = {
        name: formData.name,
        description: formData.description || null,
        location: formData.location || null,
        start_time: toIsoOrNull(formData.start_time),
        end_time: toIsoOrNull(formData.end_time),
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      }

      if (editingId) {
        const updated = await updateEvent(editingId, payload)
        setEvents(events.map(ev => ev.id === editingId ? updated : ev))
      } else {
        const created = await createEvent(payload)
        setEvents([...events, created])
      }

      setShowForm(false)
      setFormData({ name: '', description: '', location: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
      setMarkerPos({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    } catch (err) {
      console.error('[AdminEvent] Error saving event:', err)
      // ✅ error lebih jelas tanpa ubah layout
      alert('Error: ' + (err?.message || 'Gagal menyimpan event ke backend'))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Hapus event ini?')) {
      try {
        await deleteEvent(id)
        setEvents(events.filter(ev => ev.id !== id))
      } catch (err) {
        console.error('[AdminEvent] Error deleting event:', err)
        alert('Error: ' + (err?.message || 'Gagal menghapus event dari backend'))
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Event</h1>
        <p className="text-gray-600 mt-1">Kelola event Grebeg Suro dan acara budaya dengan menandai lokasi di peta</p>
      </div>

      <div className="mb-8">
        <button
          onClick={handleAddClick}
          className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Event Baru
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Event' : 'Tambah Event Baru'}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nama Event</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Nama event" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Deskripsi event" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" rows="3" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi</label>
                  <input type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="Nama lokasi" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Waktu Mulai</label>
                  <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Waktu Selesai</label>
                  <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-900 font-bold">📍 Koordinat Lokasi</p>
                  <p className="text-xs text-blue-800">Lat: {markerPos.lat.toFixed(5)}</p>
                  <p className="text-xs text-blue-800">Lng: {markerPos.lng.toFixed(5)}</p>
                  <p className="text-xs text-blue-600 mt-1">Klik di peta untuk mengubah lokasi</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all">
                    Batal
                  </button>
                  <button type="submit" onClick={handleSubmit} className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all">
                    Simpan Event
                  </button>
                </div>
              </div>

              {/* Map Section */}
              <div className="lg:col-span-2">
                <MapContainer center={[markerPos.lat, markerPos.lng]} zoom={14} className="h-96 w-full rounded-lg border border-gray-200">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <MapPicker onPick={(pos) => {
                    setMarkerPos(pos)
                    setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }))
                  }} />
                  <Marker position={[markerPos.lat, markerPos.lng]}>
                    <Popup>
                      Lokasi Event<br />
                      Lat: {markerPos.lat.toFixed(5)}<br />
                      Lng: {markerPos.lng.toFixed(5)}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600 font-bold">{error}</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nama Event</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Lokasi</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Waktu Mulai</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{ev.name}</td>
                  <td className="px-6 py-4 text-gray-700">{ev.location || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{ev.start_time ? ev.start_time.replace('T', ' ').slice(0, 16) : '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(ev)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-bold">Edit</button>
                      <button onClick={() => handleDelete(ev.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-bold">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500">Belum ada event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
