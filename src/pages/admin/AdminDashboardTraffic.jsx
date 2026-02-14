import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Mock data untuk demo
const mockEventsData = [
  {
    id: 1,
    name: 'Kirab Pusaka Grebeg Suro',
    description: 'Kirab pusaka dari alun-alun ke Ponorogo',
    start_time: '2024-08-01T08:00:00',
    end_time: '2024-08-01T12:00:00',
    lat: -7.871,
    lng: 111.462
  },
  {
    id: 2,
    name: 'Festival Reog',
    description: 'Pertunjukan reog di lapangan',
    start_time: '2024-08-02T10:00:00',
    end_time: '2024-08-02T16:00:00',
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
    edges: [
      {
        polyline: [
          { lat: -7.871, lng: 111.462 },
          { lat: -7.872, lng: 111.463 },
          { lat: -7.873, lng: 111.464 }
        ]
      }
    ],
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

export default function AdminDashboard({ section = 'traffic' }) {
  const navigate = useNavigate()
  const [events, setEvents] = React.useState([...mockEventsData])
  const [closures, setClosures] = React.useState([...mockClosuresData])
  const [msg, setMsg] = React.useState('')

  // Check authentication
  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn')
    if (isLoggedIn !== 'true') {
      navigate('/admin/login')
    }
  }, [navigate])

  // Logout function
  function handleLogout() {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    navigate('/admin/login')
  }

  // ===== TRAFFIC SECTION =====
  if (section === 'traffic') {
    const [clForm, setClForm] = React.useState({
      id: null,
      event_id: '',
      type: 'CLOSED',
      reason: '',
      start_time: '',
      end_time: ''
    })

    const [pickA, setPickA] = React.useState(null)
    const [pickB, setPickB] = React.useState(null)
    const [derivedEdges, setDerivedEdges] = React.useState([])

    function resetPick() {
      setPickA(null)
      setPickB(null)
      setDerivedEdges([])
    }

    async function deriveEdges() {
      if (!pickA || !pickB) return setMsg('Klik 2 titik di peta untuk menentukan ruas (A lalu B).')
      setMsg('Mengambil edge (demo mode)...')
      const mockEdges = [{
        polyline: [
          { lat: pickA.lat, lng: pickA.lng },
          { lat: (pickA.lat + pickB.lat) / 2, lng: (pickA.lng + pickB.lng) / 2 },
          { lat: pickB.lat, lng: pickB.lng }
        ]
      }]
      setDerivedEdges(mockEdges)
      setMsg(`Edges didapat: ${mockEdges.length} (demo mode). Klik Simpan Rekayasa.`)
    }

    async function saveClosure() {
      setMsg('')
      if (!derivedEdges.length) return setMsg('Edges kosong. Klik 2 titik lalu Derive dulu.')

      const payload = {
        id: clForm.id ?? Date.now(),
        event_id: clForm.event_id || null,
        type: clForm.type,
        reason: clForm.reason || null,
        start_time: toIsoOrNull(clForm.start_time),
        end_time: toIsoOrNull(clForm.end_time),
        edges: derivedEdges,
        created_at: new Date().toISOString()
      }

      if (clForm.id) {
        setClosures(closures.map(c => c.id === clForm.id ? payload : c))
      } else {
        setClosures([payload, ...closures])
      }

      setClForm({ id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' })
      resetPick()
      setMsg('Rekayasa tersimpan (demo mode).')
    }

    function editClosure(c) {
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

    async function deleteClosure(id) {
      if (!confirm('Hapus rekayasa?')) return
      setClosures(closures.filter(c => c.id !== id))
      setMsg('Rekayasa dihapus (demo mode).')
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
            <div className="bg-white rounded-lg border border-border p-6 shadow-md">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Terkait Event</label>
                  <select 
                    value={clForm.event_id} 
                    onChange={e => setClForm({ ...clForm, event_id: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  >
                    <option value="">-- Pilih Event (optional) --</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Tipe Rekayasa</label>
                  <select 
                    value={clForm.type} 
                    onChange={e => setClForm({ ...clForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  >
                    <option value="CLOSED">🚫 CLOSED (Jalan Ditutup)</option>
                    <option value="DIVERSION">🔀 DIVERSION (Dialihkan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Alasan Rekayasa</label>
                  <input 
                    type="text"
                    value={clForm.reason} 
                    onChange={e => setClForm({ ...clForm, reason: e.target.value })}
                    placeholder="Contoh: Kirab pusaka"
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Waktu Mulai</label>
                  <input 
                    type="datetime-local" 
                    value={clForm.start_time} 
                    onChange={e => setClForm({ ...clForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Waktu Selesai</label>
                  <input 
                    type="datetime-local" 
                    value={clForm.end_time} 
                    onChange={e => setClForm({ ...clForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-900 font-medium mb-2">🗺️ Pilih ruas jalan:</p>
                  <p className="text-xs text-blue-800">Klik 2 titik di peta (A lalu B), lalu klik Derive.</p>
                </div>

                <div className="bg-gray-100 p-3 rounded space-y-1">
                  <p className="text-xs font-medium text-text-primary">
                    <b>Titik A:</b> {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}
                  </p>
                  <p className="text-xs font-medium text-text-primary">
                    <b>Titik B:</b> {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={resetPick}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-all text-sm font-medium"
                  >
                    🔄 Reset
                  </button>
                  <button 
                    onClick={deriveEdges}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-sm font-medium"
                  >
                    🔍 Derive
                  </button>
                </div>

                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-xs text-green-900 font-medium"><b>Edges terdeteksi:</b> {derivedEdges.length}</p>
                </div>

                <button 
                  onClick={saveClosure}
                  className="w-full px-4 py-3 bg-primary text-white font-bold rounded hover:bg-primary-dark hover:shadow-hover-md hover:-translate-y-1 transition-all duration-300"
                >
                  💾 Simpan Rekayasa
                </button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-border overflow-hidden shadow-md">
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '500px', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker onPick={(p) => {
                if (!pickA) setPickA(p)
                else if (!pickB) setPickB(p)
                else { setPickA(p); setPickB(null); setDerivedEdges([]) }
              }} />

              {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup>📍 Titik A (awal)</Popup></Marker>}
              {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup>📍 Titik B (akhir)</Popup></Marker>}

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
                      onClick={() => deleteClosure(c.id)}
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
          <div className="bg-white rounded-lg border border-border p-6 shadow-md">
            <h2 className="text-xl font-bold text-text-primary mb-4">📋 Histori Rekayasa Lalu Lintas</h2>
            {closures.length === 0 ? (
              <p className="text-text-secondary">Belum ada rekayasa lalu lintas yang terdaftar.</p>
            ) : (
              <div className="space-y-3">
                {closures.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-border hover:border-primary hover:shadow-md transition-all">
                    <div>
                      <p className="font-bold text-text-primary">{c.type === 'CLOSED' ? '🚫' : '🔀'} {c.type} {c.reason ? `- ${c.reason}` : ''}</p>
                      <p className="text-sm text-text-secondary">🛣️ Edges: {c.edges?.length || 0}</p>
                      {c.start_time && <p className="text-sm text-text-secondary">🕐 {dayjs(c.start_time).format('DD/MM HH:mm')}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => editClosure(c)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteClosure(c.id)}
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

  // ===== EVENTS SECTION =====
  if (section === 'events') {
    const [evForm, setEvForm] = React.useState({
      id: null,
      name: '',
      description: '',
      start_time: '',
      end_time: '',
      lat: DEFAULT_CENTER[0],
      lng: DEFAULT_CENTER[1],
    })

    async function saveEvent() {
      setMsg('')
      if (!evForm.name) return setMsg('Nama event wajib')

      const payload = {
        id: evForm.id ?? Date.now(),
        name: evForm.name,
        description: evForm.description || null,
        start_time: toIsoOrNull(evForm.start_time),
        end_time: toIsoOrNull(evForm.end_time),
        lat: Number(evForm.lat),
        lng: Number(evForm.lng),
      }

      if (evForm.id) {
        setEvents(events.map(e => e.id === evForm.id ? payload : e))
      } else {
        setEvents([...events, payload])
      }

      setEvForm({
        id: null, name: '', description: '', start_time: '', end_time: '',
        lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1]
      })
      setMsg('Event tersimpan (demo mode).')
    }

    function editEvent(ev) {
      setEvForm({
        id: ev.id,
        name: ev.name || '',
        description: ev.description || '',
        start_time: ev.start_time ? ev.start_time.slice(0, 16) : '',
        end_time: ev.end_time ? ev.end_time.slice(0, 16) : '',
        lat: ev.lat,
        lng: ev.lng
      })
    }

    async function deleteEvent(id) {
      if (!confirm('Hapus event?')) return
      setEvents(events.filter(e => e.id !== id))
      setMsg('Event dihapus (demo mode).')
    }

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Event</h1>
          <p className="text-gray-600 mt-1">Tambah dan kelola event Grebeg Suro</p>
        </div>

        {msg && <div className={`p-4 rounded mb-6 ${msg.includes('dihapus') || msg.includes('tersimpan') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          {msg}
        </div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-border p-6 shadow-md sticky top-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {evForm.id ? 'Edit Event' : 'Tambah Event Baru'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Nama Event</label>
                  <input 
                    value={evForm.name} 
                    onChange={e => setEvForm({ ...evForm, name: e.target.value })}
                    placeholder="Contoh: Kirab Pusaka"
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Deskripsi</label>
                  <input 
                    value={evForm.description} 
                    onChange={e => setEvForm({ ...evForm, description: e.target.value })}
                    placeholder="Detail acara"
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Waktu Mulai</label>
                  <input 
                    type="datetime-local" 
                    value={evForm.start_time} 
                    onChange={e => setEvForm({ ...evForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Waktu Selesai</label>
                  <input 
                    type="datetime-local" 
                    value={evForm.end_time} 
                    onChange={e => setEvForm({ ...evForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-10 transition-all"
                  />
                </div>

                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-xs text-blue-900 font-medium">Koordinat: {Number(evForm.lat).toFixed(5)}, {Number(evForm.lng).toFixed(5)}</p>
                  <p className="text-xs text-blue-800 mt-1">Klik peta di samping untuk ubah lokasi</p>
                </div>

                <button 
                  onClick={saveEvent}
                  className="w-full px-4 py-3 bg-primary text-white font-bold rounded hover:bg-primary-dark hover:shadow-hover-md hover:-translate-y-1 transition-all duration-300"
                >
                  💾 Simpan Event
                </button>
                <button 
                  onClick={() => setEvForm({ id: null, name: '', description: '', start_time: '', end_time: '', lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded hover:bg-gray-300 transition-all"
                >
                  🔄 Reset Form
                </button>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-border overflow-hidden shadow-md">
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '500px', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker onPick={(p) => setEvForm({ ...evForm, lat: p.lat, lng: p.lng })} />

              <Marker position={[evForm.lat, evForm.lng]}>
                <Popup>📍 Lokasi Event (sedang diedit)</Popup>
              </Marker>

              {events.map(e => (
                <Marker key={e.id} position={[e.lat, e.lng]}>
                  <Popup>
                    <b>{e.name}</b><br/>
                    {e.description && <><small>{e.description}</small><br/></>}
                    {e.start_time ? dayjs(e.start_time).format('DD/MM/YYYY HH:mm') : ''}<br/>
                    <button 
                      onClick={() => editEvent(e)}
                      className="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-all"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteEvent(e.id)}
                      className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-all"
                    >
                      Hapus
                    </button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Daftar Event */}
        <div className="mt-8">
          <div className="bg-white rounded-lg border border-border p-6 shadow-md">
            <h2 className="text-xl font-bold text-text-primary mb-4">📋 Daftar Event yang Terdaftar</h2>
            {events.length === 0 ? (
              <p className="text-text-secondary">Belum ada event.</p>
            ) : (
              <div className="space-y-3">
                {events.map(ev => (
                  <div key={ev.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-border hover:border-primary hover:shadow-md transition-all">
                    <div className="flex-1">
                      <p className="font-bold text-text-primary">{ev.name}</p>
                      <p className="text-sm text-text-secondary">{ev.description}</p>
                      <p className="text-sm text-text-secondary">📍 {ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</p>
                      {ev.start_time && <p className="text-sm text-text-secondary">🕐 {dayjs(ev.start_time).format('DD/MM/YYYY HH:mm')}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => editEvent(ev)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteEvent(ev.id)}
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

  // ===== DEFAULT / CONTENT SECTIONS =====
  const contentSections = {
    sejarah: {
      title: 'Manajemen Konten - Sejarah',
      description: 'Kelola halaman sejarah Grebeg Suro',
      icon: '📖'
    },
    jadwal: {
      title: 'Manajemen Konten - Jadwal',
      description: 'Kelola jadwal acara Grebeg Suro',
      icon: '🗓️'
    },
    tentang: {
      title: 'Manajemen Konten - Tentang',
      description: 'Kelola halaman tentang Rute Suro',
      icon: 'ℹ️'
    }
  }

  const content = contentSections[section] || contentSections.sejarah

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{content.icon} {content.title}</h1>
          <p className="text-text-secondary mt-1">{content.description}</p>
        </div>
        <button onClick={handleLogout} className="px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-all duration-300">
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border p-8 shadow-md">
        <div className="text-center py-12">
          <p className="text-lg text-text-secondary">Menu manajemen konten untuk {section} sedang dalam pengembangan.</p>
          <p className="text-text-secondary mt-2">Fitur CRUD akan ditambahkan di tahap berikutnya.</p>
        </div>
      </div>
    </div>
  )
}
