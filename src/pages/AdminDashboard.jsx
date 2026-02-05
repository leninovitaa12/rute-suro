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
    // In production, this would fetch from Supabase
    // For now, we're using mock data
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
      // Update existing
      setEvents(events.map(e => e.id === evForm.id ? payload : e))
    } else {
      // Add new
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
    
    // Mock derived edges for demo
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
    <div className="container" style={{marginTop: '20px'}}>
      <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{margin:0}}>Admin Panel - Dashboard Rekayasa Lalu Lintas</h3>
        <div className="row" style={{gap: '10px'}}>
          <span className="small" style={{alignSelf:'center', color:'#666'}}>
            {localStorage.getItem('adminEmail')}
          </span>
          <button className="btn secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="row" style={{marginTop: '20px', marginBottom: '20px'}}>
        <button className={"btn " + (tab==='events' ? '' : 'secondary')} onClick={()=>setTab('events')}>Data Event</button>
        <button className={"btn " + (tab==='closures' ? '' : 'secondary')} onClick={()=>setTab('closures')}>Rekayasa Lalu Lintas</button>
      </div>

      {msg && <p className="small" style={{color:'#991b1b', padding: '10px', backgroundColor: '#fee', borderRadius: '4px'}}>{msg}</p>}

      {tab === 'events' && (
        <div className="grid">
          <div className="card">
            <h4 style={{marginTop:0}}>{evForm.id ? 'Edit Event' : 'Tambah Event Baru'}</h4>

            <label className="label">Nama Event</label>
            <input className="input" value={evForm.name} onChange={e=>setEvForm({...evForm, name:e.target.value})} placeholder="Contoh: Kirab Pusaka" />

            <div style={{height:10}} />
            <label className="label">Deskripsi</label>
            <input className="input" value={evForm.description} onChange={e=>setEvForm({...evForm, description:e.target.value})} placeholder="Detail acara" />

            <div style={{height:10}} />
            <label className="label">Waktu Mulai</label>
            <input className="input" type="datetime-local" value={evForm.start_time} onChange={e=>setEvForm({...evForm, start_time:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">Waktu Selesai</label>
            <input className="input" type="datetime-local" value={evForm.end_time} onChange={e=>setEvForm({...evForm, end_time:e.target.value})} />

            <hr />
            <div className="small"><b>Set lokasi event:</b> klik peta di kanan</div>
            <div className="small">Koordinat: {Number(evForm.lat).toFixed(5)}, {Number(evForm.lng).toFixed(5)}</div>

            <div style={{height:12}} />
            <button className="btn" onClick={saveEvent}>💾 Simpan Event</button>
            <button className="btn secondary" style={{marginLeft:8}} onClick={()=>{
              setEvForm({ id:null, name:'', description:'', start_time:'', end_time:'', lat:DEFAULT_CENTER[0], lng:DEFAULT_CENTER[1] })
            }}>🔄 Reset Form</button>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'70vh', width:'100%'}}>
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
                    <button className="btn secondary" onClick={()=>editEvent(e)} style={{marginTop:8}}>Edit</button>
                    <button className="btn secondary" onClick={()=>deleteEvent(e.id)} style={{marginLeft:8, marginTop:8}}>Hapus</button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="card" style={{gridColumn:'1 / -1'}}>
            <h4 style={{marginTop:0}}>📋 Daftar Event yang Terdaftar</h4>
            {events.length === 0 && <div className="small">Belum ada event.</div>}
            {events.map(ev => (
              <div key={ev.id} className="row" style={{justifyContent:'space-between', padding:'12px', borderTop:'1px solid #eee', backgroundColor: '#fafafa', marginBottom: '8px', borderRadius: '4px'}}>
                <div>
                  <b>{ev.name}</b>
                  <div className="small">{ev.description}</div>
                  <div className="small" style={{color:'#666'}}>📍 {ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</div>
                  {ev.start_time && <div className="small" style={{color:'#666'}}>🕐 {dayjs(ev.start_time).format('DD/MM/YYYY HH:mm')}</div>}
                </div>
                <div className="row">
                  <button className="btn secondary" onClick={()=>editEvent(ev)}>Edit</button>
                  <button className="btn secondary" onClick={()=>deleteEvent(ev.id)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'closures' && (
        <div className="grid" style={{gridTemplateColumns:'420px 1fr'}}>
          <div className="card">
            <h4 style={{marginTop:0}}>{clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa Baru'}</h4>

            <label className="label">Terkait Event</label>
            <select className="input" value={clForm.event_id} onChange={e=>setClForm({...clForm, event_id:e.target.value})}>
              <option value="">-- Pilih Event (optional) --</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>

            <div style={{height:10}} />
            <label className="label">Tipe Rekayasa</label>
            <select className="input" value={clForm.type} onChange={e=>setClForm({...clForm, type:e.target.value})}>
              <option value="CLOSED">🚫 CLOSED (Jalan Ditutup)</option>
              <option value="DIVERSION">🔀 DIVERSION (Dialihkan)</option>
            </select>

            <div style={{height:10}} />
            <label className="label">Alasan Rekayasa</label>
            <input className="input" value={clForm.reason} onChange={e=>setClForm({...clForm, reason:e.target.value})} placeholder="Contoh: Kirab pusaka, pembatas jalur, dll" />

            <div style={{height:10}} />
            <label className="label">Waktu Mulai</label>
            <input className="input" type="datetime-local" value={clForm.start_time} onChange={e=>setClForm({...clForm, start_time:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">Waktu Selesai</label>
            <input className="input" type="datetime-local" value={clForm.end_time} onChange={e=>setClForm({...clForm, end_time:e.target.value})} />

            <hr />
            <div className="small"><b>🗺️ Pilih ruas jalan:</b> klik 2 titik di peta (A lalu B), lalu klik Derive.</div>
            <div className="small" style={{padding:'8px', backgroundColor:'#f0f0f0', borderRadius:'4px', marginTop:'8px'}}>
              <b>Titik A:</b> {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '(belum dipilih)'}<br/>
              <b>Titik B:</b> {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '(belum dipilih)'}
            </div>

            <div className="row" style={{marginTop:10}}>
              <button className="btn secondary" onClick={resetPick}>🔄 Reset Titik</button>
              <button className="btn secondary" onClick={deriveEdges}>🔍 Derive Edges</button>
            </div>

            <div style={{marginTop:10, padding:'8px', backgroundColor:'#e8f5e9', borderRadius:'4px'}} className="small">
              <b>Edges terdeteksi:</b> {derivedEdges.length}
            </div>

            <hr />
            <button className="btn" onClick={saveClosure}>💾 Simpan Rekayasa</button>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'70vh', width:'100%'}}>
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
                    <button className="btn secondary" onClick={()=>editClosure(c)} style={{marginTop:8}}>Edit</button>
                    <button className="btn secondary" onClick={()=>deleteClosure(c.id)} style={{marginLeft:8, marginTop:8}}>Hapus</button>
                  </Popup>
                </Polyline>
              )))}
            </MapContainer>
          </div>

          <div className="card" style={{gridColumn:'1 / -1'}}>
            <h4 style={{marginTop:0}}>📋 Histori Rekayasa Lalu Lintas</h4>
            {closures.length === 0 && <div className="small">Belum ada rekayasa lalu lintas yang terdaftar.</div>}
            {closures.map(c => (
              <div key={c.id} className="row" style={{justifyContent:'space-between', padding:'12px', borderTop:'1px solid #eee', backgroundColor: '#fafafa', marginBottom: '8px', borderRadius: '4px'}}>
                <div>
                  <b>{c.type === 'CLOSED' ? '🚫' : '🔀'} {c.type}</b> {c.reason ? `- ${c.reason}` : ''}<br/>
                  <span className="small" style={{color:'#666'}}>🛣️ Edges: {c.edges?.length || 0}</span>
                  {c.start_time && <span className="small" style={{color:'#666', marginLeft:'12px'}}>🕐 {dayjs(c.start_time).format('DD/MM HH:mm')}</span>}
                </div>
                <div className="row">
                  <button className="btn secondary" onClick={()=>editClosure(c)}>Edit</button>
                  <button className="btn secondary" onClick={()=>deleteClosure(c.id)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}