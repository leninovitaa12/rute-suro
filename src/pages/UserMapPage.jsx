import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import { api } from '../lib/api.js'

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function ClickSetter({ mode, onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng }, mode)
    }
  })
  return null
}

export default function UserMapPage() {
  const [events, setEvents] = React.useState([])
  const [closures, setClosures] = React.useState([])
  const [selectedEventId, setSelectedEventId] = React.useState('')
  const [start, setStart] = React.useState(null)
  const [end, setEnd] = React.useState(null)
  const [route, setRoute] = React.useState(null)
  const [pickMode, setPickMode] = React.useState('start')
  const [loading, setLoading] = React.useState(false)
  const [msg, setMsg] = React.useState('Klik peta untuk set START, lalu set DEST.')

  React.useEffect(() => {
    async function load() {
      const ev = await api.get('/events')
      setEvents(ev.data || [])
      const cl = await api.get('/closures?active=true')
      setClosures(cl.data || [])
    }
    load()
  }, [])

  function onPick(latlng, mode) {
    if (mode === 'start') setStart(latlng)
    if (mode === 'end') setEnd(latlng)
  }

  function applyEventAsDestination() {
    const ev = events.find(e => e.id === selectedEventId)
    if (!ev) return
    setEnd({ lat: ev.lat, lng: ev.lng })
    setMsg(`Tujuan di-set ke event: ${ev.name}`)
  }

  async function findRoute() {
    if (!start || !end) return setMsg('Start & Destination wajib diisi.')
    setLoading(true)
    setMsg('Menghitung rute A*...')
    setRoute(null)
    try {
      const res = await api.post('/route', { start, end })
      setRoute(res.data)
      setMsg(`Rute ditemukan. Estimasi ${(res.data.total_time_sec/60).toFixed(1)} menit.`)
      const cl = await api.get('/closures?active=true')
      setClosures(cl.data || [])
    } catch (e) {
      setMsg('Gagal: ' + (e?.response?.data?.error || e.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="grid">
        <div className="card">
          <h3 style={{marginTop:0}}>User Route Finder</h3>
          <div className="small">{msg}</div>
          <hr />

          <label className="label">Pilih Event (opsional)</label>
          <select className="input" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            <option value="">-- pilih event --</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
              </option>
            ))}
          </select>
          <div className="row" style={{marginTop:10}}>
            <button className="btn secondary" onClick={applyEventAsDestination}>Set tujuan = Event</button>
          </div>

          <hr />
          <label className="label">Mode klik peta</label>
          <div className="row">
            <button className={"btn " + (pickMode==='start' ? '' : 'secondary')} onClick={() => setPickMode('start')}>Set START</button>
            <button className={"btn " + (pickMode==='end' ? '' : 'secondary')} onClick={() => setPickMode('end')}>Set DEST</button>
          </div>

          <div style={{marginTop:12}}>
            <div className="small">Start: {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'}</div>
            <div className="small">Dest: {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'}</div>
          </div>

          <hr />
          <button className="btn" disabled={loading} onClick={findRoute}>
            {loading ? 'Memproses...' : 'Temukan Rute (A*)'}
          </button>

          <hr />
          <div className="small">
            <span className="badge">Merah</span> = jalan ditutup (rekayasa admin)
          </div>
        </div>

        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height: '78vh', width:'100%'}}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickSetter mode={pickMode} onPick={onPick} />

            {start && <Marker position={[start.lat, start.lng]}><Popup>Start</Popup></Marker>}
            {end && <Marker position={[end.lat, end.lng]}><Popup>Destination</Popup></Marker>}

            {closures.flatMap(c => (c.edges || []).map((e, idx) => (
              <Polyline key={c.id + '_' + idx} positions={e.polyline.map(p => [p.lat, p.lng])} pathOptions={{ color: 'red', weight: 6 }}>
                <Popup>
                  <b>Ditutup</b><br/>
                  {c.reason || '-'}
                </Popup>
              </Polyline>
            )))}

            {route?.polyline && (
              <Polyline positions={route.polyline.map(p => [p.lat, p.lng])} pathOptions={{ color: '#111', weight: 5 }} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}