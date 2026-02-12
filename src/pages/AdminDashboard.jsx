import React from 'react'
import { useNavigate } from 'react-router-dom'
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

// Mock data untuk demo (tanpa Supabase)
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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = React.useState('events')
  const [events, setEvents] = React.useState([...mockEventsData])
  const [closures, setClosures] = React.useState([...mockClosuresData])
  const [msg, setMsg] = React.useState('')

  // Check authentication
  React.useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn')
    if (isLoggedIn !== 'true') {
      navigate('/admin')
    }
  }, [navigate])

  // Logout function
  function handleLogout() {
    localStorage.removeItem('adminLoggedIn')
    localStorage.removeItem('adminEmail')
    navigate('/admin')
  }

  async function reload() {
    setMsg('Data loaded (demo mode)')
  }

  React.useEffect(() => { reload() }, [])

  // =========================
  // EVENT FORM
  // =========================
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
    setTab('events')
  }

  async function deleteEvent(id) {
    if (!confirm('Hapus event?')) return
    setEvents(events.filter(e => e.id !== id))
    setMsg('Event dihapus (demo mode).')
  }

  // =========================
  // CLOSURE / REKAYASA FORM
  // =========================
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

    setClForm({ id:null, event_id:'', type:'CLOSED', reason:'', start_time:'', end_time:'' })
    resetPick()
    setMsg('Rekayasa tersimpan (demo mode).')
  }

  function editClosure(c) {
    setClForm({
      id: c.id,
      event_id: c.event_id || '',
      type: c.type || 'CLOSED',
      reason: c.reason || '',
      start_time: c.start_time ? c.start_time.slice(0,16) : '',
      end_time: c.end_time ? c.end_time.slice(0,16) : ''
    })
    setDerivedEdges(c.edges || [])
    setTab('closures')
  }

  async function deleteClosure(id) {
    if (!confirm('Hapus rekayasa?')) return
    setClosures(closures.filter(c => c.id !== id))
    setMsg('Rekayasa dihapus (demo mode).')
  }

  return (
    <div className="container py-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold">Admin Panel - Dashboard Rekayasa Lalu Lintas</h3>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-text-secondary">
            {localStorage.getItem('adminEmail')}
          </span>
          <button className="btn secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button className={tab === 'events' ? 'btn' : 'btn secondary'} onClick={() => setTab('events')}>Data Event</button>
        <button className={tab === 'closures' ? 'btn' : 'btn secondary'} onClick={() => setTab('closures')}>Rekayasa Lalu Lintas</button>
      </div>

      {msg && <p className="text-sm text-error px-4 py-3 bg-red-50 rounded-lg border border-red-200 mb-6">{msg}</p>}

      {tab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h4 className="text-xl font-bold mt-0 mb-4">{evForm.id ? 'Edit Event' : 'Tambah Event Baru'}</h4>

              <label className="label">Nama Event</label>
              <input className="input mb-4" value={evForm.name} onChange={e=>setEvForm({...evForm, name:e.target.value})} placeholder="Contoh: Kirab Pusaka" />

              <label className="label">Deskripsi</label>
              <input className="input mb-4" value={evForm.description} onChange={e=>setEvForm({...evForm, description:e.target.value})} placeholder="Detail acara" />

              <label className="label">Waktu Mulai</label>
              <input className="input mb-4" type="datetime-local" value={evForm.start_time} onChange={e=>setEvForm({...evForm, start_time:e.target.value})} />

              <label className="label">Waktu Selesai</label>
              <input className="input mb-4" type="datetime-local" value={evForm.end_time} onChange={e=>setEvForm({...evForm, end_time:e.target.value})} />

              <hr />
              <div className="text-sm text-text-secondary mb-2"><b>Set lokasi event:</b> klik peta di kanan</div>
              <div className="text-sm text-text-secondary mb-4">Koordinat: {Number(evForm.lat).toFixed(5)}, {Number(evForm.lng).toFixed(5)}</div>

              <div className="flex gap-3 mb-4">
                <button className="btn flex-1" onClick={saveEvent}>💾 Simpan Event</button>
                <button className="btn secondary" onClick={()=>{
                  setEvForm({ id:null, name:'', description:'', start_time:'', end_time:'', lat:DEFAULT_CENTER[0], lng:DEFAULT_CENTER[1] })
                }}>🔄 Reset</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'60vh', width:'100%'}}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapPicker onPick={(p)=>setEvForm({...evForm, lat:p.lat, lng:p.lng})} />

                <Marker position={[evForm.lat, evForm.lng]}>
                  <Popup>📍 Lokasi Event (sedang diedit)</Popup>
                </Marker>

                {events.map(e => (
                  <Marker key={e.id} position={[e.lat, e.lng]}>
                    <Popup>
                      <b>{e.name}</b><br/>
                      {e.description && <><small>{e.description}</small><br/></>}
                      {e.start_time ? dayjs(e.start_time).format('DD/MM/YYYY HH:mm') : ''}<br/>
                      <button className="btn secondary text-xs mt-2 mr-1" onClick={()=>editEvent(e)}>Edit</button>
                      <button className="btn secondary text-xs mt-2" onClick={()=>deleteEvent(e.id)}>Hapus</button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="card">
              <h4 className="text-xl font-bold mt-0 mb-4">📋 Daftar Event yang Terdaftar</h4>
              {events.length === 0 && <div className="text-sm text-text-secondary">Belum ada event.</div>}
              <div className="space-y-3">
                {events.map(ev => (
                  <div key={ev.id} className="flex justify-between items-start gap-4 p-3 border border-border rounded-lg bg-secondary">
                    <div>
                      <b className="text-text-primary">{ev.name}</b>
                      <div className="text-sm text-text-secondary">{ev.description}</div>
                      <div className="text-xs text-text-secondary">📍 {ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</div>
                      {ev.start_time && <div className="text-xs text-text-secondary">🕐 {dayjs(ev.start_time).format('DD/MM/YYYY HH:mm')}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn secondary text-xs" onClick={()=>editEvent(ev)}>Edit</button>
                      <button className="btn secondary text-xs" onClick={()=>deleteEvent(ev.id)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'closures' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <h4 className="text-xl font-bold mt-0 mb-4">{clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}</h4>

              <label className="label">Terkait Event</label>
              <select className="input mb-4" value={clForm.event_id} onChange={e=>setClForm({...clForm, event_id:e.target.value})}>
                <option value="">-- Pilih Event (optional) --</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>

              <label className="label">Tipe Rekayasa</label>
              <select className="input mb-4" value={clForm.type} onChange={e=>setClForm({...clForm, type:e.target.value})}>
                <option value="CLOSED">🚫 CLOSED (Jalan Ditutup)</option>
                <option value="DIVERSION">🔀 DIVERSION (Dialihkan)</option>
              </select>

              <label className="label">Alasan Rekayasa</label>
              <input className="input mb-4" value={clForm.reason} onChange={e=>setClForm({...clForm, reason:e.target.value})} placeholder="Contoh: Kirab pusaka, pembatas jalur, dll" />

              <label className="label">Waktu Mulai</label>
              <input className="input mb-4" type="datetime-local" value={clForm.start_time} onChange={e=>setClForm({...clForm, start_time:e.target.value})} />

              <label className="label">Waktu Selesai</label>
              <input className="input mb-4" type="datetime-local" value={clForm.end_time} onChange={e=>setClForm({...clForm, end_time:e.target.value})} />

              <hr />
              <div className="text-sm text-text-secondary mb-3"><b>🗺️ Pilih ruas jalan:</b> klik 2 titik di peta (A lalu B), lalu klik Derive.</div>
              <div className="text-xs bg-gray-100 p-3 rounded-lg mb-4">
                <b>Titik A:</b> {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}<br/>
                <b>Titik B:</b> {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}
              </div>

              <div className="flex gap-2 mb-4">
                <button className="btn secondary text-sm flex-1" onClick={resetPick}>🔄 Reset Titik</button>
                <button className="btn secondary text-sm flex-1" onClick={deriveEdges}>🔍 Derive Edges</button>
              </div>

              <div className="text-xs bg-green-50 p-2 rounded-lg mb-4 border border-green-200">
                <b>Edges terdeteksi:</b> {derivedEdges.length}
              </div>

              <hr />
              <button className="btn w-full" onClick={saveClosure}>💾 Simpan Rekayasa</button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'60vh', width:'100%'}}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapPicker onPick={(p)=>{
                  if (!pickA) setPickA(p)
                  else if (!pickB) setPickB(p)
                  else { setPickA(p); setPickB(null); setDerivedEdges([]) }
                }} />

                {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup>📍 Titik A (awal)</Popup></Marker>}
                {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup>📍 Titik B (akhir)</Popup></Marker>}

                {derivedEdges.map((e, idx) => (
                  <Polyline key={'d'+idx} positions={e.polyline.map(p=>[p.lat, p.lng])}
                    pathOptions={{ color: clForm.type==='CLOSED' ? 'red' : 'orange', weight: 6, opacity: 0.8 }} />
                ))}

                {closures.flatMap(c => (c.edges || []).map((e, idx) => (
                  <Polyline key={c.id + '_' + idx} positions={e.polyline.map(p=>[p.lat, p.lng])}
                    pathOptions={{ color: c.type==='CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                    <Popup>
                      <b>{c.type}</b><br/>
                      {c.reason || '-'}<br/>
                      <button className="btn secondary text-xs mt-2 mr-1" onClick={()=>editClosure(c)}>Edit</button>
                      <button className="btn secondary text-xs mt-2" onClick={()=>deleteClosure(c.id)}>Hapus</button>
                    </Popup>
                  </Polyline>
                )))}
              </MapContainer>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="card">
              <h4 className="text-xl font-bold mt-0 mb-4">📋 Histori Rekayasa Lalu Lintas</h4>
              {closures.length === 0 && <div className="text-sm text-text-secondary">Belum ada rekayasa lalu lintas yang terdaftar.</div>}
              <div className="space-y-3">
                {closures.map(c => (
                  <div key={c.id} className="flex justify-between items-start gap-4 p-3 border border-border rounded-lg bg-secondary">
                    <div>
                      <b className="text-text-primary">{c.type === 'CLOSED' ? '🚫' : '🔀'} {c.type}</b> {c.reason ? `- ${c.reason}` : ''}<br/>
                      <span className="text-xs text-text-secondary">🛣️ Edges: {c.edges?.length || 0}</span>
                      {c.start_time && <span className="text-xs text-text-secondary ml-4">🕐 {dayjs(c.start_time).format('DD/MM HH:mm')}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn secondary text-xs" onClick={()=>editClosure(c)}>Edit</button>
                      <button className="btn secondary text-xs" onClick={()=>deleteClosure(c.id)}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
