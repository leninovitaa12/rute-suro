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
const OFF_ROUTE_TOLERANCE_M = 35
const NAVBAR_H_PX = 80 // kalau navbar kamu lebih tinggi, ganti 88/96

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

function MapBadge({ tracking, followMe }) {
  return (
    <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
      <div className="bg-white/95 backdrop-blur border border-gray-200 shadow-sm rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              tracking
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }`}
          >
            {tracking ? 'NAVIGASI AKTIF' : 'NAVIGASI OFF'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              followMe
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            Ikuti: {followMe ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  )
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
  const [msg, setMsg] = React.useState('Pilih START dan TUJUAN, lalu tekan "Cari Rute".')

  const [myPos, setMyPos] = React.useState(null)
  const [geoErr, setGeoErr] = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [followMe, setFollowMe] = React.useState(true)

  const mapRef = React.useRef(null)
  const watchIdRef = React.useRef(null)

  const desktopH = `calc(100vh - ${NAVBAR_H_PX}px)`

  React.useEffect(() => {
    ;(async () => {
      const ev = await api.get('/events')
      setEvents(ev.data || [])
      const cl = await api.get('/closures?active=true')
      setClosures(cl.data || [])
    })()
  }, [])

  function onPick(latlng, mode) {
    if (mode === 'start') {
      setStart(latlng)
      setMsg('START tersimpan. Sekarang pilih TUJUAN.')
    } else {
      setEnd(latlng)
      setMsg('TUJUAN tersimpan. Tekan "Cari Rute".')
    }
  }

  function applyEventAsDestination() {
    const ev = events.find((e) => e.id === selectedEventId)
    if (!ev) return
    setEnd({ lat: ev.lat, lng: ev.lng })
    setMsg(`Tujuan di-set ke event: ${ev.name}. Tekan "Cari Rute".`)
  }

  async function refreshClosures() {
    const cl = await api.get('/closures?active=true')
    setClosures(cl.data || [])
  }

  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start
    const e = customEnd || end
    if (!s || !e) {
      if (!silent) setMsg('START dan TUJUAN wajib diisi.')
      return
    }

    setLoading(true)
    if (!silent) setMsg('Menghitung rute A*...')
    setRoute(null)

    try {
      const res = await api.post('/route', { start: s, end: e })
      setRoute(res.data)
      if (!silent) setMsg(`Rute ditemukan. Estimasi ${(res.data.total_time_sec / 60).toFixed(1)} menit.`)
      await refreshClosures()
    } catch (e2) {
      if (!silent) setMsg('Gagal: ' + (e2?.response?.data?.error || e2.message))
    } finally {
      setLoading(false)
    }
  }

  function useMyLocationAsStart() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)
        setStart(pt)
        setPickMode('end')
        setMsg('Lokasi kamu dipakai sebagai START. Sekarang pilih TUJUAN.')
        if (followMe && mapRef.current) mapRef.current.setView([pt.lat, pt.lng], 16)
      },
      (err) => setGeoErr(err.message || 'Gagal mengambil lokasi'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  function startTracking() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')
    if (watchIdRef.current != null) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)
        if (followMe && mapRef.current) mapRef.current.setView([pt.lat, pt.lng], mapRef.current.getZoom())
      },
      (err) => setGeoErr(err.message || 'Navigasi gagal (GPS).'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    )

    setTracking(true)
    setMsg('Navigasi aktif. Jika melenceng dari rute, sistem akan hitung ulang otomatis.')
  }

  function stopTracking() {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }
    watchIdRef.current = null
    setTracking(false)
    setMsg('Navigasi dimatikan.')
  }

  React.useEffect(() => () => stopTracking(), [])

  React.useEffect(() => {
    if (!tracking) return
    if (!myPos || !end || !route?.polyline) return
    const d = distanceToPolylineM(myPos, route.polyline)
    if (d > OFF_ROUTE_TOLERANCE_M) findRoute(myPos, end, { silent: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, myPos?.lat, myPos?.lng])

  const startLabel = start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'
  const endLabel = end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'
  const canFindRoute = !!start && !!end

  return (
    <div className="bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full">
        {/* PANEL */}
        <div
          className="bg-white lg:shadow-lg w-full lg:w-[420px] border-b lg:border-b-0 lg:border-r border-gray-200"
          style={{
            // Mobile: panel max 45vh, Desktop: full height
            maxHeight: '45vh'
          }}
        >
          <div className="p-4 md:p-6 overflow-y-auto max-h-[45vh] lg:max-h-none lg:h-full" style={{ height: desktopH }}>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Route Finder</h3>

            <div className="text-sm text-gray-700 mb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-900 mb-1">Panduan cepat</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Tentukan <b>START</b> dan <b>TUJUAN</b>.</li>
                  <li>Tekan <b>Cari Rute</b>.</li>
                  <li>Tekan <b>Mulai Navigasi</b>.</li>
                </ol>
                <p className="mt-2 text-gray-600">{msg}</p>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Event (Opsional)</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
              >
                <option value="">-- pilih event --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={applyEventAsDestination}
                className="w-full mt-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-800 font-semibold rounded-lg text-sm border border-red-100 transition"
              >
                Jadikan Event sebagai Tujuan
              </button>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Titik di Peta</label>

              <div className="flex gap-2">
                <button
                  onClick={() => { setPickMode('start'); setMsg('Mode: pilih START. Klik peta.'); }}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition ${
                    pickMode === 'start'
                      ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pilih START
                </button>

                <button
                  onClick={() => { setPickMode('end'); setMsg('Mode: pilih TUJUAN. Klik peta.'); }}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition ${
                    pickMode === 'end'
                      ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Pilih TUJUAN
                </button>
              </div>

              <button
                onClick={useMyLocationAsStart}
                className="w-full mt-2 px-3 py-2 rounded-lg font-semibold text-sm border border-gray-300 bg-white hover:bg-gray-50 transition"
              >
                Pakai Lokasi Saya sebagai START
              </button>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => (tracking ? stopTracking() : startTracking())}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition ${
                    tracking ? 'bg-gray-900 hover:bg-gray-950 text-white' : 'bg-[#8b1a1a] hover:bg-[#6b1414] text-white'
                  }`}
                >
                  {tracking ? 'Stop Navigasi' : 'Mulai Navigasi'}
                </button>

                <button
                  onClick={() => setFollowMe((v) => !v)}
                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition ${
                    followMe
                      ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-950'
                      : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ikuti Saya: {followMe ? 'ON' : 'OFF'}
                </button>
              </div>

              {geoErr ? (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded mt-2">{geoErr}</p>
              ) : null}
            </div>

            <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">START</p>
              <p className="text-xs text-gray-900 font-mono break-all mb-3">{startLabel}</p>
              <p className="text-xs font-semibold text-gray-600 uppercase">TUJUAN</p>
              <p className="text-xs text-gray-900 font-mono break-all">{endLabel}</p>
            </div>

            <button
              onClick={() => findRoute()}
              disabled={loading || !canFindRoute}
              className={`w-full px-3 py-3 font-bold text-white text-sm rounded-lg transition ${
                loading || !canFindRoute ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8b1a1a] hover:bg-[#6b1414]'
              }`}
            >
              {loading ? 'Menghitung Rute...' : 'Cari Rute (A*)'}
            </button>

            <div className="mt-4 text-xs text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-900 mb-2">Informasi Peta</p>
              <p className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-500 rounded" />
                <span>Jalan ditutup (rekayasa)</span>
              </p>
            </div>
          </div>
        </div>

        {/* MAP */}
        <div className="relative w-full flex-1 bg-white lg:shadow-lg">
          <div className="h-[55vh] lg:h-[calc(100vh-80px)]">
            <MapBadge tracking={tracking} followMe={followMe} />
            <MapContainer
              center={DEFAULT_CENTER}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => { mapRef.current = map }}
            >
              <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickSetter mode={pickMode} onPick={onPick} />

              {myPos && (
                <CircleMarker center={[myPos.lat, myPos.lng]} radius={8} pathOptions={{ color: '#2563eb' }}>
                  <Popup>Posisi Saya</Popup>
                </CircleMarker>
              )}

              {start && <Marker position={[start.lat, start.lng]}><Popup>Start</Popup></Marker>}
              {end && <Marker position={[end.lat, end.lng]}><Popup>Tujuan</Popup></Marker>}

              {closures.flatMap((c) =>
                (c.edges || []).map((e, idx) =>
                  Array.isArray(e.polyline) && e.polyline.length > 1 ? (
                    <Polyline
                      key={c.id + '_' + idx}
                      positions={e.polyline.map((p) => [p.lat, p.lng])}
                      pathOptions={{ color: 'red', weight: 6 }}
                    >
                      <Popup>
                        <b>Ditutup</b><br />
                        {c.reason || '-'}
                      </Popup>
                    </Polyline>
                  ) : null
                )
              )}

              {route?.polyline && (
                <Polyline
                  positions={route.polyline.map((p) => [p.lat, p.lng])}
                  pathOptions={{ color: '#111', weight: 5 }}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}