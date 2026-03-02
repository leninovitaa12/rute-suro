import React from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  CircleMarker,
  Tooltip
} from 'react-leaflet'
import L from 'leaflet'
import dayjs from 'dayjs'
import { api } from '../../lib/api.js'
import RightDockPanel from '../../components/RightDockPanel.jsx'

const DEFAULT_CENTER = [-7.871, 111.462]
const OFF_ROUTE_TOLERANCE_M = 35
const NAVBAR_H_PX = 80
const CLOSURES_TTL_MS = 30 * 1000

// turn-by-turn settings
const STEP_TRIGGER_M = 25
const STREET_FETCH_MIN_MS = 3000 // throttle "kamu sedang di jalan apa"

// smooth follow
const FOLLOW_ZOOM = 18
const FOLLOW_FLY_DURATION = 0.65

// reverse geocoding (OSM/Nominatim)
const REVERSE_GEO_TTL_MS = 24 * 60 * 60 * 1000
const REVERSE_GEO_TIMEOUT_MS = 9000

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

// ===== helper: haversine distance =====
function haversineM(a, b) {
  if (!a || !b) return Infinity
  const R = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * R * Math.asin(Math.sqrt(x))
}

function bearingDeg(a, b) {
  if (!a || !b) return 0
  const toRad = (x) => (x * Math.PI) / 180
  const toDeg = (x) => (x * 180) / Math.PI
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const dLon = toRad(b.lng - a.lng)

  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  const brng = toDeg(Math.atan2(y, x))
  return (brng + 360) % 360
}

// ===== helpers: format =====
function fmtMin(sec) {
  if (sec == null || Number.isNaN(Number(sec))) return '?'
  const mins = Number(sec) / 60
  return mins < 10 ? `${mins.toFixed(1)} menit` : `${mins.toFixed(0)} menit`
}
function fmtKm(m) {
  if (m == null || Number.isNaN(Number(m))) return '?'
  const km = Number(m) / 1000
  return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`
}
function fmtMinShort(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return '?'
  const mins = Number(sec) / 60
  if (mins < 1) return '<1'
  if (mins < 10) return mins.toFixed(1)
  return mins.toFixed(0)
}
function fmtDistShort(m) {
  if (m == null || !Number.isFinite(Number(m))) return '?'
  const mm = Number(m)
  if (mm < 1000) return `${Math.max(1, Math.round(mm))} m`
  const km = mm / 1000
  return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`
}

