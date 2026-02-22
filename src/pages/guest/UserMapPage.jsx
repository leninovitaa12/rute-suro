import React from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  CircleMarker
} from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import { api } from '../../lib/api.js'

const DEFAULT_CENTER = [-7.871, 111.462]

// toleransi melenceng dari rute (meter)
const OFF_ROUTE_TOLERANCE_M = 35

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

// ===== helper: distance user -> polyline (approx) =====
function pointToSegmentDistanceM(p, a, b) {
  // equirectangular approximation (cukup untuk threshold 20-50m)
  const toXY = (ll) => {
    const x = ll.lng * 111320 * Math.cos((p.lat * Math.PI) / 180)
    const y = ll.lat * 110540
    return { x, y }
  }
  const P = toXY(p)
  const A = toXY(a)
  const B = toXY(b)

  const ABx = B.x - A.x
  const ABy = B.y - A.y
  const APx = P.x - A.x
  const APy = P.y - A.y

  const ab2 = ABx * ABx + ABy * ABy
  let t = ab2 === 0 ? 0 : (APx * ABx + APy * ABy) / ab2
  t = Math.max(0, Math.min(1, t))

  const Cx = A.x + t * ABx
  const Cy = A.y + t * ABy
  const dx = P.x - Cx
  const dy = P.y - Cy
  return Math.sqrt(dx * dx + dy * dy)
}

function distanceToPolylineM(point, polyline) {
  if (!point || !Array.isArray(polyline) || polyline.length < 2) return Infinity
  let best = Infinity
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceM(point, polyline[i], polyline[i + 1])
    if (d < best) best = d
  }
  return best
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

  // ===== Geolocation states =====
  const [myPos, setMyPos] = React.useState(null)
  const [geoErr, setGeoErr] = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [followMe, setFollowMe] = React.useState(true)

  const mapRef = React.useRef(null)
  const watchIdRef = React.useRef(null)

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

  async function refreshClosures() {
    const cl = await api.get('/closures?active=true')
    setClosures(cl.data || [])
  }

  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start
    const e = customEnd || end
    if (!s || !e) {
      if (!silent) setMsg('Start & Destination wajib diisi.')
      return
    }

    setLoading(true)
    if (!silent) setMsg('Menghitung rute A*...')
    setRoute(null)

    try {
      const res = await api.post('/route', { start: s, end: e })
      setRoute(res.data)
      if (!silent) {
        setMsg(`Rute ditemukan. Estimasi ${(res.data.total_time_sec / 60).toFixed(1)} menit.`)
      }
      await refreshClosures()
    } catch (e2) {
      if (!silent) setMsg('Gagal: ' + (e2?.response?.data?.error || e2.message))
    } finally {
      setLoading(false)
    }
  }

  // ===== Geolocation actions =====
  function useMyLocationAsStart() {
    setGeoErr('')
    if (!navigator.geolocation) {
      setGeoErr('Browser tidak mendukung Geolocation.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)
        setStart(pt)
        setPickMode('end')
        setMsg('Lokasi kamu dipakai sebagai START. Sekarang klik peta untuk set DEST.')
        if (followMe && mapRef.current) {
          mapRef.current.setView([pt.lat, pt.lng], 16)
        }
      },
      (err) => setGeoErr(err.message || 'Gagal mengambil lokasi'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  function startTracking() {
    setGeoErr('')
    if (!navigator.geolocation) {
      setGeoErr('Browser tidak mendukung Geolocation.')
      return
    }
    if (watchIdRef.current != null) return

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)
        if (followMe && mapRef.current) {
          mapRef.current.setView([pt.lat, pt.lng], mapRef.current.getZoom())
        }
      },
      (err) => setGeoErr(err.message || 'Tracking gagal'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    )

    watchIdRef.current = id
    setTracking(true)
    setMsg('Tracking ON. Jika melenceng dari rute, sistem akan reroute otomatis.')
  }

  function stopTracking() {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = null
    setTracking(false)
    setMsg('Tracking OFF.')
  }

  React.useEffect(() => {
    return () => stopTracking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ===== Auto reroute if off-route (when tracking ON) =====
  React.useEffect(() => {
    if (!tracking) return
    if (!myPos || !end || !route?.polyline) return

    const d = distanceToPolylineM(myPos, route.polyline)
    if (d > OFF_ROUTE_TOLERANCE_M) {
      // reroute dari posisi sekarang ke tujuan
      findRoute(myPos, end, { silent: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, myPos?.lat, myPos?.lng])

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

            {/* ===== Geolocation controls (baru) ===== */}
            <div className="mt-3 flex flex-col gap-2">
              <button
                onClick={useMyLocationAsStart}
                className="w-full px-3 md:px-4 py-2 rounded-lg font-medium text-sm btn-gray-outline"
              >
                Gunakan Lokasi Saya (START)
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => (tracking ? stopTracking() : startTracking())}
                  className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm ${
                    tracking ? 'bg-gray-900 text-white' : 'btn-gray-outline'
                  }`}
                >
                  {tracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>

                <button
                  onClick={() => setFollowMe(v => !v)}
                  className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm ${
                    followMe ? 'bg-gray-900 text-white' : 'btn-gray-outline'
                  }`}
                  title="Jika ON, kamera akan mengikuti posisi kamu"
                >
                  Follow {followMe ? 'ON' : 'OFF'}
                </button>
              </div>

              {geoErr ? (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded">
                  {geoErr}
                </p>
              ) : null}

              {myPos ? (
                <p className="text-xs text-gray-600">
                  Posisi saya: <span className="font-mono">{myPos.lat.toFixed(5)}, {myPos.lng.toFixed(5)}</span>
                </p>
              ) : null}
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
            onClick={() => findRoute()}
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
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => { mapRef.current = map }}
          >
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickSetter mode={pickMode} onPick={onPick} />

            {/* Posisi saya */}
            {myPos && (
              <CircleMarker center={[myPos.lat, myPos.lng]} radius={8} pathOptions={{ color: '#2563eb' }}>
                <Popup>Posisi Saya</Popup>
              </CircleMarker>
            )}

            {start && <Marker position={[start.lat, start.lng]}><Popup>Start</Popup></Marker>}
            {end && <Marker position={[end.lat, end.lng]}><Popup>Destination</Popup></Marker>}

            {/* closures */}
            {closures.flatMap(c => (c.edges || []).map((e, idx) => (
              Array.isArray(e.polyline) && e.polyline.length > 1 ? (
                <Polyline
                  key={c.id + '_' + idx}
                  positions={e.polyline.map(p => [p.lat, p.lng])}
                  pathOptions={{ color: 'red', weight: 6 }}
                >
                  <Popup>
                    <b>Ditutup</b><br />
                    {c.reason || '-'}
                  </Popup>
                </Polyline>
              ) : null
            )))}

            {/* route */}
            {route?.polyline && (
              <Polyline positions={route.polyline.map(p => [p.lat, p.lng])} pathOptions={{ color: '#111', weight: 5 }} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}