import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import dayjs from 'dayjs'
import { api } from '../../lib/api.js'
import RightDockPanel from '../../components/RightDockPanel.jsx'

// ── Map sub-components ────────────────────────────────────────────────────────
import MapLayers, { ClickSetter } from '../../components/map/MapLayers.jsx'
import {
  MapBadge,
  InstructionOverlay,
  RouteSummaryBar,
  LaneSim,
  SectionDivider,
  LocationRow,
  fmtMin,
  fmtKm,
  haversineM,
  bearingDeg,
  distanceToPolylineM,
  speak,
  fetchWithTimeout,
} from '../../components/map/MapOverlays.jsx'
import {
  IconLocationPin,
  IconFlag,
  IconMyLocation,
  IconNavigation,
  IconVolume,
  IconVolumeMute,
  IconFollow,
  IconRepeat,
  IconSearch,
  IconRoute,
  IconZap,
  IconMinimize,
  IconAlertTriangle,
  IconCalendar,
  IconMapPin,
  IconInfo,
  IconStop,
  IconArrowTurnLeft,
  IconArrowTurnRight,
  IconArrowUp,
  IconArrowSwap,
} from '../../components/map/MapSvgIcons.jsx'

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER        = [-7.871, 111.462]
const OFF_ROUTE_TOLERANCE_M = 35
const NAVBAR_H_PX           = 80
const CLOSURES_TTL_MS       = 30 * 1000
const STEP_TRIGGER_M        = 25
const STREET_FETCH_MIN_MS   = 3000
const FOLLOW_ZOOM           = 18
const FOLLOW_FLY_DURATION   = 0.65
const REVERSE_GEO_TTL_MS    = 24 * 60 * 60 * 1000
const REVERSE_GEO_TIMEOUT_MS = 9000

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserMapPage() {

  // ── Core state ───────────────────────────────────────────────────────────────
  const [events,          setEvents]          = React.useState([])
  const [closures,        setClosures]        = React.useState([])
  const [selectedEventId, setSelectedEventId] = React.useState('')

  const [start,    setStart]    = React.useState(null)
  const [end,      setEnd]      = React.useState(null)
  const [pickMode, setPickMode] = React.useState('start')

  const [startAddr, setStartAddr] = React.useState('')
  const [endAddr,   setEndAddr]   = React.useState('')

  const [routes,       setRoutes]       = React.useState({ fastest: null, shortest: null })
  const [selectedMode, setSelectedMode] = React.useState('fastest')
  const activeRoute = routes?.[selectedMode] || null

  const [steps,         setSteps]         = React.useState([])
  const [stepIdx,       setStepIdx]       = React.useState(0)
  const [currentStreet, setCurrentStreet] = React.useState('')

  const [loadingBootstrap, setLoadingBootstrap] = React.useState(true)
  const [loadingEvents,    setLoadingEvents]     = React.useState(true)
  const [loadingClosures,  setLoadingClosures]   = React.useState(true)
  const [loadingRoute,     setLoadingRoute]      = React.useState(false)

  const [msg, setMsg] = React.useState('Pilih START dan TUJUAN, lalu tekan "Cari Rute".')

  const [myPos,    setMyPos]    = React.useState(null)
  const [geoErr,   setGeoErr]   = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [followMe, setFollowMe] = React.useState(true)

  const [voiceOn, setVoiceOn] = React.useState(true)
  const [bearing, setBearing] = React.useState(0)

  const lastPosRef         = React.useRef(null)
  const lastSpokenStepRef  = React.useRef({ idx: -1, ts: 0 })
  const mapRef             = React.useRef(null)
  const watchIdRef         = React.useRef(null)
  const closuresCacheRef   = React.useRef({ data: null, fetchedAt: 0 })
  const lastStreetFetchRef = React.useRef(0)
  const reverseCacheRef    = React.useRef(new Map())
  const reverseAbortRef    = React.useRef({ start: null, end: null })

  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false

  // ── Parking state ────────────────────────────────────────────────────────────
  const [parkingSpots,     setParkingSpots]     = React.useState([])
  const [selectedParkingId, setSelectedParkingId] = React.useState('')
  const [destinationType,   setDestinationType]   = React.useState(null)
  // null = belum pilih tujuan, 'event' = tuju event, 'parking' = tuju parkir

  const spotsForSelectedEvent = React.useMemo(
    () => parkingSpots.filter(s => String(s.event_id) === String(selectedEventId)),
    [parkingSpots, selectedEventId]
  )

  React.useEffect(() => {
    if (isMobile) setRightPanelOpen(true)
  }, [isMobile])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const startLabel   = startAddr || (start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : null)
  const endLabel     = endAddr   || (end   ? `${end.lat.toFixed(5)},   ${end.lng.toFixed(5)}`   : null)
  const canFindRoute = !!start && !!end
  const activeStep   = steps?.[stepIdx]
  const nextStep     = steps?.[stepIdx + 1]
  const distToNext   = myPos && nextStep?.location ? Math.round(haversineM(myPos, nextStep.location)) : null
  const fastest      = routes.fastest
  const shortest     = routes.shortest
  const hasRoutes    = !!fastest || !!shortest
  const lockPickRoute = tracking

  // ── Reverse geocode ──────────────────────────────────────────────────────────
  function roundKey(lat, lng) { return `${lat.toFixed(5)},${lng.toFixed(5)}` }

  async function reverseGeocodeOSM(lat, lng, { signal } = {}) {
    const key    = roundKey(lat, lng)
    const now    = Date.now()
    const cached = reverseCacheRef.current.get(key)
    if (cached && now - cached.ts < REVERSE_GEO_TTL_MS) return cached.label
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
    const res  = await fetchWithTimeout(url, { timeoutMs: REVERSE_GEO_TIMEOUT_MS, signal, headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error('reverse geocode failed')
    const data  = await res.json()
    const label = data?.display_name || ''
    if (label) reverseCacheRef.current.set(key, { label, ts: now })
    return label
  }

  async function fillAddressFor(mode, latlng) {
    if (!latlng) return
    const { lat, lng } = latlng
    try { if (reverseAbortRef.current[mode]) reverseAbortRef.current[mode].abort() } catch {}
    const ctrl     = new AbortController()
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

  // ── Bootstrap ────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let alive = true
    ;(async () => {
      setLoadingBootstrap(true); setLoadingEvents(true); setLoadingClosures(true)
      try {
        const res  = await api.get('/map_bootstrap')
        const data = res.data || {}
        if (!alive) return
        setEvents(Array.isArray(data.events) ? data.events : [])
        const cl = Array.isArray(data.closures_active) ? data.closures_active : []
        setClosures(cl)
        closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
        setParkingSpots(Array.isArray(data.parking_spots) ? data.parking_spots : [])
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

  // ── Pick handler ─────────────────────────────────────────────────────────────
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

  // ── Event / Parking destination ──────────────────────────────────────────────
  function applyEventAsDestination() {
    const ev = events.find(e => e.id === selectedEventId)
    if (!ev) return
    const pt = { lat: ev.lat, lng: ev.lng }
    setEnd(pt)
    setDestinationType('event')
    setMsg(`Tujuan di-set ke event: ${ev.name}. Tekan "Cari Rute".`)
    fillAddressFor('end', pt)
  }

  function applyParkingAsDestination() {
    const spot = spotsForSelectedEvent.find(s => String(s.id) === String(selectedParkingId))
    if (!spot) return
    const pt = { lat: spot.lat, lng: spot.lng }
    setEnd(pt)
    setDestinationType('parking')
    setMsg(`Tujuan di-set ke parkir: ${spot.name}. Tekan "Cari Rute".`)
    fillAddressFor('end', pt)
  }

  // ── Closures refresh ─────────────────────────────────────────────────────────
  async function refreshClosures({ force = false, silent = true } = {}) {
    const cache = closuresCacheRef.current
    if (!force && cache.data && Date.now() - cache.fetchedAt < CLOSURES_TTL_MS) {
      setClosures(cache.data || []); return
    }
    if (!silent) setMsg('Memuat rekayasa jalan...')
    setLoadingClosures(true)
    try {
      const res = await api.get('/map_bootstrap')
      const cl  = Array.isArray(res.data?.closures_active) ? res.data.closures_active : []
      setClosures(cl)
      closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
    } catch (e) { console.warn('refreshClosures failed:', e) }
    finally { setLoadingClosures(false) }
  }

  // ── Route finding ────────────────────────────────────────────────────────────
  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start, e = customEnd || end
    if (!s || !e) { if (!silent) setMsg('START dan TUJUAN wajib diisi.'); return }
    setLoadingRoute(true)
    if (!silent) setMsg('Menghitung rute A* (tercepat & terpendek)...')
    setRoutes({ fastest: null, shortest: null }); setSteps([]); setStepIdx(0)
    try {
      const res     = await api.post('/route', { start: s, end: e, mode: 'both' })
      const data    = res.data || {}
      const fastest = data.fastest || null
      const shortest = data.shortest || null
      setRoutes({ fastest, shortest })
      const chosen  = (selectedMode === 'shortest' ? shortest : fastest) || fastest || shortest
      if (chosen) { setSteps(Array.isArray(chosen.steps) ? chosen.steps : []); setStepIdx(0) }
      if (!silent) {
        const mins = chosen?.total_time_sec ? (chosen.total_time_sec / 60).toFixed(1) : '?'
        setMsg(`Rute ditemukan. Estimasi ${mins} menit. Pilih alternatif rute.`)
      }
      await refreshClosures({ force: true, silent: true })
    } catch (e2) {
      if (!silent) setMsg('Gagal: ' + (e2?.response?.data?.error || e2.message))
    } finally { setLoadingRoute(false) }
  }

  async function rerouteSelected(customStart, customEnd) {
    const s = customStart || start, e = customEnd || end
    if (!s || !e) return
    try {
      const res = await api.post('/route', { start: s, end: e, mode: selectedMode })
      const r   = res.data || null
      if (!r) return
      setRoutes(prev => ({ ...prev, [selectedMode]: r }))
      setSteps(Array.isArray(r.steps) ? r.steps : [])
      setStepIdx(0)
      await refreshClosures({ force: true, silent: true })
    } catch (err) { console.warn('rerouteSelected failed:', err) }
  }

  // ── Geolocation ──────────────────────────────────────────────────────────────
  function useMyLocationAsStart() {
    setGeoErr('')
    if (!navigator.geolocation) return setGeoErr('Browser tidak mendukung Geolocation.')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMyPos(pt); setStart(pt); setPickMode('end')
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
    if (watchIdRef.current != null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current)
    watchIdRef.current = null; setTracking(false); setMsg('Navigasi dimatikan.')
  }

  // ── Effects ──────────────────────────────────────────────────────────────────
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
    if (!tracking || !myPos || steps.length < 2 || stepIdx >= steps.length - 1) return
    const next = steps[stepIdx + 1]
    if (!next?.location) return
    if (haversineM(myPos, next.location) <= STEP_TRIGGER_M) setStepIdx(i => Math.min(i + 1, steps.length - 1))
  }, [tracking, myPos?.lat, myPos?.lng, steps, stepIdx])

  React.useEffect(() => {
    if (!tracking || !voiceOn) return
    const st = steps?.[stepIdx]
    if (!st?.instruction) return
    const now  = Date.now()
    const last = lastSpokenStepRef.current
    if (last.idx === stepIdx && now - last.ts < 5000) return
    lastSpokenStepRef.current = { idx: stepIdx, ts: now }
    speak(st.instruction, { rate: 1.02, pitch: 1.0, lang: 'id-ID' })
  }, [tracking, voiceOn, stepIdx, steps])

  React.useEffect(() => {
    if (!tracking || !myPos) return
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
    if (!tracking || !myPos || !end || !activeRoute?.polyline) return
    if (distanceToPolylineM(myPos, activeRoute.polyline) > OFF_ROUTE_TOLERANCE_M) rerouteSelected(myPos, end)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking, myPos?.lat, myPos?.lng, selectedMode])

  React.useEffect(() => {
    if (!tracking) return
    const id = setInterval(() => refreshClosures({ force: true, silent: true }), 30_000)
    return () => clearInterval(id)
  }, [tracking])

  // ── Recenter ─────────────────────────────────────────────────────────────────
  const handleRecenter = () => {
    if (!mapRef.current) return
    if (myPos)  mapRef.current.flyTo([myPos.lat,  myPos.lng],  Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM), { animate: true, duration: 0.6 })
    else if (start) mapRef.current.flyTo([start.lat, start.lng], 16, { animate: true, duration: 0.6 })
    else mapRef.current.flyTo(DEFAULT_CENTER, 13, { animate: true, duration: 0.6 })
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50">
      <div className="relative w-full" style={{ height: `calc(100vh - ${NAVBAR_H_PX}px)` }}>

        <MapBadge tracking={tracking} followMe={followMe} voiceOn={voiceOn} />
        <InstructionOverlay tracking={tracking} activeStep={activeStep} distToNext={distToNext} />
        <RouteSummaryBar
          activeRoute={activeRoute} selectedMode={selectedMode}
          tracking={tracking} myPos={myPos} end={end}
          onRecenter={handleRecenter}
        />

        {/* ── Right Panel ── */}
        <RightDockPanel open={rightPanelOpen} onToggle={() => setRightPanelOpen(v => !v)} title="RUTE SURO">

          {/* Loading */}
          {loadingBootstrap && (
            <div className="mb-4 rounded-2xl border border-[#8b1a1a]/20 bg-[#FEF5F5] p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                  <IconInfo className="w-3.5 h-3.5" />
                </span>
                <p className="text-sm font-bold text-[#8b1a1a]">Memuat data peta…</p>
              </div>
              <div className="space-y-1 ml-9">
                <p className="text-xs text-[#5a1212] font-semibold flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${loadingEvents ? 'bg-[#8b1a1a] animate-pulse' : 'bg-emerald-500'}`} />
                  {loadingEvents ? 'Memuat event…' : 'Event siap'}
                </p>
                <p className="text-xs text-[#5a1212] font-semibold flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${loadingClosures ? 'bg-[#8b1a1a] animate-pulse' : 'bg-emerald-500'}`} />
                  {loadingClosures ? 'Memuat rekayasa jalan…' : 'Rekayasa jalan siap'}
                </p>
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
              <LocationRow
                icon={IconLocationPin}
                label="Titik Awal"
                value={startLabel}
                placeholder="Pilih di peta atau gunakan lokasi saya"
                active={pickMode === 'start' && !tracking}
                onClick={() => { if (!tracking) { setPickMode('start'); setMsg('Mode: pilih START. Klik peta.') } }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DDD8D0] bg-white shadow-sm text-[#6B6560]">
                  <IconArrowSwap className="w-3.5 h-3.5" />
                </span>
              </div>
              <LocationRow
                icon={IconFlag}
                label="Tujuan"
                value={endLabel}
                placeholder="Pilih di peta atau dari event"
                active={pickMode === 'end' && !tracking}
                onClick={() => { if (!tracking) { setPickMode('end'); setMsg('Mode: pilih TUJUAN. Klik peta.') } }}
              />
            </div>
          </div>

          {/* Use my location */}
          <button
            onClick={useMyLocationAsStart}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#DDD8D0] bg-white hover:bg-[#F4F2EF] text-[#2B3440] font-bold text-sm transition hover:border-[#8b1a1a]/40"
          >
            <IconMyLocation className="w-4 h-4 text-[#8b1a1a]" />
            Pakai Lokasi Saya sebagai START
          </button>

          {/* ── Section: Event & Parkir ── */}
          <SectionDivider label="Tujuan Event" />

          <div className="mb-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                <IconCalendar className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase">
                Pilih Event &amp; Tujuan
              </p>
            </div>

            {/* Step 1: pilih event */}
            <p className="text-[10px] font-bold text-[#6B6560] uppercase tracking-wide mb-1">1. Pilih Event</p>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value)
                setSelectedParkingId('')
                setDestinationType(null)
              }}
              className="w-full px-3 py-2.5 border border-[#DDD8D0] rounded-xl text-[#2B3440] font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a1a]/30 focus:border-[#8b1a1a] transition"
            >
              <option value="">-- pilih event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}{ev.start_time ? ` (${dayjs(ev.start_time).format('DD/MM HH:mm')})` : ''}
                </option>
              ))}
            </select>

            {/* Tombol tuju lokasi event */}
            {selectedEventId && (
              <button
                onClick={applyEventAsDestination}
                className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-sm border transition ${
                  destinationType === 'event'
                    ? 'bg-[#6b1414] text-white border-[#6b1414] ring-2 ring-[#8b1a1a]/40'
                    : 'bg-[#8b1a1a] hover:bg-[#6b1414] text-white border-[#8b1a1a]'
                }`}
              >
                <IconMapPin className="w-3.5 h-3.5" />
                {destinationType === 'event' ? 'Lokasi Event Dipilih' : 'Tuju Lokasi Event'}
              </button>
            )}

            {/* Step 2: pilih parkir */}
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
                    <select
                      value={selectedParkingId}
                      onChange={(e) => setSelectedParkingId(e.target.value)}
                      className="w-full px-3 py-2.5 border border-[#DDD8D0] rounded-xl text-[#2B3440] font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500 transition"
                    >
                      <option value="">-- pilih titik parkir --</option>
                      {spotsForSelectedEvent.map(spot => (
                        <option key={spot.id} value={spot.id}>
                          {spot.name}{spot.capacity ? ` (${spot.capacity} kend.)` : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={applyParkingAsDestination}
                      disabled={!selectedParkingId}
                      className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-sm border transition ${
                        !selectedParkingId
                          ? 'bg-[#F4F2EF] text-[#A09890] border-[#DDD8D0] cursor-not-allowed'
                          : destinationType === 'parking'
                            ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-400/40'
                            : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-700'
                      }`}
                    >
                      <IconMapPin className="w-3.5 h-3.5" />
                      {destinationType === 'parking' && selectedParkingId
                        ? spotsForSelectedEvent.find(s => String(s.id) === String(selectedParkingId))?.name ?? 'Parkir Dipilih'
                        : 'Tuju Titik Parkir'
                      }
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <SectionDivider label="Navigasi" />

          {/* Turn by turn */}
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
                      {(() => {
                        const t = (activeStep.type || '').toLowerCase()
                        if (t.includes('left'))  return <IconArrowTurnLeft className="w-4 h-4" />
                        if (t.includes('right')) return <IconArrowTurnRight className="w-4 h-4" />
                        return <IconArrowUp className="w-4 h-4" />
                      })()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Instruksi</p>
                      <p className="text-sm font-bold text-emerald-900 leading-snug">{activeStep.instruction}</p>
                      {distToNext != null && (
                        <p className="mt-0.5 text-xs text-emerald-800 font-bold flex items-center gap-1">
                          <IconRoute className="w-3 h-3" />
                          {distToNext} m ke instruksi berikutnya
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-emerald-700 font-bold">
                        Langkah {Math.min(stepIdx + 1, steps.length)} / {steps.length || 0}
                      </p>
                    </div>
                  </div>
                  <LaneSim step={activeStep} />
                </div>
              )}
            </div>
          )}

          {/* Cari Rute */}
          <button
            onClick={() => findRoute()}
            disabled={loadingRoute || !canFindRoute}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 font-bold text-white text-sm rounded-2xl transition mb-2 ${
              loadingRoute || !canFindRoute
                ? 'bg-[#C8C3BB] cursor-not-allowed'
                : 'bg-[#8b1a1a] hover:bg-[#6b1414] shadow-[0_4px_14px_rgba(139,26,26,0.30)] hover:shadow-[0_6px_20px_rgba(139,26,26,0.40)]'
            }`}
          >
            {loadingRoute
              ? <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />Menghitung Rute...</>
              : <><IconSearch className="w-4 h-4" />Cari Rute Terbaik</>
            }
          </button>

          {/* Mulai / Stop Navigasi */}
          <button
            onClick={() => tracking ? stopTracking() : startTracking()}
            disabled={!activeRoute && !tracking}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 font-bold text-white text-sm rounded-2xl transition mb-3 ${
              (!activeRoute && !tracking)
                ? 'bg-[#C8C3BB] cursor-not-allowed'
                : tracking
                  ? 'bg-[#2B3440] hover:bg-gray-900 shadow-[0_4px_14px_rgba(43,52,64,0.30)]'
                  : 'bg-[#8b1a1a] hover:bg-[#6b1414] shadow-[0_4px_14px_rgba(139,26,26,0.30)] hover:shadow-[0_6px_20px_rgba(139,26,26,0.40)]'
            }`}
          >
            {tracking
              ? <><IconStop className="w-4 h-4" />Stop Navigasi</>
              : <><IconNavigation className="w-4 h-4" />Mulai Navigasi</>
            }
          </button>

          {/* Kontrol sekunder */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setFollowMe(v => !v)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                followMe ? 'bg-[#2B3440] text-white border-[#2B3440]' : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'
              }`}
            >
              <IconFollow className="w-4 h-4" />
              Ikuti {followMe ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setVoiceOn(v => !v)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                voiceOn ? 'bg-[#8b1a1a] text-white border-[#8b1a1a] hover:bg-[#6b1414]' : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'
              }`}
            >
              {voiceOn ? <IconVolume className="w-4 h-4" /> : <IconVolumeMute className="w-4 h-4" />}
              Suara {voiceOn ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => { if (tracking && activeStep?.instruction) speak(activeStep.instruction, { lang: 'id-ID' }) }}
              disabled={!tracking || !activeStep?.instruction || !voiceOn}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                (!tracking || !activeStep?.instruction || !voiceOn)
                  ? 'bg-[#F4F2EF] text-[#A09890] border-[#DDD8D0] cursor-not-allowed'
                  : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'
              }`}
            >
              <IconRepeat className="w-4 h-4" />
              Ulangi
            </button>
          </div>

          {/* Pilih rute alternatif */}
          {hasRoutes && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                    <IconRoute className="w-3.5 h-3.5" />
                  </span>
                  <p className="text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase">Pilih Rute</p>
                </div>
                {lockPickRoute && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F4F2EF] border border-[#DDD8D0] text-[#6B6560] font-bold">
                    terkunci saat navigasi
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!fastest || lockPickRoute}
                  onClick={() => {
                    setSelectedMode('fastest')
                    if (fastest) { setSteps(Array.isArray(fastest.steps) ? fastest.steps : []); setStepIdx(0) }
                  }}
                  className={`text-left px-3 py-2.5 rounded-xl border transition ${
                    selectedMode === 'fastest'
                      ? 'bg-[#2B3440] text-white border-[#2B3440]'
                      : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF] hover:border-[#8b1a1a]/40'
                  } ${(!fastest || lockPickRoute) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IconZap className={`w-3.5 h-3.5 flex-shrink-0 ${selectedMode === 'fastest' ? 'text-yellow-300' : 'text-[#8b1a1a]'}`} />
                    <span className="font-extrabold text-xs">Tercepat</span>
                  </div>
                  <p className={`text-xs font-bold ${selectedMode === 'fastest' ? 'text-white' : 'text-[#2B3440]'}`}>
                    {fmtMin(fastest?.total_time_sec)}
                  </p>
                  <p className={`text-[10px] font-semibold ${selectedMode === 'fastest' ? 'text-white/75' : 'text-[#6B6560]'}`}>
                    {fmtKm(fastest?.total_length_m)}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!shortest || lockPickRoute}
                  onClick={() => {
                    setSelectedMode('shortest')
                    if (shortest) { setSteps(Array.isArray(shortest.steps) ? shortest.steps : []); setStepIdx(0) }
                  }}
                  className={`text-left px-3 py-2.5 rounded-xl border transition ${
                    selectedMode === 'shortest'
                      ? 'bg-[#2B3440] text-white border-[#2B3440]'
                      : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF] hover:border-[#8b1a1a]/40'
                  } ${(!shortest || lockPickRoute) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <IconMinimize className={`w-3.5 h-3.5 flex-shrink-0 ${selectedMode === 'shortest' ? 'text-blue-300' : 'text-[#8b1a1a]'}`} />
                    <span className="font-extrabold text-xs">Terpendek</span>
                  </div>
                  <p className={`text-xs font-bold ${selectedMode === 'shortest' ? 'text-white' : 'text-[#2B3440]'}`}>
                    {fmtMin(shortest?.total_time_sec)}
                  </p>
                  <p className={`text-[10px] font-semibold ${selectedMode === 'shortest' ? 'text-white/75' : 'text-[#6B6560]'}`}>
                    {fmtKm(shortest?.total_length_m)}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Geo error */}
          {geoErr && (
            <div className="flex items-start gap-2 text-xs text-[#8b1a1a] font-semibold bg-[#FEF5F5] border border-[#8b1a1a]/30 rounded-xl p-3 mb-3">
              <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#8b1a1a]" />
              <p>{geoErr}</p>
            </div>
          )}

          {/* Informasi peta / legend */}
          <div className="rounded-2xl border border-[#DDD8D0] bg-[#F4F2EF] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                <IconAlertTriangle className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-extrabold text-[#2B3440] uppercase tracking-wide">Informasi Peta</p>
            </div>
            {/* Jalan ditutup */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-4 h-1.5 bg-red-600 rounded-sm" />
                <span>Jalan ditutup (rekayasa)</span>
              </span>
            </div>
            {/* Rute tercepat */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-4 h-1.5 bg-blue-700 rounded-sm" />
                <span>Rute tercepat (aktif)</span>
              </span>
            </div>
            {/* Rute terpendek */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-4 h-1.5 rounded-sm" style={{ background: '#38bdf8' }} />
                <span>Rute terpendek (aktif)</span>
              </span>
            </div>
            {/* Rute tidak aktif */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-4 h-1.5 bg-gray-400 rounded-sm opacity-70" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#9ca3af 0,#9ca3af 4px,transparent 4px,transparent 8px)' }} />
                <span>Rute alternatif (tidak aktif)</span>
              </span>
            </div>
            {/* Parkir — kotak biru rambu P */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-[3px] bg-[#1a47a0] text-white font-black text-[9px] leading-none" style={{fontFamily:'Arial,sans-serif'}}>P</span>
                <span>Titik parkir tersedia</span>
              </span>
            </div>
            {/* Parkir/event dipilih — marker merah Leaflet kecil */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{width:'8px',height:'13px',filter:'hue-rotate(140deg) saturate(3) brightness(0.85)'}} alt="" />
                <span>Parkir / tujuan dipilih</span>
              </span>
            </div>
            {/* Event preview — marker biru Leaflet kecil */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{width:'8px',height:'13px'}} alt="" />
                <span>Lokasi event (preview)</span>
              </span>
            </div>
            {/* Event dipilih — marker merah Leaflet lebih besar */}
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9 mt-1">
              <span className="inline-flex items-center gap-1.5">
                <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" style={{width:'10px',height:'16px',filter:'hue-rotate(140deg) saturate(3) brightness(0.85)'}} alt="" />
                <span>Tujuan event dipilih</span>
              </span>
            </div>
            {loadingClosures && (
              <p className="mt-1.5 ml-9 text-[11px] text-[#6B6560] font-bold flex items-center gap-1">
                <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#8b1a1a]" />
                Memuat rekayasa jalan...
              </p>
            )}
          </div>
        </RightDockPanel>

        {/* ── Map ── */}
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

          <MapLayers
            myPos={myPos}
            bearing={bearing}
            start={start}
            end={end}
            selectedEventId={selectedEventId}
            events={events}
            destinationType={destinationType}
            spotsForSelectedEvent={spotsForSelectedEvent}
            selectedParkingId={selectedParkingId}
            closures={closures}
            routes={routes}
            selectedMode={selectedMode}
            tracking={tracking}
            nextStep={nextStep}
            setEnd={setEnd}
            setSelectedParkingId={setSelectedParkingId}
            setDestinationType={setDestinationType}
            setMsg={setMsg}
            fillAddressFor={fillAddressFor}
            applyEventAsDestination={applyEventAsDestination}
          />
        </MapContainer>
      </div>
    </div>
  )
}