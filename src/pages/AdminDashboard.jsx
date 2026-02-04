import React from 'react'
import { supabase } from '../lib/supabase.js'
import { api } from '../lib/api.js'
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
  const [tab, setTab] = React.useState('events') // events | closures
  const [events, setEvents] = React.useState([])
  const [closures, setClosures] = React.useState([])
  const [msg, setMsg] = React.useState('')

  async function reload() {
    const ev = await supabase.from('events').select('*').order('start_time', { ascending: true })
    setEvents(ev.data || [])
    const cl = await supabase.from('closures').select('*').order('created_at', { ascending: false })
    setClosures(cl.data || [])
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
      id: evForm.id ?? undefined,
      name: evForm.name,
      description: evForm.description || null,
      start_time: toIsoOrNull(evForm.start_time),
      end_time: toIsoOrNull(evForm.end_time),
      lat: Number(evForm.lat),
      lng: Number(evForm.lng),
    }

    if (evForm.id) {
      const { error } = await supabase.from('events').update(payload).eq('id', evForm.id)
      if (error) return setMsg(error.message)
    } else {
      const { error } = await supabase.from('events').insert(payload)
      if (error) return setMsg(error.message)
    }

    setEvForm({
      id: null, name: '', description: '', start_time: '', end_time: '',
      lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1]
    })
    await reload()
    setMsg('Event tersimpan.')
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
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) setMsg(error.message)
    await reload()
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
    setMsg('Mengambil edge dari OSMnx...')
    try {
      const res = await api.post('/admin/derive_edges', { a: pickA, b: pickB })
      setDerivedEdges(res.data || [])
      setMsg(`Edges didapat: ${res.data?.length || 0}. Klik Simpan Rekayasa.`)
    } catch (e) {
      setMsg('Gagal derive: ' + (e?.response?.data?.error || e.message))
    }
  }

  async function saveClosure() {
    setMsg('')
    if (!derivedEdges.length) return setMsg('Edges kosong. Klik 2 titik lalu Derive dulu.')

    const payload = {
      id: clForm.id ?? undefined,
      event_id: clForm.event_id || null,
      type: clForm.type,
      reason: clForm.reason || null,
      start_time: toIsoOrNull(clForm.start_time),
      end_time: toIsoOrNull(clForm.end_time),
      edges: derivedEdges
    }

    if (clForm.id) {
      const { error } = await supabase.from('closures').update(payload).eq('id', clForm.id)
      if (error) return setMsg(error.message)
    } else {
      const { error } = await supabase.from('closures').insert(payload)
      if (error) return setMsg(error.message)
    }

    setClForm({ id:null, event_id:'', type:'CLOSED', reason:'', start_time:'', end_time:'' })
    resetPick()
    await reload()
    setMsg('Rekayasa tersimpan.')
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
    const { error } = await supabase.from('closures').delete().eq('id', id)
    if (error) setMsg(error.message)
    await reload()
  }

  return (
    <div className="container">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h3 style={{margin:0}}>Admin Panel</h3>
        <div className="row">
          <button className={"btn " + (tab==='events' ? '' : 'secondary')} onClick={()=>setTab('events')}>Data Event</button>
          <button className={"btn " + (tab==='closures' ? '' : 'secondary')} onClick={()=>setTab('closures')}>Rekayasa</button>
        </div>
      </div>

      {msg && <p className="small" style={{color:'#991b1b'}}>{msg}</p>}

      {tab === 'events' && (
        <div className="grid">
          <div className="card">
            <h4 style={{marginTop:0}}>{evForm.id ? 'Edit Event' : 'Tambah Event'}</h4>

            <label className="label">Nama</label>
            <input className="input" value={evForm.name} onChange={e=>setEvForm({...evForm, name:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">Deskripsi</label>
            <input className="input" value={evForm.description} onChange={e=>setEvForm({...evForm, description:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">Start Time (optional)</label>
            <input className="input" type="datetime-local" value={evForm.start_time} onChange={e=>setEvForm({...evForm, start_time:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">End Time (optional)</label>
            <input className="input" type="datetime-local" value={evForm.end_time} onChange={e=>setEvForm({...evForm, end_time:e.target.value})} />

            <hr />
            <div className="small"><b>Set lokasi event:</b> klik peta di kanan</div>
            <div className="small">Lat/Lng: {Number(evForm.lat).toFixed(5)}, {Number(evForm.lng).toFixed(5)}</div>

            <div style={{height:12}} />
            <button className="btn" onClick={saveEvent}>Simpan</button>
            <button className="btn secondary" style={{marginLeft:8}} onClick={()=>{
              setEvForm({ id:null, name:'', description:'', start_time:'', end_time:'', lat:DEFAULT_CENTER[0], lng:DEFAULT_CENTER[1] })
            }}>Reset</button>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            {/* center dibuat tetap DEFAULT_CENTER biar map tidak "terkunci" */}
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'70vh', width:'100%'}}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker onPick={(p)=>setEvForm({...evForm, lat:p.lat, lng:p.lng})} />

              {/* marker lokasi yang sedang diedit */}
              <Marker position={[evForm.lat, evForm.lng]}>
                <Popup>Lokasi Event (sedang diedit)</Popup>
              </Marker>

              {/* marker event-event lain */}
              {events.map(e => (
                <Marker key={e.id} position={[e.lat, e.lng]}>
                  <Popup>
                    <b>{e.name}</b><br/>
                    {e.start_time ? dayjs(e.start_time).format('DD/MM HH:mm') : ''}<br/>
                    <button className="btn secondary" onClick={()=>editEvent(e)}>Edit</button>
                    <button className="btn secondary" onClick={()=>deleteEvent(e.id)} style={{marginLeft:8}}>Hapus</button>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="card" style={{gridColumn:'1 / -1'}}>
            <h4 style={{marginTop:0}}>Daftar Event</h4>
            {events.length === 0 && <div className="small">Belum ada event.</div>}
            {events.map(ev => (
              <div key={ev.id} className="row" style={{justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #eee'}}>
                <div>
                  <b>{ev.name}</b>
                  <div className="small">{ev.lat.toFixed(5)}, {ev.lng.toFixed(5)}</div>
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
            <h4 style={{marginTop:0}}>{clForm.id ? 'Edit Rekayasa' : 'Tambah Rekayasa'}</h4>

            <label className="label">Terkait Event (optional)</label>
            <select className="input" value={clForm.event_id} onChange={e=>setClForm({...clForm, event_id:e.target.value})}>
              <option value="">-- none --</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>

            <div style={{height:10}} />
            <label className="label">Tipe</label>
            <select className="input" value={clForm.type} onChange={e=>setClForm({...clForm, type:e.target.value})}>
              <option value="CLOSED">CLOSED (Ditutup)</option>
              <option value="DIVERSION">DIVERSION (Dialihkan)</option>
            </select>

            <div style={{height:10}} />
            <label className="label">Alasan</label>
            <input className="input" value={clForm.reason} onChange={e=>setClForm({...clForm, reason:e.target.value})} placeholder="Kirab pusaka, dll" />

            <div style={{height:10}} />
            <label className="label">Mulai (optional)</label>
            <input className="input" type="datetime-local" value={clForm.start_time} onChange={e=>setClForm({...clForm, start_time:e.target.value})} />

            <div style={{height:10}} />
            <label className="label">Selesai (optional)</label>
            <input className="input" type="datetime-local" value={clForm.end_time} onChange={e=>setClForm({...clForm, end_time:e.target.value})} />

            <hr />
            <div className="small"><b>Pilih ruas:</b> klik 2 titik (A lalu B), lalu Derive.</div>
            <div className="small">A: {pickA ? `${pickA.lat.toFixed(5)}, ${pickA.lng.toFixed(5)}` : '-'}</div>
            <div className="small">B: {pickB ? `${pickB.lat.toFixed(5)}, ${pickB.lng.toFixed(5)}` : '-'}</div>

            <div className="row" style={{marginTop:10}}>
              <button className="btn secondary" onClick={resetPick}>Reset Titik</button>
              <button className="btn secondary" onClick={deriveEdges}>Derive</button>
            </div>

            <div style={{marginTop:10}} className="small">Edges: <b>{derivedEdges.length}</b></div>

            <hr />
            <button className="btn" onClick={saveClosure}>Simpan Rekayasa</button>
          </div>

          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height:'70vh', width:'100%'}}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker onPick={(p)=>{
                if (!pickA) setPickA(p)
                else if (!pickB) setPickB(p)
                else { setPickA(p); setPickB(null); setDerivedEdges([]) }
              }} />

              {pickA && <Marker position={[pickA.lat, pickA.lng]}><Popup>Titik A</Popup></Marker>}
              {pickB && <Marker position={[pickB.lat, pickB.lng]}><Popup>Titik B</Popup></Marker>}

              {derivedEdges.map((e, idx) => (
                <Polyline key={'d'+idx} positions={e.polyline.map(p=>[p.lat, p.lng])}
                  pathOptions={{ color: clForm.type==='CLOSED' ? 'red' : 'orange', weight: 6 }} />
              ))}

              {closures.flatMap(c => (c.edges || []).map((e, idx) => (
                <Polyline key={c.id + '_' + idx} positions={e.polyline.map(p=>[p.lat, p.lng])}
                  pathOptions={{ color: c.type==='CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                  <Popup>
                    <b>{c.type}</b><br/>
                    {c.reason || '-'}<br/>
                    <button className="btn secondary" onClick={()=>editClosure(c)}>Edit</button>
                    <button className="btn secondary" onClick={()=>deleteClosure(c.id)} style={{marginLeft:8}}>Hapus</button>
                  </Popup>
                </Polyline>
              )))}
            </MapContainer>
          </div>

          <div className="card" style={{gridColumn:'1 / -1'}}>
            <h4 style={{marginTop:0}}>Histori Rekayasa (CRUD)</h4>
            {closures.length === 0 && <div className="small">Belum ada rekayasa.</div>}
            {closures.map(c => (
              <div key={c.id} className="row" style={{justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #eee'}}>
                <div>
                  <b>{c.type}</b> {c.reason ? `- ${c.reason}` : ''}<br/>
                  <span className="small">Edges: {c.edges?.length || 0}</span>
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
