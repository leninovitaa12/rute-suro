import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import { api } from '../../lib/api.js'

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
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen lg:h-auto">
        {/* Left Panel */}
        <div className="lg:col-span-1 bg-white shadow-lg p-6 overflow-y-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Route Finder</h3>
          <p className="text-sm text-gray-600 mb-6">{msg}</p>
          
          <hr className="my-4 border-gray-200" />

          {/* Event Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Event (Opsional)</label>
            <select 
              value={selectedEventId} 
              onChange={e => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-800 transition-all"
            >
              <option value="">-- pilih event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
                </option>
              ))}
            </select>
            <button 
              onClick={applyEventAsDestination}
              className="w-full mt-3 px-4 py-2 bg-red-100 text-red-800 font-medium rounded-lg hover:bg-red-200 transition-colors"
            >
              Set Tujuan = Event
            </button>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Mode Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Mode Klik Peta</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setPickMode('start')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  pickMode === 'start'
                    ? 'bg-red-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Set START
              </button>
              <button 
                onClick={() => setPickMode('end')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                  pickMode === 'end'
                    ? 'bg-red-800 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Set DEST
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase">Start Point</p>
              <p className="text-sm text-gray-900 font-mono">
                {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Destination</p>
              <p className="text-sm text-gray-900 font-mono">
                {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'}
              </p>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Find Route Button */}
          <button 
            onClick={findRoute}
            disabled={loading}
            className={`w-full px-4 py-3 font-bold text-white rounded-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-800 hover:bg-red-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'Menghitung Rute...' : 'Temukan Rute (A*)'}
          </button>

          <hr className="my-4 border-gray-200" />

          {/* Legend */}
          <div className="text-xs text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-900 mb-2">Informasi Peta</p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 bg-red-500 rounded"></span>
              Jalan ditutup (rekayasa)
            </p>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 bg-white shadow-lg overflow-hidden">
          <MapContainer center={DEFAULT_CENTER} zoom={13} style={{height: '100%', width:'100%'}}>
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
