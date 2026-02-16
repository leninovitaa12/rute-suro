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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row pt-16 lg:pt-0">
      {/* Mobile/Tablet Tabs */}
      <style>{`
        @media (max-width: 1023px) {
          .map-container { height: 500px; min-height: 500px; }
          .panel-container { max-height: 400px; overflow-y-auto; }
        }
        @media (min-width: 1024px) {
          .map-container { height: 100vh; }
          .panel-container { height: 100vh; overflow-y-auto; }
        }
        .tab-button {
          transition: all 0.3s ease;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          border-bottom: 3px solid transparent;
        }
        .tab-button.active {
          border-bottom-color: #991b1b;
          color: #991b1b;
        }
      `}</style>

      <div className="w-full lg:grid lg:grid-cols-3 lg:gap-0 flex flex-col">
        {/* Left Panel */}
        <div className="lg:col-span-1 bg-white lg:shadow-lg p-4 md:p-6 panel-container lg:h-screen lg:overflow-y-auto">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Route Finder</h3>
          <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">{msg}</p>
          
          <hr className="my-3 md:my-4 border-gray-200" />

          {/* Event Selector */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">Pilih Event (Opsional)</label>
            <select 
              value={selectedEventId} 
              onChange={e => setSelectedEventId(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800 transition-all"
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
              className="w-full mt-2 md:mt-3 px-3 md:px-4 py-2 btn-red-light rounded-lg text-sm"
            >
              Set Tujuan = Event
            </button>
          </div>

          <hr className="my-3 md:my-4 border-gray-200" />

          {/* Mode Selector */}
          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">Mode Klik Peta</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setPickMode('start')}
                className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm ${
                  pickMode === 'start'
                    ? 'btn-red shadow-md'
                    : 'btn-gray-outline'
                }`}
              >
                Set START
              </button>
              <button 
                onClick={() => setPickMode('end')}
                className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm ${
                  pickMode === 'end'
                    ? 'btn-red shadow-md'
                    : 'btn-gray-outline'
                }`}
              >
                Set DEST
              </button>
            </div>
          </div>

          {/* Coordinates Display */}
          <div className="mb-4 md:mb-6 bg-gray-50 p-3 md:p-4 rounded-lg">
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase">Start Point</p>
              <p className="text-xs md:text-sm text-gray-900 font-mono break-all">
                {start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">Destination</p>
              <p className="text-xs md:text-sm text-gray-900 font-mono break-all">
                {end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'}
              </p>
            </div>
          </div>

          <hr className="my-3 md:my-4 border-gray-200" />

          {/* Find Route Button */}
          <button 
            onClick={findRoute}
            disabled={loading}
            className={`w-full px-3 md:px-4 py-2 md:py-3 font-bold text-white text-sm md:text-base rounded-lg transition-all ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'btn-red'
            }`}
          >
            {loading ? 'Menghitung Rute...' : 'Temukan Rute (A*)'}
          </button>

          <hr className="my-3 md:my-4 border-gray-200" />

          {/* Legend */}
          <div className="text-xs text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-900 mb-2">Informasi Peta</p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-500 rounded flex-shrink-0"></span>
              <span>Jalan ditutup (rekayasa)</span>
            </p>
          </div>
        </div>

        {/* Map Panel */}
        <div className="lg:col-span-2 bg-white lg:shadow-lg overflow-hidden map-container">
          {start && end ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
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
          )}
        </div>
      </div>
    </div>
  )
}
