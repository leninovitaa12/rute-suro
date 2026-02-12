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
    <div className="container min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
        <div className="card">
          <h3 className="text-2xl font-bold mt-0 mb-4">User Route Finder</h3>
          <div className="text-sm text-text-secondary mb-4">{msg}</div>
          <hr className="my-4" />

          <label className="label">Pilih Event (opsional)</label>
          <select className="input mb-4" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
            <option value="">-- pilih event --</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
              </option>
            ))}
          </select>
          <div className="flex gap-3 mb-4">
            <button className="btn secondary" onClick={applyEventAsDestination}>Set tujuan = Event</button>
          </div>

          <hr className="my-4" />
          <label className="label">Mode klik peta</label>
          <div className="flex gap-3 mb-4">
            <button className={pickMode === 'start' ? 'btn' : 'btn secondary'} onClick={() => setPickMode('start')}>Set START</button>
            <button className={pickMode === 'end' ? 'btn' : 'btn secondary'} onClick={() => setPickMode('end')}>Set DEST</button>
          </div>

          <div className="my-4">
            <div className="text-sm text-text-secondary">Start: {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'}</div>
            <div className="text-sm text-text-secondary">Dest: {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'}</div>
          </div>

          <hr className="my-4" />
          <button className="btn w-full disabled:opacity-50" disabled={loading} onClick={findRoute}>
            {loading ? 'Memproses...' : 'Temukan Rute (A*)'}
          </button>

          <hr className="my-4" />
          <div className="text-sm">
            <span className="inline-block px-3 py-1 rounded-full text-xs bg-red-100 text-error border border-red-300 font-semibold">Merah</span> = jalan ditutup (rekayasa admin)
          </div>
        </div>

        <div className="card p-0 overflow-hidden">
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