// ===== UI small components =====
function MapBadge({ tracking, followMe, voiceOn }) {
  return (
    <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
      <div className="bg-white/70 backdrop-blur border border-gray-200 shadow-sm rounded-xl px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              tracking
                ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200'
                : 'bg-gray-50/80 text-gray-700 border-gray-200'
            }`}
          >
            {tracking ? 'NAVIGASI AKTIF' : 'NAVIGASI OFF'}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              followMe
                ? 'bg-gray-900/90 text-white border-gray-900'
                : 'bg-white/70 text-gray-700 border-gray-200'
            }`}
          >
            Ikuti: {followMe ? 'ON' : 'OFF'}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
              voiceOn
                ? 'bg-indigo-50/80 text-indigo-800 border-indigo-200'
                : 'bg-white/70 text-gray-700 border-gray-200'
            }`}
          >
            Suara: {voiceOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  )
}

function InstructionOverlay({ tracking, activeStep, distToNext }) {
  if (!tracking || !activeStep) return null
  return (
    <div className="absolute top-3 right-3 left-3 sm:left-auto z-[1000] pointer-events-none">
      <div className="bg-emerald-50/75 backdrop-blur border border-emerald-200 shadow-sm rounded-xl px-3 py-2">
        <p className="text-[11px] font-semibold text-emerald-900 mb-0.5">Instruksi</p>
        <p className="text-sm font-bold text-emerald-900 leading-snug">{activeStep.instruction}</p>
        {distToNext != null ? (
          <p className="mt-1 text-[11px] text-emerald-900/80">
            <b>{distToNext} m</b>
          </p>
        ) : null}
      </div>
    </div>
  )
}

// ✅ Ringkasan bawah (smooth, tanpa teks tambahan; saat tracking => sisa)
function RouteSummaryBar({ activeRoute, selectedMode, tracking, myPos, end, onRecenter }) {
  if (!activeRoute) return null

  const totalSec = Number(activeRoute?.total_time_sec)
  const totalLen = Number(activeRoute?.total_length_m)

  let targetSec = totalSec
  let targetM = totalLen

  if (
    tracking &&
    myPos &&
    end &&
    Number.isFinite(totalSec) &&
    Number.isFinite(totalLen) &&
    totalSec > 0 &&
    totalLen > 0
  ) {
    const remainM = haversineM(myPos, end) // estimasi cepat
    const avgSpeedMps = totalLen / totalSec
    const estRemainSec = Math.max(0, remainM / Math.max(avgSpeedMps, 0.15))
    targetSec = estRemainSec
    targetM = remainM
  }

  const [dispSec, setDispSec] = React.useState(() => (Number.isFinite(targetSec) ? targetSec : 0))
  const [dispM, setDispM] = React.useState(() => (Number.isFinite(targetM) ? targetM : 0))

  React.useEffect(() => {
    let raf = 0
    let alive = true
    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      if (!alive) return
      setDispSec((prev) => lerp(Number.isFinite(prev) ? prev : 0, Number.isFinite(targetSec) ? targetSec : 0, 0.18))
      setDispM((prev) => lerp(Number.isFinite(prev) ? prev : 0, Number.isFinite(targetM) ? targetM : 0, 0.18))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      if (raf) cancelAnimationFrame(raf)
    }
  }, [targetSec, targetM])

  const modeLabel = selectedMode === 'fastest' ? 'Tercepat' : 'Terpendek'

  return (
    <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
      <div className="route-summary-shell">
        <div className="route-summary-main">
          <div className="route-summary-time">
            {fmtMinShort(dispSec)}
            <span className="route-summary-unit"> min</span>
          </div>

          <div className="route-summary-meta">
            <span className="route-summary-dist">{fmtDistShort(dispM)}</span>
            <span className={`route-summary-chip ${selectedMode === 'fastest' ? 'chip-fast' : 'chip-short'}`}>
              {modeLabel}
            </span>
          </div>
        </div>

        <button type="button" onClick={onRecenter} className="route-summary-btn" aria-label="Recenter">
          ⌖
        </button>
      </div>
    </div>
  )
}

// Simulasi lane guidance (bukan lane nyata)
function LaneSim({ step }) {
  if (!step) return null
  const t = (step.type || '').toLowerCase()

  let active = 'straight'
  if (t.includes('left')) active = 'left'
  else if (t.includes('right')) active = 'right'
  else active = 'straight'

  const Lane = ({ kind, label }) => (
    <div
      className={`flex-1 flex flex-col items-center justify-center border rounded-lg py-2 ${
        active === kind ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
      }`}
    >
      <div className="text-xs font-bold">{label}</div>
      <div className="text-[10px] opacity-80">{active === kind ? 'disarankan' : ''}</div>
    </div>
  )

  return (
    <div className="mt-2">
      <p className="text-[11px] font-semibold text-gray-700 mb-1">Simulasi lajur</p>
      <div className="flex gap-2">
        <Lane kind="left" label="Kiri" />
        <Lane kind="straight" label="Lurus" />
        <Lane kind="right" label="Kanan" />
      </div>
      <p className="mt-1 text-[10px] text-gray-500">
        *Simulasi berdasarkan manuver (turn-by-turn), bukan data lajur asli.
      </p>
    </div>
  )
}

// user direction arrow marker icon
function makeArrowIcon(deg) {
  const d = Number.isFinite(deg) ? deg : 0
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `
      <div style="
        width:36px;height:36px;border-radius:18px;
        background:rgba(37,99,235,0.15);
        display:flex;align-items:center;justify-content:center;
        border:2px solid rgba(37,99,235,0.65);
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
      ">
        <div style="
          width:0;height:0;
          border-left:7px solid transparent;
          border-right:7px solid transparent;
          border-bottom:16px solid rgba(37,99,235,0.95);
          transform:rotate(${d}deg);
          transform-origin:50% 70%;
        "></div>
      </div>
    `
  })
}

// Speech helper
function speak(text, { rate = 1.0, pitch = 1.0, lang = 'id-ID' } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang
    u.rate = rate
    u.pitch = pitch
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {
    // ignore
  }
}

// ===== helper: simple timeout fetch (reverse geocoding) =====
async function fetchWithTimeout(url, { timeoutMs = 8000, signal, headers } = {}) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeoutMs)

  const onAbort = () => ctrl.abort()
  if (signal) {
    if (signal.aborted) ctrl.abort()
    signal.addEventListener('abort', onAbort, { once: true })
  }

  try {
    const res = await fetch(url, { signal: ctrl.signal, headers })
    return res
  } finally {
    clearTimeout(id)
    if (signal) signal.removeEventListener('abort', onAbort)
  }
}

export default function UserMapPage() {
  const [events, setEvents] = React.useState([])
  const [closures, setClosures] = React.useState([])
  const [selectedEventId, setSelectedEventId] = React.useState('')

  const [start, setStart] = React.useState(null)
  const [end, setEnd] = React.useState(null)
  const [pickMode, setPickMode] = React.useState('start')

  // reverse geocoding labels
  const [startAddr, setStartAddr] = React.useState('')
  const [endAddr, setEndAddr] = React.useState('')

  // two routes
  const [routes, setRoutes] = React.useState({ fastest: null, shortest: null })
  const [selectedMode, setSelectedMode] = React.useState('fastest')
  const activeRoute = routes?.[selectedMode] || null

  // turn-by-turn state
  const [steps, setSteps] = React.useState([])
  const [stepIdx, setStepIdx] = React.useState(0)
  const [currentStreet, setCurrentStreet] = React.useState('')

  // loading
  const [loadingBootstrap, setLoadingBootstrap] = React.useState(true)
  const [loadingEvents, setLoadingEvents] = React.useState(true)
  const [loadingClosures, setLoadingClosures] = React.useState(true)
  const [loadingRoute, setLoadingRoute] = React.useState(false)

  const [msg, setMsg] = React.useState('Pilih START dan TUJUAN, lalu tekan "Cari Rute".')

  const [myPos, setMyPos] = React.useState(null)
  const [geoErr, setGeoErr] = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [followMe, setFollowMe] = React.useState(true)

  // voice + bearing
  const [voiceOn, setVoiceOn] = React.useState(true)
  const [bearing, setBearing] = React.useState(0)
  const lastPosRef = React.useRef(null)
  const lastSpokenStepRef = React.useRef({ idx: -1, ts: 0 })

  const mapRef = React.useRef(null)
  const watchIdRef = React.useRef(null)

  // ✅ PANEL KANAN
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)

  // cache closures ringan
  const closuresCacheRef = React.useRef({ data: null, fetchedAt: 0 })

  // throttle street fetch
  const lastStreetFetchRef = React.useRef(0)

  // reverse geocode cache + abort
  const reverseCacheRef = React.useRef(new Map())
  const reverseAbortRef = React.useRef({ start: null, end: null })

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false

  React.useEffect(() => {
    if (isMobile) setRightPanelOpen(true)
  }, [isMobile])

  // Reverse Geocoding
  function roundKey(lat, lng) {
    return `${lat.toFixed(5)},${lng.toFixed(5)}`
  }

  async function reverseGeocodeOSM(lat, lng, { signal } = {}) {
    const key = roundKey(lat, lng)
    const now = Date.now()
    const cached = reverseCacheRef.current.get(key)
    if (cached && now - cached.ts < REVERSE_GEO_TTL_MS) return cached.label

    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${encodeURIComponent(lat)}` +
      `&lon=${encodeURIComponent(lng)}` +
      `&zoom=18&addressdetails=1`

    const res = await fetchWithTimeout(url, {
      timeoutMs: REVERSE_GEO_TIMEOUT_MS,
      signal,
      headers: { Accept: 'application/json' }
    })

    if (!res.ok) throw new Error('reverse geocode failed')
    const data = await res.json()
    const label = data?.display_name || ''
    if (label) reverseCacheRef.current.set(key, { label, ts: now })
    return label
  }

  async function fillAddressFor(mode, latlng) {
    if (!latlng) return
    const { lat, lng } = latlng

    try {
      if (reverseAbortRef.current[mode]) reverseAbortRef.current[mode].abort()
    } catch {}
    const ctrl = new AbortController()
    reverseAbortRef.current[mode] = ctrl

    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    if (mode === 'start') setStartAddr(fallback)
    else setEndAddr(fallback)

    try {
      const label = await reverseGeocodeOSM(lat, lng, { signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      if (mode === 'start') setStartAddr(label || fallback)
      else setEndAddr(label || fallback)
    } catch {
      if (ctrl.signal?.aborted) return
      if (mode === 'start') setStartAddr(fallback)
      else setEndAddr(fallback)
    }
  }

  // BOOTSTRAP
  React.useEffect(() => {
    let alive = true

    ;(async () => {
      setLoadingBootstrap(true)
      setLoadingEvents(true)
      setLoadingClosures(true)

      try {
        const res = await api.get('/map_bootstrap')
        const data = res.data || {}

        if (!alive) return

        const ev = Array.isArray(data.events) ? data.events : []
        const cl = Array.isArray(data.closures_active) ? data.closures_active : []

        setEvents(ev)
        setClosures(cl)
        closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
      } catch (e) {
        if (!alive) return
        setMsg('Gagal memuat data peta: ' + (e?.response?.data?.error || e.message))
      } finally {
        if (!alive) return
        setLoadingEvents(false)
        setLoadingClosures(false)
        setLoadingBootstrap(false)
      }
    })()

    return () => { alive = false }
  }, [])

  function onPick(latlng, mode) {
    if (mode === 'start') {
      setStart(latlng)
      setMsg('START tersimpan. Sekarang pilih TUJUAN.')
      fillAddressFor('start', latlng)
    } else {
      setEnd(latlng)
      setMsg('TUJUAN tersimpan. Tekan "Cari Rute".')
      fillAddressFor('end', latlng)
    }
  }

  function applyEventAsDestination() {
    const ev = events.find((e) => e.id === selectedEventId)
    if (!ev) return
    const pt = { lat: ev.lat, lng: ev.lng }
    setEnd(pt)
    setMsg(`Tujuan di-set ke event: ${ev.name}. Tekan "Cari Rute".`)
    fillAddressFor('end', pt)
  }

  async function refreshClosures({ force = false, silent = true } = {}) {
    const cache = closuresCacheRef.current
    const stillValid = cache.data && Date.now() - cache.fetchedAt < CLOSURES_TTL_MS

    if (!force && stillValid) {
      setClosures(cache.data || [])
      return
    }

    if (!silent) setMsg('Memuat rekayasa jalan...')
    setLoadingClosures(true)

    try {
      const res = await api.get('/map_bootstrap')
      const data = res.data || {}
      const cl = Array.isArray(data.closures_active) ? data.closures_active : []
      setClosures(cl)
      closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
    } catch (e) {
      console.warn('refreshClosures failed:', e)
    } finally {
      setLoadingClosures(false)
    }
  }

  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start
    const e = customEnd || end
    if (!s || !e) {
      if (!silent) setMsg('START dan TUJUAN wajib diisi.')
      return
    }

    setLoadingRoute(true)
    if (!silent) setMsg('Menghitung rute A* (tercepat & terpendek)...')

    setRoutes({ fastest: null, shortest: null })
    setSteps([])
    setStepIdx(0)

    try {
      const res = await api.post('/route', { start: s, end: e, mode: 'both' })
      const data = res.data || {}

      const fastest = data.fastest || null
      const shortest = data.shortest || null

      setRoutes({ fastest, shortest })

      const nextMode = selectedMode || 'fastest'
      const chosen = (nextMode === 'shortest' ? shortest : fastest) || fastest || shortest
      if (chosen) {
        setSteps(Array.isArray(chosen.steps) ? chosen.steps : [])
        setStepIdx(0)
      }

      if (!silent) {
        const mins = chosen?.total_time_sec ? (chosen.total_time_sec / 60).toFixed(1) : '?'
        setMsg(`Rute ditemukan. Estimasi ${mins} menit. Pilih alternatif rute.`)
      }

      await refreshClosures({ force: true, silent: true })
    } catch (e2) {
      if (!silent) setMsg('Gagal: ' + (e2?.response?.data?.error || e2.message))
    } finally {
      setLoadingRoute(false)
    }
  }

  async function rerouteSelected(customStart, customEnd) {
    const s = customStart || start
    const e = customEnd || end
    if (!s || !e) return
    try {
      const res = await api.post('/route', { start: s, end: e, mode: selectedMode })
      const r = res.data || null
      if (!r) return

      setRoutes((prev) => ({ ...prev, [selectedMode]: r }))
      setSteps(Array.isArray(r.steps) ? r.steps : [])
      setStepIdx(0)

      await refreshClosures({ force: true, silent: true })
    } catch (err) {
      console.warn('rerouteSelected failed:', err)
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
        fillAddressFor('start', pt)
      },
      (err) => setGeoErr(err.message || 'Gagal mengambil lokasi'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  function startTracking() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')
    if (watchIdRef.current != null) return

    lastPosRef.current = null

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)

        if (Number.isFinite(pos.coords.heading) && pos.coords.heading != null) {
          setBearing((pos.coords.heading + 360) % 360)
        } else {
          const prev = lastPosRef.current
          if (prev) setBearing(bearingDeg(prev, pt))
        }
        lastPosRef.current = pt

        if (followMe && mapRef.current) {
          const z = tracking ? Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM) : mapRef.current.getZoom()
          mapRef.current.flyTo([pt.lat, pt.lng], z, { animate: true, duration: FOLLOW_FLY_DURATION })
        }
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
    if (tracking) return
    const r = routes?.[selectedMode]
    if (!r) return
    setSteps(Array.isArray(r.steps) ? r.steps : [])
    setStepIdx(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode])

  React.useEffect(() => {
    if (!tracking) return
    if (!myPos || steps.length < 2) return
    if (stepIdx >= steps.length - 1) return

    const next = steps[stepIdx + 1]
    if (!next?.location) return

    const d = haversineM(myPos, next.location)
    if (d <= STEP_TRIGGER_M) {
      setStepIdx((i) => Math.min(i + 1, steps.length - 1))
    }
  }, [tracking, myPos?.lat, myPos?.lng, steps, stepIdx])

  React.useEffect(() => {
    if (!tracking) return
    if (!voiceOn) return
    const st = steps?.[stepIdx]
    if (!st?.instruction) return

    const now = Date.now()
    const last = lastSpokenStepRef.current
    if (last.idx === stepIdx && now - last.ts < 5000) return

    lastSpokenStepRef.current = { idx: stepIdx, ts: now }
    speak(st.instruction, { rate: 1.02, pitch: 1.0, lang: 'id-ID' })
  }, [tracking, voiceOn, stepIdx, steps])

  React.useEffect(() => {
    if (!tracking) return
    if (!myPos) return
    const now = Date.now()
    if (now - lastStreetFetchRef.current < STREET_FETCH_MIN_MS) return
    lastStreetFetchRef.current = now

    ;(async () => {
      try {
        const res = await api.get(`/nearest_street?lat=${myPos.lat}&lng=${myPos.lng}`)
        setCurrentStreet(res?.data?.street_name || '')
      } catch {}
    })()
  }, [tracking, myPos?.lat, myPos?.lng])

  React.useEffect(() => {
    if (!tracking) return
    if (!myPos || !end || !activeRoute?.polyline) return
    const d = distanceToPolylineM(myPos, activeRoute.polyline)
    if (d > OFF_ROUTE_TOLERANCE_M) {
      rerouteSelected(myPos, end)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, myPos?.lat, myPos?.lng, selectedMode])

  React.useEffect(() => {
    if (!tracking) return
    const id = setInterval(() => {
      refreshClosures({ force: true, silent: true })
    }, 30_000)
    return () => clearInterval(id)
  }, [tracking])

  const startLabel = startAddr ? startAddr : start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : '-'
  const endLabel = endAddr ? endAddr : end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : '-'
  const canFindRoute = !!start && !!end

  const activeStep = steps?.[stepIdx]
  const nextStep = steps?.[stepIdx + 1]
  const distToNext = myPos && nextStep?.location ? Math.round(haversineM(myPos, nextStep.location)) : null

  const fastest = routes.fastest
  const shortest = routes.shortest
  const hasRoutes = !!fastest || !!shortest

  const lockPickRoute = tracking

  const handleRecenter = () => {
    if (!mapRef.current) return
    if (myPos) {
      mapRef.current.flyTo([myPos.lat, myPos.lng], Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM), {
        animate: true,
        duration: 0.6
      })
    } else if (start) {
      mapRef.current.flyTo([start.lat, start.lng], 16, { animate: true, duration: 0.6 })
    } else {
      mapRef.current.flyTo(DEFAULT_CENTER, 13, { animate: true, duration: 0.6 })
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="relative w-full" style={{ height: `calc(100vh - ${NAVBAR_H_PX}px)` }}>
        <MapBadge tracking={tracking} followMe={followMe} voiceOn={voiceOn} />
        <InstructionOverlay tracking={tracking} activeStep={activeStep} distToNext={distToNext} />

        {/* ✅ Smooth Summary */}
        <RouteSummaryBar
          activeRoute={activeRoute}
          selectedMode={selectedMode}
          tracking={tracking}
          myPos={myPos}
          end={end}
          onRecenter={handleRecenter}
        />

        <RightDockPanel
          open={rightPanelOpen}
          onToggle={() => setRightPanelOpen((v) => !v)}
          title="RUTE SURO"
        >
          {/* Loading banner */}
          {loadingBootstrap ? (
            <div className="mb-4 text-sm text-gray-700">
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3">
                <p className="font-semibold text-blue-900 mb-1">Memuat data peta…</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>{loadingEvents ? 'Memuat event…' : 'Event siap'}</li>
                  <li>{loadingClosures ? 'Memuat rekayasa jalan…' : 'Rekayasa jalan siap'}</li>
                </ul>
              </div>
            </div>
          ) : null}

          <div className="text-sm text-gray-700 mb-4">
            <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-1">Panduan cepat</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Tentukan <b>START</b> dan <b>TUJUAN</b>.</li>
                <li>Tekan <b>Cari Rute</b>.</li>
                <li>Pilih <b>Tercepat</b> / <b>Terpendek</b>.</li>
                <li>Tekan <b>Mulai Navigasi</b>.</li>
              </ol>
              <p className="mt-2 text-gray-600">{msg}</p>
            </div>
          </div>

          {/* TURN BY TURN UI */}
          {tracking && (activeStep || currentStreet) ? (
            <div className="mb-4">
              {currentStreet ? (
                <div className="text-xs text-gray-800 bg-white/70 border border-gray-200 rounded-lg p-2 mb-2">
                  Kamu sedang di: <b>{currentStreet}</b>
                </div>
              ) : null}

              {activeStep ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">Instruksi</p>
                  <p className="text-sm font-bold text-emerald-900">{activeStep.instruction}</p>
                  {distToNext != null ? (
                    <p className="mt-1 text-xs text-emerald-800">
                      Jarak ke instruksi berikutnya: <b>{distToNext} m</b>
                    </p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-emerald-900/70">
                    Step {Math.min(stepIdx + 1, steps.length)} / {steps.length || 0}
                  </p>
                  <LaneSim step={activeStep} />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* PILIH RUTE */}
          {hasRoutes ? (
            <div className="mb-4">
              <div className="bg-white/70 border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">Alternatif Rute</p>
                  {lockPickRoute ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700">
                      terkunci saat navigasi
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={!fastest || lockPickRoute}
                    onClick={() => {
                      setSelectedMode('fastest')
                      if (fastest) {
                        setSteps(Array.isArray(fastest.steps) ? fastest.steps : [])
                        setStepIdx(0)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                      selectedMode === 'fastest'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                    } ${(!fastest || lockPickRoute) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Rute Tercepat</div>
                      <div className="text-xs font-semibold">{fmtMin(fastest?.total_time_sec)}</div>
                    </div>
                    <div className="text-xs opacity-80">{fmtKm(fastest?.total_length_m)}</div>
                  </button>

                  <button
                    type="button"
                    disabled={!shortest || lockPickRoute}
                    onClick={() => {
                      setSelectedMode('shortest')
                      if (shortest) {
                        setSteps(Array.isArray(shortest.steps) ? shortest.steps : [])
                        setStepIdx(0)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                      selectedMode === 'shortest'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                    } ${(!shortest || lockPickRoute) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Rute Terpendek</div>
                      <div className="text-xs font-semibold">{fmtMin(shortest?.total_time_sec)}</div>
                    </div>
                    <div className="text-xs opacity-80">{fmtKm(shortest?.total_length_m)}</div>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <hr className="my-3 border-gray-200" />

          {/* Event */}
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

          {/* Pick */}
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
                disabled={!activeRoute && !tracking}
                className={`flex-1 px-3 py-2 rounded-lg font-bold text-sm transition ${
                  (!activeRoute && !tracking)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : tracking
                      ? 'bg-gray-900 hover:bg-gray-950 text-white'
                      : 'bg-[#8b1a1a] hover:bg-[#6b1414] text-white'
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

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setVoiceOn((v) => !v)}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition ${
                  voiceOn
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Suara: {voiceOn ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => {
                  if (tracking && activeStep?.instruction) speak(activeStep.instruction, { lang: 'id-ID' })
                }}
                disabled={!tracking || !activeStep?.instruction || !voiceOn}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm border transition ${
                  (!tracking || !activeStep?.instruction || !voiceOn)
                    ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Ulangi Instruksi
              </button>
            </div>

            {geoErr ? (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded mt-2">{geoErr}</p>
            ) : null}
          </div>

          <div className="mb-4 bg-gray-50/70 p-3 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">START</p>
            <p className="text-xs text-gray-900 font-mono break-all mb-3">{startLabel}</p>
            <p className="text-xs font-semibold text-gray-600 uppercase">TUJUAN</p>
            <p className="text-xs text-gray-900 font-mono break-all">{endLabel}</p>
          </div>

          <button
            onClick={() => findRoute()}
            disabled={loadingRoute || !canFindRoute}
            className={`w-full px-3 py-3 font-bold text-white text-sm rounded-lg transition ${
              loadingRoute || !canFindRoute ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#8b1a1a] hover:bg-[#6b1414]'
            }`}
          >
            {loadingRoute ? 'Menghitung Rute...' : 'Cari Rute (A*)'}
          </button>

          <div className="mt-4 text-xs text-gray-700 bg-orange-50/70 p-3 rounded-lg border border-orange-200">
            <p className="font-semibold text-orange-900 mb-2">Informasi Peta</p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-500 rounded" />
              <span>Jalan ditutup (rekayasa)</span>
            </p>
            {loadingClosures ? (
              <p className="mt-2 text-[11px] text-orange-900/80">Memuat rekayasa jalan...</p>
            ) : null}
          </div>
        </RightDockPanel>

        <MapContainer
          center={DEFAULT_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          whenCreated={(map) => { mapRef.current = map }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickSetter mode={pickMode} onPick={onPick} />

          {myPos && (
            <>
              <Marker position={[myPos.lat, myPos.lng]} icon={makeArrowIcon(bearing)}>
                <Popup>
                  <b>Posisi Saya</b>
                  <br />
                  Bearing: {Math.round(bearing)}°
                </Popup>
              </Marker>

              <CircleMarker center={[myPos.lat, myPos.lng]} radius={6} pathOptions={{ color: '#2563eb' }}>
                <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
                  Saya
                </Tooltip>
              </CircleMarker>
            </>
          )}

          {start && <Marker position={[start.lat, start.lng]}><Popup>Start</Popup></Marker>}
          {end && <Marker position={[end.lat, end.lng]}><Popup>Tujuan</Popup></Marker>}

          {/* ✅ PENUTUPAN JALAN: 1 closure = 1 polyline + label (muncul hover/tap) */}
          {closures.map((c) => {
            const edgeList = Array.isArray(c.edges) ? c.edges : []
            const multi = edgeList
              .map((e) => (Array.isArray(e.polyline) ? e.polyline : null))
              .filter((pl) => Array.isArray(pl) && pl.length > 1)
              .map((pl) => pl.map((p) => [p.lat, p.lng]))

            if (!multi.length) return null

            const reason = c.reason || 'Rekayasa / ditutup'

            return (
              <Polyline
                key={`closure_${c.id}`}
                positions={multi}
                pathOptions={{ color: 'red', weight: 6 }}
                eventHandlers={{
                  mouseover: (e) => {
                    // Desktop: tampil saat hover
                    try {
                      e?.target?.openTooltip?.()
                      const el = e?.target?.getTooltip?.()?.getElement?.()
                      if (el) {
                        el.classList.remove('closure-hidden')
                        el.classList.add('closure-show')
                      }
                    } catch {}
                  },
                  mouseout: (e) => {
                    // Desktop: hilang saat keluar
                    try {
                      const el = e?.target?.getTooltip?.()?.getElement?.()
                      if (el) {
                        el.classList.remove('closure-show')
                        el.classList.add('closure-hidden')
                      }
                      e?.target?.closeTooltip?.()
                    } catch {}
                  },
                  click: (e) => {
                    // Mobile/desktop: toggle saat tap/click
                    try {
                      e?.originalEvent?.preventDefault?.()
                      const t = e?.target
                      t?.openTooltip?.()
                      const el = t?.getTooltip?.()?.getElement?.()
                      if (el) {
                        const isShown = el.classList.contains('closure-show')
                        el.classList.toggle('closure-show', !isShown)
                        el.classList.toggle('closure-hidden', isShown)
                      }
                    } catch {}
                  }
                }}
              >
                <Tooltip
                  permanent={false}
                  sticky
                  direction="top"
                  offset={[0, -10]}
                  className="closure-pill-tooltip closure-hidden"
                  opacity={1}
                >
                  DITUTUP: {reason}
                </Tooltip>

                <Popup>
                  <b>Ditutup</b><br />
                  {reason}
                </Popup>
              </Polyline>
            )
          })}

          {/* rute alternatif */}
          {routes.fastest?.polyline && (
            <Polyline
              positions={routes.fastest.polyline.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#1d4ed8',
                weight: selectedMode === 'fastest' ? 7 : 4,
                opacity: selectedMode === 'fastest' ? 1 : 0.35
              }}
            >
              <Tooltip sticky>
                Tercepat • {fmtMin(routes.fastest?.total_time_sec)} • {fmtKm(routes.fastest?.total_length_m)}
              </Tooltip>
            </Polyline>
          )}

          {routes.shortest?.polyline && (
            <Polyline
              positions={routes.shortest.polyline.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: '#7c3aed',
                weight: selectedMode === 'shortest' ? 7 : 4,
                opacity: selectedMode === 'shortest' ? 1 : 0.35,
                dashArray: selectedMode === 'shortest' ? undefined : '6 10'
              }}
            >
              <Tooltip sticky>
                Terpendek • {fmtMin(routes.shortest?.total_time_sec)} • {fmtKm(routes.shortest?.total_length_m)}
              </Tooltip>
            </Polyline>
          )}

          {tracking && nextStep?.location ? (
            <CircleMarker
              center={[nextStep.location.lat, nextStep.location.lng]}
              radius={6}
              pathOptions={{ color: '#10b981' }}
            >
              <Popup>
                <b>Step berikutnya</b><br />
                {nextStep.instruction || '-'}
              </Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  )
}