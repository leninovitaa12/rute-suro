import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const mockEventsData = [
  {
    id: 1,
    name: 'Kirab Pusaka Grebeg Suro',
    description: 'Kirab pusaka dari alun-alun ke Ponorogo',
    start_time: '2024-08-01T08:00:00',
    end_time: '2024-08-01T12:00:00',
    location: 'Alun-alun Ponorogo',
    lat: -7.871,
    lng: 111.462
  },
  {
    id: 2,
    name: 'Festival Reog',
    description: 'Pertunjukan reog di lapangan',
    start_time: '2024-08-02T10:00:00',
    end_time: '2024-08-02T16:00:00',
    location: 'Lapangan Kesehatan',
    lat: -7.873,
    lng: 111.465
  }
]

const mockClosuresData = [
  {
    id: 1,
    event_id: 1,
    type: 'CLOSED',
    reason: 'Jalur kirab pusaka',
    start_time: '2024-08-01T07:00:00',
    end_time: '2024-08-01T13:00:00',
    edges: [{
      polyline: [
        { lat: -7.871, lng: 111.462 },
        { lat: -7.872, lng: 111.463 },
        { lat: -7.873, lng: 111.464 }
      ]
    }],
    created_at: '2024-07-20T10:00:00'
  }
]

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

export default function AdminTraffic() {
  const navigate = useNavigate()
  const [closures, setClosures] = useState([])
  const [events, setEvents] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load closures and events from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [closuresData, eventsData] = await Promise.all([
          getClosures(false),
          getEvents()
        ])
        setClosures(closuresData || [])
        setEvents(eventsData || [])
        setError(null)
      } catch (err) {
        console.error('[AdminTraffic] Error loading data:', err)
        setError('Gagal memuat data dari backend')
        // Fallback to mock data if backend is unavailable
        setClosures([...mockClosuresData])
        setEvents([...mockEventsData])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])
  
  const [clForm, setClForm] = useState({
    id: null,
    event_id: '',
    type: 'CLOSED',
    reason: '',
    start_time: '',
    end_time: ''
  })

  const [pickA, setPickA] = useState(null)
  const [pickB, setPickB] = useState(null)
  const [derivedEdges, setDerivedEdges] = useState([])

  const resetPick = () => {
    setPickA(null)
    setPickB(null)
    setDerivedEdges([])
  }

  const deriveEdgesFromBackend = async () => {
    if (!pickA || !pickB) return setMsg('Klik 2 titik di peta untuk menentukan ruas (A lalu B).')
    
    try {
      setMsg('Mengambil edge dari backend...')
      const edges = await deriveEdges(pickA.lat, pickA.lng, pickB.lat, pickB.lng)
      setDerivedEdges(edges || [])
      setMsg(`Edges didapat: ${(edges || []).length}. Klik Simpan Rekayasa.`)
    } catch (err) {
      console.error('[AdminTraffic] Error deriving edges:', err)
      setMsg('Error: Gagal mengambil edge dari backend')
      // Fallback to mock edges
      const mockEdges = [{
        polyline: [
          { lat: pickA.lat, lng: pickA.lng },
          { lat: (pickA.lat + pickB.lat) / 2, lng: (pickA.lng + pickB.lng) / 2 },
          { lat: pickB.lat, lng: pickB.lng }
        ]
      }]
      setDerivedEdges(mockEdges)
    }
  }

  const saveClosure = async () => {
    setMsg('')
    if (!derivedEdges.length) return setMsg('Edges kosong. Klik 2 titik lalu Derive dulu.')

    const payload = {
      event_id: clForm.event_id ? parseInt(clForm.event_id) : null,
      type: clForm.type,
      reason: clForm.reason || null,
      start_time: toIsoOrNull(clForm.start_time),
      end_time: toIsoOrNull(clForm.end_time),
      edges: derivedEdges,
      created_at: new Date().toISOString()
    }

    try {
      if (clForm.id) {
        // Update existing closure
        const updated = await updateClosure(clForm.id, payload)
        setClosures(closures.map(c => c.id === clForm.id ? updated : c))
        setMsg('Rekayasa diperbarui.')
      } else {
        // Create new closure
        const created = await createClosure(payload)
        setClosures([created, ...closures])
        setMsg('Rekayasa tersimpan.')
      }
    } catch (err) {
      console.error('[AdminTraffic] Error saving closure:', err)
      setMsg('Error: Gagal menyimpan rekayasa ke backend')
    }

    setClForm({ id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' })
    resetPick()
  }

  const editClosure = (c) => {
    setClForm({
      id: c.id,
      event_id: c.event_id || '',
      type: c.type || 'CLOSED',
      reason: c.reason || '',
      start_time: c.start_time ? c.start_time.slice(0, 16) : '',
      end_time: c.end_time ? c.end_time.slice(0, 16) : ''
    })
    setDerivedEdges(c.edges || [])
  }

  const deleteClosureHandler = async (id) => {
    if (!confirm('Hapus rekayasa?')) return
    
    try {
      await deleteClosure(id)
      setClosures(closures.filter(c => c.id !== id))
      setMsg('Rekayasa dihapus.')
    } catch (err) {
      console.error('[AdminTraffic] Error deleting closure:', err)
      setMsg('Error: Gagal menghapus rekayasa dari backend')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rekayasa Lalu Lintas</h1>
        <p className="text-gray-600 mt-1">Kelola penutupan jalan dan pengalihan rute</p>
      </div>

      {msg && <div className={`p-4 rounded mb-6 ${msg.includes('dihapus') || msg.includes('tersimpan') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
        {msg}
      </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Event</label>
                <select 
                  value={clForm.event_id} 
                  onChange={e => setClForm({ ...clForm, event_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">-- Pilih Event (optional) --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Rekayasa</label>
                <select 
                  value={clForm.type} 
                  onChange={e => setClForm({ ...clForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="CLOSED">CLOSED (Jalan Ditutup)</option>
                  <option value="DIVERSION">DIVERSION (Dialihkan)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Rekayasa</label>
                <input 
                  type="text"
                  value={clForm.reason} 
                  onChange={e => setClForm({ ...clForm, reason: e.target.value })}
                  placeholder="Contoh: Kirab pusaka"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai</label>
                <input 
                  type="datetime-local" 
                  value={clForm.start_time} 
                  onChange={e => setClForm({ ...clForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai</label>
                <input 
                  type="datetime-local" 
                  value={clForm.end_time} 
                  onChange={e => setClForm({ ...clForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-xs text-blue-900 font-medium mb-2">Pilih ruas jalan:</p>
                <p className="text-xs text-blue-800">Klik 2 titik di peta (A lalu B), lalu klik Derive.</p>
              </div>

              <div className="bg-gray-100 p-3 rounded space-y-1">
                <p className="text-xs font-medium text-gray-900">
                  <b>Titik A:</b> {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}
                </p>
                <p className="text-xs font-medium text-gray-900">
                  <b>Titik B:</b> {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}
                </p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={resetPick}
                  className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all text-sm font-medium"
                >
                  Reset
                </button>
                <button 
                  onClick={deriveEdgesFromBackend}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm font-medium"
                >
                  Derive
                </button>
              </div>

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-xs text-green-900 font-medium"><b>Edges terdeteksi:</b> {derivedEdges.length}</p>
              </div>

              <button 
                onClick={saveClosure}
                className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-all duration-300"
              >
                Simpan Rekayasa
              </button>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '500px', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapPicker onPick={(p) => {
              if (!pickA) setPickA(p)
              else if (!pickB) setPickB(p)
              else { setPickA(p); setPickB(null); setDerivedEdges([]) }
            }} />

            {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup>Titik A (awal)</Popup></Marker>}
            {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup>Titik B (akhir)</Popup></Marker>}

            {derivedEdges.map((e, idx) => (
              <Polyline key={'d' + idx} positions={e.polyline.map(p => [p.lat, p.lng])}
                pathOptions={{ color: clForm.type === 'CLOSED' ? 'red' : 'orange', weight: 6, opacity: 0.8 }} />
            ))}

            {closures.flatMap(c => (c.edges || []).map((e, idx) => (
              <Polyline key={c.id + '_' + idx} positions={e.polyline.map(p => [p.lat, p.lng])}
                pathOptions={{ color: c.type === 'CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                <Popup>
                  <b>{c.type}</b><br/>
                  {c.reason || '-'}<br/>
                  <button 
                    onClick={() => editClosure(c)}
                    className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteClosureHandler(c.id)}
                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all"
                  >
                    Hapus
                  </button>
                </Popup>
              </Polyline>
            )))}
          </MapContainer>
        </div>
      </div>

      {/* Daftar Rekayasa */}
      <div className="mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Histori Rekayasa Lalu Lintas</h2>
          {closures.length === 0 ? (
            <p className="text-gray-600">Belum ada rekayasa lalu lintas yang terdaftar.</p>
          ) : (
            <div className="space-y-3">
              {closures.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                  <div>
                    <p className="font-bold text-gray-900">{c.type} {c.reason ? `- ${c.reason}` : ''}</p>
                    <p className="text-sm text-gray-600">Edges: {c.edges?.length || 0}</p>
                    {c.start_time && <p className="text-sm text-gray-600">{dayjs(c.start_time).format('DD/MM HH:mm')}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => editClosure(c)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteClosureHandler(c.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-all"
                    >
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
