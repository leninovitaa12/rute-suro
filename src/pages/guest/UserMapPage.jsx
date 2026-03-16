import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'dayjs'
import { api } from '../../lib/api.js'
import RightDockPanel from '../../components/RightDockPanel.jsx'
import MapLayers, { ClickSetter } from '../../components/map/MapLayers.jsx'
import {
  MapBadge, InstructionOverlay, RouteSummaryBar, LaneSim,
  SectionDivider, LocationRow,
  fmtMin, fmtKm, haversineM, bearingDeg, distanceToPolylineM, speak, fetchWithTimeout,
} from '../../components/map/MapOverlays.jsx'
import {
  IconLocationPin, IconFlag, IconMyLocation, IconNavigation,
  IconVolume, IconVolumeMute, IconFollow, IconRepeat,
  IconSearch, IconRoute, IconZap, IconMinimize, IconAlertTriangle,
  IconCalendar, IconMapPin, IconInfo, IconStop,
  IconArrowTurnLeft, IconArrowTurnRight, IconArrowUp, IconArrowSwap,
} from '../../components/map/MapSvgIcons.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER         = [-7.871, 111.462]
const OFF_ROUTE_TOLERANCE_M  = 35
const NAVBAR_H_PX            = 80
const CLOSURES_TTL_MS        = 30_000
const STEP_TRIGGER_M         = 25
const STREET_FETCH_MIN_MS    = 3000
const FOLLOW_ZOOM            = 18
const FOLLOW_FLY_DURATION    = 0.65
const REVERSE_GEO_TTL_MS     = 24 * 60 * 60 * 1000
const REVERSE_GEO_TIMEOUT_MS = 9000

// ─── Small reusable panel components ─────────────────────────────────────────
const SBtn = ({ onClick, disabled, cls, children }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 font-bold text-white text-sm rounded-2xl transition ${cls}`}>
    {children}
  </button>
)

const LoadDot = ({ loading, label, doneLabel }) => (
  <p className="text-xs text-[#5a1212] font-semibold flex items-center gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-[#8b1a1a] animate-pulse' : 'bg-emerald-500'}`} />
    {loading ? label : doneLabel}
  </p>
)

// Legend row: mendukung children custom (untuk ikon P, img marker, dsb)
const LegendRow = ({ color, style, label, children }) => (
  <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
    <span className="inline-flex items-center gap-1.5">
      {children ?? <span className="inline-block w-4 h-1.5 rounded-sm" style={{ background: color, ...style }} />}
      <span>{label}</span>
    </span>
  </div>
)

