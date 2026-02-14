import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

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

function MapPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  })
  return null
}

export default function AdminEvent() {
  const [events, setEvents] = useState([...mockEventsData])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [markerPos, setMarkerPos] = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    start_time: '',
    end_time: '',
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1]
  })

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleMapClick = (pos) => {
    setMarkerPos(pos)
    setFormData({ ...formData, lat: pos.lat, lng: pos.lng })
  }

  const handleAddClick = () => {
    setEditingId(null)
    setMarkerPos({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    setFormData({ name: '', description: '', location: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.start_time) {
      alert('Nama event dan waktu mulai wajib diisi!')
      return
    }

    if (editingId) {
      setEvents(events.map(ev => ev.id === editingId ? { ...formData, id: editingId, lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) } : ev))
    } else {
      setEvents([...events, { ...formData, id: Date.now(), lat: parseFloat(formData.lat), lng: parseFloat(formData.lng) }])
    }

    setShowForm(false)
    setFormData({ name: '', description: '', location: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
    setMarkerPos({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })
  }

  const handleDelete = (id) => {
    if (confirm('Hapus event ini?')) {
      setEvents(events.filter(ev => ev.id !== id))
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
                  <textarea name="description" value={formData.description} onChange={handleFormChange} placeholder="Deskripsi event" rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
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
                  <p className="text-xs text-blue-800 mt-1"><b>Lat:</b> {markerPos.lat.toFixed(5)}</p>
                  <p className="text-xs text-blue-800"><b>Lng:</b> {markerPos.lng.toFixed(5)}</p>
                  <p className="text-xs text-blue-800 mt-2">Klik di peta untuk mengubah lokasi</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">
                    Simpan Event
                  </button>
                </div>
              </div>

              {/* Map Section */}
              <div className="lg:col-span-2 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <MapContainer center={[markerPos.lat, markerPos.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapPicker onPick={handleMapClick} />
                  {markerPos && <Marker position={[markerPos.lat, markerPos.lng]}><Popup>📍 Lokasi Event</Popup></Marker>}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nama Event</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Lokasi</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Waktu Mulai</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada event. Tambahkan yang baru untuk memulai.</td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{event.location || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.start_time).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button onClick={() => handleEditClick(event)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded font-bold hover:bg-blue-100">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded font-bold hover:bg-red-100">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