const SecCtrl = ({ active, onClick, activeClass, inactiveClass, children }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${active ? activeClass : inactiveClass}`}>
    {children}
  </button>
)

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserMapPage() {

  // ── State ──────────────────────────────────────────────────────────────────
  const [events,            setEvents]           = React.useState([])
  const [closures,          setClosures]         = React.useState([])
  const [congestionZones,   setCongestionZones]  = React.useState([])
  const [selectedEventId,   setSelectedEventId]  = React.useState('')
  const [start,             setStart]            = React.useState(null)
  const [end,               setEnd]              = React.useState(null)
  const [pickMode,          setPickMode]         = React.useState('start')
  const [startAddr,         setStartAddr]        = React.useState('')
  const [endAddr,           setEndAddr]          = React.useState('')
  const [routes,            setRoutes]           = React.useState({ fastest: null, shortest: null })
  const [selectedMode,      setSelectedMode]     = React.useState('fastest')
  const [steps,             setSteps]            = React.useState([])
  const [stepIdx,           setStepIdx]          = React.useState(0)
  const [currentStreet,     setCurrentStreet]    = React.useState('')
  const [loadingBootstrap,  setLoadingBootstrap] = React.useState(true)
  const [loadingEvents,     setLoadingEvents]    = React.useState(true)
  const [loadingClosures,   setLoadingClosures]  = React.useState(true)
  const [loadingRoute,      setLoadingRoute]     = React.useState(false)
  const [msg,               setMsg]              = React.useState('Pilih START dan TUJUAN, lalu tekan "Cari Rute".')
  const [myPos,             setMyPos]            = React.useState(null)
  const [geoErr,            setGeoErr]           = React.useState('')
  const [tracking,          setTracking]         = React.useState(false)
  const [followMe,          setFollowMe]         = React.useState(true)
  const [voiceOn,           setVoiceOn]          = React.useState(true)
  const [bearing,           setBearing]          = React.useState(0)
  const [rightPanelOpen,    setRightPanelOpen]   = React.useState(true)
  const [parkingSpots,      setParkingSpots]     = React.useState([])
  const [selectedParkingId, setSelectedParkingId] = React.useState('')
  const [destinationType,   setDestinationType]   = React.useState(null)

  // ── Refs ───────────────────────────────────────────────────────────────────
  const lastPosRef         = React.useRef(null)
  const lastSpokenStepRef  = React.useRef({ idx: -1, ts: 0 })
  const mapRef             = React.useRef(null)
  const watchIdRef         = React.useRef(null)
  const closuresCacheRef   = React.useRef({ data: null, fetchedAt: 0 })
  const lastStreetFetchRef = React.useRef(0)
  const reverseCacheRef    = React.useRef(new Map())
  const reverseAbortRef    = React.useRef({ start: null, end: null })

  // ── Derived ────────────────────────────────────────────────────────────────
  const isMobile      = typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  const activeRoute   = routes?.[selectedMode] || null
  const activeStep    = steps?.[stepIdx]
  const nextStep      = steps?.[stepIdx + 1]
  const distToNext    = myPos && nextStep?.location ? Math.round(haversineM(myPos, nextStep.location)) : null
  const { fastest, shortest } = routes
  const hasRoutes     = !!fastest || !!shortest
  const lockPickRoute = tracking
  const startLabel    = startAddr || (start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : null)
  const endLabel      = endAddr   || (end   ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}`     : null)
  const canFindRoute  = !!start && !!end

  const spotsForSelectedEvent = React.useMemo(
    () => parkingSpots.filter(s => String(s.event_id) === String(selectedEventId)),
    [parkingSpots, selectedEventId]
  )

  React.useEffect(() => { if (isMobile) setRightPanelOpen(true) }, [isMobile])

  // ── Reverse geocode ────────────────────────────────────────────────────────
  const roundKey = (lat, lng) => `${lat.toFixed(5)},${lng.toFixed(5)}`

  async function reverseGeocodeOSM(lat, lng, { signal } = {}) {
    const key = roundKey(lat, lng), now = Date.now()
    const cached = reverseCacheRef.current.get(key)
    if (cached && now - cached.ts < REVERSE_GEO_TTL_MS) return cached.label
    const res = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { timeoutMs: REVERSE_GEO_TIMEOUT_MS, signal, headers: { Accept: 'application/json' } }
    )
    if (!res.ok) throw new Error('reverse geocode failed')
    const data = await res.json()
    const label = data?.display_name || ''
    if (label) reverseCacheRef.current.set(key, { label, ts: now })
    return label
  }

  async function fillAddressFor(mode, latlng) {
    if (!latlng) return
    const { lat, lng } = latlng
    try { if (reverseAbortRef.current[mode]) reverseAbortRef.current[mode].abort() } catch {}
    const ctrl = new AbortController()
    reverseAbortRef.current[mode] = ctrl
    const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    mode === 'start' ? setStartAddr(fallback) : setEndAddr(fallback)
    try {
      const label = await reverseGeocodeOSM(lat, lng, { signal: ctrl.signal })
      if (ctrl.signal.aborted) return
      mode === 'start' ? setStartAddr(label || fallback) : setEndAddr(label || fallback)
    } catch {
      if (!ctrl.signal?.aborted) mode === 'start' ? setStartAddr(fallback) : setEndAddr(fallback)
    }
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      setLoadingBootstrap(true); setLoadingEvents(true); setLoadingClosures(true)
      try {
        const { data } = await api.get('/map_bootstrap')
        if (!alive) return
        setEvents(Array.isArray(data.events) ? data.events : [])
        const cl = Array.isArray(data.closures_active) ? data.closures_active : []
        setClosures(cl)
        closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
        setParkingSpots(Array.isArray(data.parking_spots) ? data.parking_spots : [])
        setCongestionZones(Array.isArray(data.congestion_active) ? data.congestion_active : [])
      } catch (e) {
        if (!alive) return
        setMsg('Gagal memuat data peta: ' + (e?.response?.data?.error || e.message))
      } finally {
        if (!alive) return
        setLoadingEvents(false); setLoadingClosures(false); setLoadingBootstrap(false)
      }
    })()
    return () => { alive = false }
  }, [])

  // ── Pick handler ───────────────────────────────────────────────────────────
  function onPick(latlng, mode) {
    if (mode === 'start') { setStart(latlng); setMsg('START tersimpan. Sekarang pilih TUJUAN.') }
    else                  { setEnd(latlng);   setMsg('TUJUAN tersimpan. Tekan "Cari Rute".') }
    fillAddressFor(mode, latlng)
  }

  // ── Destination helpers ────────────────────────────────────────────────────
  function applyEventAsDestination() {
    const ev = events.find(e => e.id === selectedEventId)
    if (!ev) return
    const pt = { lat: ev.lat, lng: ev.lng }
    setEnd(pt); setDestinationType('event')
    setMsg(`Tujuan di-set ke event: ${ev.name}. Tekan "Cari Rute".`)
    fillAddressFor('end', pt)
  }

  function applyParkingAsDestination() {
    const spot = spotsForSelectedEvent.find(s => String(s.id) === String(selectedParkingId))
    if (!spot) return
    const pt = { lat: spot.lat, lng: spot.lng }
    setEnd(pt); setDestinationType('parking')
    setMsg(`Tujuan di-set ke parkir: ${spot.name}. Tekan "Cari Rute".`)
    fillAddressFor('end', pt)
  }

  // ── Refresh closures + congestion ──────────────────────────────────────────
  async function refreshClosures({ force = false, silent = true } = {}) {
    const cache = closuresCacheRef.current
    if (!force && cache.data && Date.now() - cache.fetchedAt < CLOSURES_TTL_MS) { setClosures(cache.data || []); return }
    if (!silent) setMsg('Memuat rekayasa jalan...')
    setLoadingClosures(true)
    try {
      const { data } = await api.get('/map_bootstrap')
      const cl = Array.isArray(data?.closures_active) ? data.closures_active : []
      setClosures(cl)
      closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
      setCongestionZones(Array.isArray(data?.congestion_active) ? data.congestion_active : [])
    } catch (e) { console.warn('refreshClosures failed:', e) }
    finally { setLoadingClosures(false) }
  }

  // ── Route finding ──────────────────────────────────────────────────────────
  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start, e = customEnd || end
    if (!s || !e) { if (!silent) setMsg('START dan TUJUAN wajib diisi.'); return }
    setLoadingRoute(true)
    if (!silent) setMsg('Menghitung rute A* (tercepat & terpendek)...')
    setRoutes({ fastest: null, shortest: null }); setSteps([]); setStepIdx(0)
    try {
      const { data } = await api.post('/route', { start: s, end: e, mode: 'both' })
      const fast = data.fastest || null, short = data.shortest || null
      setRoutes({ fastest: fast, shortest: short })
      const chosen = (selectedMode === 'shortest' ? short : fast) || fast || short
      if (chosen) { setSteps(Array.isArray(chosen.steps) ? chosen.steps : []); setStepIdx(0) }
      if (!silent) setMsg(`Rute ditemukan. Estimasi ${chosen?.total_time_sec ? (chosen.total_time_sec / 60).toFixed(1) : '?'} menit. Pilih alternatif rute.`)
      await refreshClosures({ force: true, silent: true })
      // Fly kamera ke titik awal setelah rute ditemukan
      if (mapRef.current && s) setTimeout(() => mapRef.current?.flyTo([s.lat, s.lng], 16, { animate: true, duration: 1.2 }), 350)
    } catch (e2) {
      if (!silent) setMsg('Gagal: ' + (e2?.response?.data?.error || e2.message))
    } finally { setLoadingRoute(false) }
  }

  async function rerouteSelected(customStart, customEnd) {
    const s = customStart || start, e = customEnd || end
    if (!s || !e) return
    try {
      const { data } = await api.post('/route', { start: s, end: e, mode: selectedMode })
      if (!data) return
      setRoutes(prev => ({ ...prev, [selectedMode]: data }))
      setSteps(Array.isArray(data.steps) ? data.steps : [])
      setStepIdx(0)
      await refreshClosures({ force: true, silent: true })
    } catch (err) { console.warn('rerouteSelected failed:', err) }
  }

  // ── Geolocation ────────────────────────────────────────────────────────────
  function useMyLocationAsStart() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt); setStart(pt); setPickMode('end')
        setMsg('Lokasi kamu dipakai sebagai START. Sekarang pilih TUJUAN.')
        if (followMe && mapRef.current) mapRef.current.setView([pt.lat, pt.lng], 16)
        fillAddressFor('start', pt)
      },
      err => setGeoErr(err.message || 'Gagal mengambil lokasi'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }

  function startTracking() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')
    if (watchIdRef.current != null) return
    lastPosRef.current = null
    watchIdRef.current = navigator.geolocation.watchPosition(
      pos => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt)
        if (Number.isFinite(pos.coords.heading) && pos.coords.heading != null)
          setBearing((pos.coords.heading + 360) % 360)
        else if (lastPosRef.current) setBearing(bearingDeg(lastPosRef.current, pt))
        lastPosRef.current = pt
        if (followMe && mapRef.current) {
          const z = tracking ? Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM) : mapRef.current.getZoom()
          mapRef.current.flyTo([pt.lat, pt.lng], z, { animate: true, duration: FOLLOW_FLY_DURATION })
        }
      },
      err => setGeoErr(err.message || 'Navigasi gagal (GPS).'),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
    )
    setTracking(true)
    setMsg('Navigasi aktif. Jika melenceng dari rute, sistem akan hitung ulang otomatis.')
  }

  function stopTracking() {
    if (watchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null; setTracking(false); setMsg('Navigasi dimatikan.')
  }

  // ── Effects ────────────────────────────────────────────────────────────────
  React.useEffect(() => () => stopTracking(), [])

  React.useEffect(() => {
    if (tracking) return
    const r = routes?.[selectedMode]
    if (!r) return
    setSteps(Array.isArray(r.steps) ? r.steps : []); setStepIdx(0)
  }, [selectedMode]) // eslint-disable-line

  React.useEffect(() => {
    if (!tracking || !myPos || steps.length < 2 || stepIdx >= steps.length - 1) return
    const next = steps[stepIdx + 1]
    if (next?.location && haversineM(myPos, next.location) <= STEP_TRIGGER_M)
      setStepIdx(i => Math.min(i + 1, steps.length - 1))
  }, [tracking, myPos?.lat, myPos?.lng, steps, stepIdx]) // eslint-disable-line

  React.useEffect(() => {
    if (!tracking || !voiceOn) return
    const st = steps?.[stepIdx]
    if (!st?.instruction) return
    const now = Date.now(), last = lastSpokenStepRef.current
    if (last.idx === stepIdx && now - last.ts < 5000) return
    lastSpokenStepRef.current = { idx: stepIdx, ts: now }
    speak(st.instruction, { rate: 1.02, pitch: 1.0, lang: 'id-ID' })
  }, [tracking, voiceOn, stepIdx, steps]) // eslint-disable-line

  React.useEffect(() => {
    if (!tracking || !myPos) return
    const now = Date.now()
    if (now - lastStreetFetchRef.current < STREET_FETCH_MIN_MS) return
    lastStreetFetchRef.current = now
    api.get(`/nearest_street?lat=${myPos.lat}&lng=${myPos.lng}`)
      .then(res => setCurrentStreet(res?.data?.street_name || ''))
      .catch(() => {})
  }, [tracking, myPos?.lat, myPos?.lng]) // eslint-disable-line

  React.useEffect(() => {
    if (!tracking || !myPos || !end || !activeRoute?.polyline) return
    if (distanceToPolylineM(myPos, activeRoute.polyline) > OFF_ROUTE_TOLERANCE_M) rerouteSelected(myPos, end)
  }, [tracking, myPos?.lat, myPos?.lng, selectedMode]) // eslint-disable-line

  React.useEffect(() => {
    if (!tracking) return
    const id = setInterval(() => refreshClosures({ force: true, silent: true }), 30_000)
    return () => clearInterval(id)
  }, [tracking]) // eslint-disable-line

  // ── Recenter ───────────────────────────────────────────────────────────────
  const handleRecenter = () => {
    if (!mapRef.current) return
    const target = myPos || start
    if (target) mapRef.current.flyTo([target.lat, target.lng], Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM), { animate: true, duration: 0.6 })
    else mapRef.current.flyTo(DEFAULT_CENTER, 13, { animate: true, duration: 0.6 })
  }

  // ── Route button config ────────────────────────────────────────────────────
  const routeBtns = [
    { key: 'fastest',  Icon: IconZap,      label: 'Tercepat',  route: fastest,  activeText: 'text-yellow-300', inactiveText: 'text-[#8b1a1a]' },
    { key: 'shortest', Icon: IconMinimize, label: 'Terpendek', route: shortest, activeText: 'text-blue-300',   inactiveText: 'text-[#8b1a1a]' },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50">
      <div className="relative w-full" style={{ height: `calc(100vh - ${NAVBAR_H_PX}px)` }}>

        <MapBadge tracking={tracking} followMe={followMe} voiceOn={voiceOn} />
        <InstructionOverlay tracking={tracking} activeStep={activeStep} distToNext={distToNext} />
        <RouteSummaryBar activeRoute={activeRoute} selectedMode={selectedMode} tracking={tracking} myPos={myPos} end={end} onRecenter={handleRecenter} />

        {/* ── Right Panel ── */}
        <RightDockPanel open={rightPanelOpen} onToggle={() => setRightPanelOpen(v => !v)} title="RUTE SURO">

          {/* Loading */}
          {loadingBootstrap && (
            <div className="mb-4 rounded-2xl border border-[#8b1a1a]/20 bg-[#FEF5F5] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white"><IconInfo className="w-3.5 h-3.5" /></span>
                <p className="text-sm font-bold text-[#8b1a1a]">Memuat data peta…</p>
              </div>
              <div className="space-y-1 ml-9">
                <LoadDot loading={loadingEvents}   label="Memuat event…"          doneLabel="Event siap" />
                <LoadDot loading={loadingClosures} label="Memuat rekayasa jalan…" doneLabel="Rekayasa jalan siap" />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="mb-3 rounded-2xl border border-[#DDD8D0] bg-[#F4F2EF] px-3 py-2.5">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#6B6560] uppercase mb-1">Status</p>
            <p className="text-xs font-semibold text-[#2B3440] leading-relaxed">{msg}</p>
          </div>

          {/* Location inputs */}
          <div className="mb-1">
            <div className="relative flex flex-col gap-1.5">
              <LocationRow icon={IconLocationPin} label="Titik Awal" value={startLabel}
                placeholder="Pilih di peta atau gunakan lokasi saya"
                active={pickMode === 'start' && !tracking}
                onClick={() => { if (!tracking) { setPickMode('start'); setMsg('Mode: pilih START. Klik peta.') } }} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DDD8D0] bg-white shadow-sm text-[#6B6560]">
                  <IconArrowSwap className="w-3.5 h-3.5" />
                </span>
              </div>
              <LocationRow icon={IconFlag} label="Tujuan" value={endLabel}
                placeholder="Pilih di peta atau dari event"
                active={pickMode === 'end' && !tracking}
                onClick={() => { if (!tracking) { setPickMode('end'); setMsg('Mode: pilih TUJUAN. Klik peta.') } }} />
            </div>
          </div>

          <button onClick={useMyLocationAsStart}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#DDD8D0] bg-white hover:bg-[#F4F2EF] text-[#2B3440] font-bold text-sm transition hover:border-[#8b1a1a]/40">
            <IconMyLocation className="w-4 h-4 text-[#8b1a1a]" />Pakai Lokasi Saya sebagai START
          </button>

          {/* Event & Parkir */}
          <SectionDivider label="Tujuan Event" />
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white"><IconCalendar className="w-3.5 h-3.5" /></span>
              <p className="text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase">Pilih Event &amp; Tujuan</p>
            </div>

            <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wide mb-1">1. Pilih Event</p>
            <select value={selectedEventId}
              onChange={e => { setSelectedEventId(e.target.value); setSelectedParkingId(''); setDestinationType(null) }}
              className="w-full px-3 py-2.5 border border-[#DDD8D0] rounded-xl text-[#2B3440] font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a1a]/30 focus:border-[#8b1a1a] transition">
              <option value="">-- pilih event --</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}</option>)}
            </select>

            {selectedEventId && (
              <button onClick={applyEventAsDestination}
                className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-sm border transition ${destinationType === 'event' ? 'bg-[#6b1414] text-white border-[#6b1414] ring-2 ring-[#8b1a1a]/40' : 'bg-[#8b1a1a] hover:bg-[#6b1414] text-white border-[#8b1a1a]'}`}>
                <IconMapPin className="w-3.5 h-3.5" />
                {destinationType === 'event' ? 'Lokasi Event Dipilih' : 'Tuju Lokasi Event'}
              </button>
            )}

            {selectedEventId && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-px bg-[#DDD8D0]" />
                  <span className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wide">atau ke parkir</span>
                  <div className="flex-1 h-px bg-[#DDD8D0]" />
                </div>
                <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wide mb-1">2. Pilih Titik Parkir</p>
                {spotsForSelectedEvent.length === 0 ? (
                  <div className="px-3 py-2.5 rounded-xl border border-dashed border-[#DDD8D0] bg-[#F4F2EF] text-center">
                    <p className="text-xs text-[#A09890] font-semibold">Belum ada titik parkir untuk event ini</p>
                  </div>
                ) : (
                  <>
                    <select value={selectedParkingId} onChange={e => setSelectedParkingId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#DDD8D0] rounded-xl text-[#2B3440] font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500 transition">
                      <option value="">-- pilih titik parkir --</option>
                      {spotsForSelectedEvent.map(s => <option key={s.id} value={s.id}>{s.name}{s.capacity ? ` (${s.capacity} kend.)` : ''}</option>)}
                    </select>
                    <button onClick={applyParkingAsDestination} disabled={!selectedParkingId}
                      className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-sm border transition ${!selectedParkingId ? 'bg-[#F4F2EF] text-[#A09890] border-[#DDD8D0] cursor-not-allowed' : destinationType === 'parking' ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-400/40' : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-700'}`}>
                      <IconMapPin className="w-3.5 h-3.5" />
                      {destinationType === 'parking' && selectedParkingId
                        ? spotsForSelectedEvent.find(s => String(s.id) === String(selectedParkingId))?.name ?? 'Parkir Dipilih'
                        : 'Tuju Titik Parkir'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <SectionDivider label="Navigasi" />

          {/* Turn-by-turn */}
          {tracking && (activeStep || currentStreet) && (
            <div className="mb-3">
              {currentStreet && (
                <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold bg-white border border-[#DDD8D0] rounded-xl px-3 py-2 mb-2">
                  <IconRoute className="w-3.5 h-3.5 text-[#8b1a1a] flex-shrink-0" />
                  <span>Kamu sedang di: <b className="text-[#8b1a1a]">{currentStreet}</b></span>
                </div>
              )}
              {activeStep && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white mt-0.5">
                      {(() => { const t = (activeStep.type || '').toLowerCase(); return t.includes('left') ? <IconArrowTurnLeft className="w-4 h-4" /> : t.includes('right') ? <IconArrowTurnRight className="w-4 h-4" /> : <IconArrowUp className="w-4 h-4" /> })()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Instruksi</p>
                      <p className="text-sm font-bold text-emerald-900 leading-snug">{activeStep.instruction}</p>
                      {distToNext != null && <p className="mt-0.5 text-xs text-emerald-800 font-bold flex items-center gap-1"><IconRoute className="w-3 h-3" />{distToNext} m ke instruksi berikutnya</p>}
                      <p className="mt-1 text-[10px] text-emerald-700 font-bold">Langkah {Math.min(stepIdx + 1, steps.length)} / {steps.length || 0}</p>
                    </div>
                  </div>
                  <LaneSim step={activeStep} />
                </div>
              )}
            </div>
          )}

          {/* Cari Rute */}
          <SBtn onClick={() => findRoute()} disabled={loadingRoute || !canFindRoute}
            cls={`mb-2 ${loadingRoute || !canFindRoute ? 'bg-[#C8C3BB] cursor-not-allowed' : 'bg-[#8b1a1a] hover:bg-[#6b1414] shadow-[0_4px_14px_rgba(139,26,26,0.30)]'}`}>
            {loadingRoute ? <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />Menghitung Rute...</> : <><IconSearch className="w-4 h-4" />Cari Rute Terbaik</>}
          </SBtn>

          {/* Mulai / Stop Navigasi */}
          <SBtn onClick={() => tracking ? stopTracking() : startTracking()} disabled={!activeRoute && !tracking}
            cls={`mb-3 ${!activeRoute && !tracking ? 'bg-[#C8C3BB] cursor-not-allowed' : tracking ? 'bg-[#2B3440] hover:bg-gray-900' : 'bg-[#8b1a1a] hover:bg-[#6b1414] shadow-[0_4px_14px_rgba(139,26,26,0.30)]'}`}>
            {tracking ? <><IconStop className="w-4 h-4" />Stop Navigasi</> : <><IconNavigation className="w-4 h-4" />Mulai Navigasi</>}
          </SBtn>

          {/* Kontrol sekunder */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <SecCtrl active={followMe} onClick={() => setFollowMe(v => !v)}
              activeClass="bg-[#2B3440] text-white border-[#2B3440]"
              inactiveClass="bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]">
              <IconFollow className="w-4 h-4" />Ikuti {followMe ? 'ON' : 'OFF'}
            </SecCtrl>
            <SecCtrl active={voiceOn} onClick={() => setVoiceOn(v => !v)}
              activeClass="bg-[#8b1a1a] text-white border-[#8b1a1a]"
              inactiveClass="bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]">
              {voiceOn ? <IconVolume className="w-4 h-4" /> : <IconVolumeMute className="w-4 h-4" />}
              Suara {voiceOn ? 'ON' : 'OFF'}
            </SecCtrl>
            <SecCtrl active={false}
              onClick={() => { if (tracking && activeStep?.instruction && voiceOn) speak(activeStep.instruction, { lang: 'id-ID' }) }}
              activeClass=""
              inactiveClass={!tracking || !activeStep?.instruction || !voiceOn ? 'bg-[#F4F2EF] text-[#A09890] border-[#DDD8D0] cursor-not-allowed' : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'}>
              <IconRepeat className="w-4 h-4" />Ulangi
            </SecCtrl>
          </div>

          {/* Pilih rute */}
          {hasRoutes && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white"><IconRoute className="w-3.5 h-3.5" /></span>
                  <p className="text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase">Pilih Rute</p>
                </div>
                {lockPickRoute && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F2EF] border border-[#DDD8D0] text-[#6B6560] font-bold">terkunci saat navigasi</span>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {routeBtns.map(({ key, Icon, label, route, activeText, inactiveText }) => (
                  <button key={key} type="button" disabled={!route || lockPickRoute}
                    onClick={() => { setSelectedMode(key); if (route) { setSteps(Array.isArray(route.steps) ? route.steps : []); setStepIdx(0) } }}
                    className={`text-left px-3 py-2.5 rounded-xl border transition ${selectedMode === key ? 'bg-[#2B3440] text-white border-[#2B3440]' : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'} ${!route || lockPickRoute ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${selectedMode === key ? activeText : inactiveText}`} />
                      <span className="font-extrabold text-xs">{label}</span>
                    </div>
                    <p className={`text-xs font-bold ${selectedMode === key ? 'text-white' : 'text-[#2B3440]'}`}>{fmtMin(route?.total_time_sec)}</p>
                    <p className={`text-[10px] font-semibold ${selectedMode === key ? 'text-white/75' : 'text-[#6B6560]'}`}>{fmtKm(route?.total_length_m)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Geo error */}
          {geoErr && (
            <div className="flex items-start gap-2 text-xs text-[#8b1a1a] font-semibold bg-[#FEF5F5] border border-[#8b1a1a]/30 rounded-xl p-3 mb-3">
              <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><p>{geoErr}</p>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-2xl border border-[#DDD8D0] bg-[#F4F2EF] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white"><IconAlertTriangle className="w-3.5 h-3.5" /></span>
              <p className="text-xs font-extrabold text-[#2B3440] uppercase tracking-wide">Informasi Peta</p>
            </div>
            {/* Jalan ditutup */}
            <LegendRow color="#dc2626" label="Jalan ditutup (rekayasa)" />
            {/* Macet sedang — 2 garis tipis oranye */}
            <LegendRow label="Macet sedang (2 garis oranye)">
              <span className="inline-flex flex-col gap-[2.5px]">
                <span className="inline-block w-4 h-[2.5px] bg-orange-500 rounded-sm" />
                <span className="inline-block w-4 h-[2.5px] bg-orange-500 rounded-sm" />
              </span>
            </LegendRow>
            {/* Macet parah — 2 garis tipis merah */}
            <LegendRow label="Macet parah (2 garis merah)">
              <span className="inline-flex flex-col gap-[2.5px]">
                <span className="inline-block w-4 h-[2.5px] bg-red-600 rounded-sm" />
                <span className="inline-block w-4 h-[2.5px] bg-red-600 rounded-sm" />
              </span>
            </LegendRow>
            <LegendRow color="#1d4ed8" label="Rute tercepat (aktif)" />
            <LegendRow color="#38bdf8" label="Rute terpendek (aktif)" />
            <LegendRow color="#9ca3af" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#9ca3af 0,#9ca3af 4px,transparent 4px,transparent 8px)' }} label="Rute alternatif (tidak aktif)" />
            <LegendRow label="Titik parkir tersedia">
              <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[3px] bg-[#1a47a0] text-white font-black text-[9px] leading-none" style={{ fontFamily: 'Arial,sans-serif' }}>P</span>
            </LegendRow>
            <LegendRow label="Parkir / tujuan dipilih">
              <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{ width: 8, height: 13, filter: 'hue-rotate(140deg) saturate(3) brightness(0.85)' }} alt="" />
            </LegendRow>
            <LegendRow label="Lokasi event (preview)">
              <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{ width: 8, height: 13 }} alt="" />
            </LegendRow>
            <LegendRow label="Tujuan event dipilih">
              <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{ width: 10, height: 16, filter: 'hue-rotate(140deg) saturate(3) brightness(0.85)' }} alt="" />
            </LegendRow>
            {loadingClosures && (
              <p className="mt-1.5 ml-9 text-[11px] text-[#6B6560] font-bold flex items-center gap-1">
                <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#8b1a1a]" />Memuat rekayasa jalan...
              </p>
            )}
          </div>
        </RightDockPanel>

        {/* ── Map ── */}
        <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}
          whenCreated={map => { mapRef.current = map }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickSetter mode={pickMode} onPick={onPick} />
          <MapLayers
            myPos={myPos} bearing={bearing} start={start} end={end}
            selectedEventId={selectedEventId} events={events}
            destinationType={destinationType} spotsForSelectedEvent={spotsForSelectedEvent}
            selectedParkingId={selectedParkingId} closures={closures}
            congestionZones={congestionZones}
            routes={routes} selectedMode={selectedMode} tracking={tracking} nextStep={nextStep}
            setEnd={setEnd} setSelectedParkingId={setSelectedParkingId}
            setDestinationType={setDestinationType} setMsg={setMsg}
            fillAddressFor={fillAddressFor} applyEventAsDestination={applyEventAsDestination}
          />
        </MapContainer>
      </div>
    </div>
  )
}