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

const STEP_TRIGGER_M = 25
const STREET_FETCH_MIN_MS = 3000

const FOLLOW_ZOOM = 18
const FOLLOW_FLY_DURATION = 0.65

const REVERSE_GEO_TTL_MS = 24 * 60 * 60 * 1000
const REVERSE_GEO_TIMEOUT_MS = 9000

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconLocationPin({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconFlag({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconMyLocation({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />
    </svg>
  )
}

function IconNavigation({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconVolume({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconVolumeMute({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconFollow({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconRepeat({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconSearch({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconRoute({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="19" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 8.5v2a5 5 0 005 5h4a5 5 0 015 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconZap({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconMinimize({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconAlertTriangle({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconMapPin({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconInfo({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconStop({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconArrowTurnLeft({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 14L4 9l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10a6 6 0 016 6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconArrowTurnRight({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 14l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 9H10a6 6 0 00-6 6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconArrowUp({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconHeart({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconArrowSwap({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 16V4m0 0L3 8m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconRecenter({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

// ─── Map helpers ──────────────────────────────────────────────────────────────

function ClickSetter({ mode, onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng }, mode)
    }
  })
  return null
}

function pointToSegmentDistanceM(p, a, b) {
  const toXY = (ll) => {
    const x = ll.lng * 111320 * Math.cos((p.lat * Math.PI) / 180)
    const y = ll.lat * 110540
    return { x, y }
  }
  const P = toXY(p), A = toXY(a), B = toXY(b)
  const ABx = B.x - A.x, ABy = B.y - A.y
  const APx = P.x - A.x, APy = P.y - A.y
  const ab2 = ABx * ABx + ABy * ABy
  let t = ab2 === 0 ? 0 : (APx * ABx + APy * ABy) / ab2
  t = Math.max(0, Math.min(1, t))
  const Cx = A.x + t * ABx, Cy = A.y + t * ABy
  const dx = P.x - Cx, dy = P.y - Cy
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

function haversineM(a, b) {
  if (!a || !b) return Infinity
  const R = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function bearingDeg(a, b) {
  if (!a || !b) return 0
  const toRad = (x) => (x * Math.PI) / 180
  const toDeg = (x) => (x * 180) / Math.PI
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const dLon = toRad(b.lng - a.lng)
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

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

// ─── Map overlays ─────────────────────────────────────────────────────────────

function MapBadge({ tracking, followMe, voiceOn }) {
  return (
    <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
      <div className="bg-white/80 backdrop-blur border border-gray-200 shadow-sm rounded-2xl px-3 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            tracking ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200' : 'bg-gray-50/80 text-gray-700 border-gray-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${tracking ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {tracking ? 'NAVIGASI AKTIF' : 'NAVIGASI OFF'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            followMe ? 'bg-gray-900/90 text-white border-gray-900' : 'bg-white/70 text-gray-700 border-gray-200'
          }`}>
            <IconFollow className="w-3 h-3" />
            {followMe ? 'ON' : 'OFF'}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            voiceOn ? 'bg-indigo-50/80 text-indigo-800 border-indigo-200' : 'bg-white/70 text-gray-700 border-gray-200'
          }`}>
            {voiceOn ? <IconVolume className="w-3 h-3" /> : <IconVolumeMute className="w-3 h-3" />}
            {voiceOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  )
}

function InstructionOverlay({ tracking, activeStep, distToNext }) {
  if (!tracking || !activeStep) return null
  const t = (activeStep.type || '').toLowerCase()
  let DirectionIcon = IconArrowUp
  if (t.includes('left')) DirectionIcon = IconArrowTurnLeft
  else if (t.includes('right')) DirectionIcon = IconArrowTurnRight

  return (
    <div className="absolute top-3 right-3 left-3 sm:left-auto z-[1000] pointer-events-none">
      <div className="bg-emerald-600/90 backdrop-blur border border-emerald-500 shadow-lg rounded-2xl px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white mt-0.5">
            <DirectionIcon className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-0.5">Instruksi</p>
            <p className="text-sm font-bold text-white leading-snug">{activeStep.instruction}</p>
            {distToNext != null && (
              <p className="mt-1 text-[11px] text-emerald-200 font-semibold">{distToNext} m lagi</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteSummaryBar({ activeRoute, selectedMode, tracking, myPos, end, onRecenter }) {
  if (!activeRoute) return null

  const totalSec = Number(activeRoute?.total_time_sec)
  const totalLen = Number(activeRoute?.total_length_m)
  let targetSec = totalSec, targetM = totalLen

  if (tracking && myPos && end && Number.isFinite(totalSec) && Number.isFinite(totalLen) && totalSec > 0 && totalLen > 0) {
    const remainM = haversineM(myPos, end)
    const avgSpeedMps = totalLen / totalSec
    targetSec = Math.max(0, remainM / Math.max(avgSpeedMps, 0.15))
    targetM = remainM
  }

  const [dispSec, setDispSec] = React.useState(() => Number.isFinite(targetSec) ? targetSec : 0)
  const [dispM, setDispM] = React.useState(() => Number.isFinite(targetM) ? targetM : 0)

  React.useEffect(() => {
    let raf = 0, alive = true
    const lerp = (a, b, t) => a + (b - a) * t
    const tick = () => {
      if (!alive) return
      setDispSec((prev) => lerp(Number.isFinite(prev) ? prev : 0, Number.isFinite(targetSec) ? targetSec : 0, 0.18))
      setDispM((prev) => lerp(Number.isFinite(prev) ? prev : 0, Number.isFinite(targetM) ? targetM : 0, 0.18))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { alive = false; if (raf) cancelAnimationFrame(raf) }
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
        <button type="button" onClick={onRecenter} className="route-summary-btn pointer-events-auto" aria-label="Recenter">
          <IconRecenter className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

function LaneSim({ step }) {
  if (!step) return null
  const t = (step.type || '').toLowerCase()
  let active = 'straight'
  if (t.includes('left')) active = 'left'
  else if (t.includes('right')) active = 'right'

  const Lane = ({ kind, label }) => (
    <div className={`flex-1 flex flex-col items-center justify-center border rounded-xl py-2 gap-1 ${
      active === kind ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]' : 'bg-white text-gray-600 border-gray-200'
    }`}>
      {kind === 'left' && <IconArrowTurnLeft className="w-4 h-4" />}
      {kind === 'straight' && <IconArrowUp className="w-4 h-4" />}
      {kind === 'right' && <IconArrowTurnRight className="w-4 h-4" />}
      <div className="text-[10px] font-bold">{label}</div>
      {active === kind && <div className="text-[9px] opacity-75">disarankan</div>}
    </div>
  )

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-emerald-900/70 mb-1.5">Simulasi lajur</p>
      <div className="flex gap-1.5">
        <Lane kind="left" label="Kiri" />
        <Lane kind="straight" label="Lurus" />
        <Lane kind="right" label="Kanan" />
      </div>
      <p className="mt-1 text-[10px] text-emerald-900/50">
        *Simulasi berdasarkan manuver, bukan data lajur asli.
      </p>
    </div>
  )
}

function makeArrowIcon(deg) {
  const d = Number.isFinite(deg) ? deg : 0
  return L.divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="width:36px;height:36px;border-radius:18px;background:rgba(37,99,235,0.15);display:flex;align-items:center;justify-content:center;border:2px solid rgba(37,99,235,0.65);box-shadow:0 2px 8px rgba(0,0,0,0.15);">
      <div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid rgba(37,99,235,0.95);transform:rotate(${d}deg);transform-origin:50% 70%;"></div>
    </div>`
  })
}

function speak(text, { rate = 1.0, pitch = 1.0, lang = 'id-ID' } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = rate; u.pitch = pitch
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch { }
}

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

// ─── Divider with label ───────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-[#DDD8D0]" />
      {label ? <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#6B6560] uppercase">{label}</span> : null}
      <div className="flex-1 h-px bg-[#DDD8D0]" />
    </div>
  )
}

// ─── Input row with icon ──────────────────────────────────────────────────────
function LocationRow({ icon: Icon, label, value, placeholder, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer ${
        active
          ? 'border-[#8b1a1a] bg-[#FEF5F5] ring-1 ring-[#8b1a1a]/20'
          : 'border-[#DDD8D0] bg-white hover:border-[#8b1a1a]/40 hover:bg-[#F4F2EF]'
      }`}
    >
      <span className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${
        active ? 'bg-[#8b1a1a] text-white' : 'bg-[#F4F2EF] text-[#6B6560]'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold tracking-[0.08em] text-[#6B6560] uppercase">{label}</p>
        <p className={`text-xs font-bold truncate leading-tight ${value ? 'text-[#2B3440]' : 'text-[#A09890]'}`}>
          {value || placeholder}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UserMapPage() {
  const [events, setEvents] = React.useState([])
  const [closures, setClosures] = React.useState([])
  const [selectedEventId, setSelectedEventId] = React.useState('')

  const [start, setStart] = React.useState(null)
  const [end, setEnd] = React.useState(null)
  const [pickMode, setPickMode] = React.useState('start')

  const [startAddr, setStartAddr] = React.useState('')
  const [endAddr, setEndAddr] = React.useState('')

  const [routes, setRoutes] = React.useState({ fastest: null, shortest: null })
  const [selectedMode, setSelectedMode] = React.useState('fastest')
  const activeRoute = routes?.[selectedMode] || null

  const [steps, setSteps] = React.useState([])
  const [stepIdx, setStepIdx] = React.useState(0)
  const [currentStreet, setCurrentStreet] = React.useState('')

  const [loadingBootstrap, setLoadingBootstrap] = React.useState(true)
  const [loadingEvents, setLoadingEvents] = React.useState(true)
  const [loadingClosures, setLoadingClosures] = React.useState(true)
  const [loadingRoute, setLoadingRoute] = React.useState(false)

  const [msg, setMsg] = React.useState('Pilih START dan TUJUAN, lalu tekan "Cari Rute".')

  const [myPos, setMyPos] = React.useState(null)
  const [geoErr, setGeoErr] = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [followMe, setFollowMe] = React.useState(true)

  const [voiceOn, setVoiceOn] = React.useState(true)
  const [bearing, setBearing] = React.useState(0)
  const lastPosRef = React.useRef(null)
  const lastSpokenStepRef = React.useRef({ idx: -1, ts: 0 })

  const mapRef = React.useRef(null)
  const watchIdRef = React.useRef(null)

  const [rightPanelOpen, setRightPanelOpen] = React.useState(true)

  const closuresCacheRef = React.useRef({ data: null, fetchedAt: 0 })
  const lastStreetFetchRef = React.useRef(0)
  const reverseCacheRef = React.useRef(new Map())
  const reverseAbortRef = React.useRef({ start: null, end: null })

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false

  React.useEffect(() => {
    if (isMobile) setRightPanelOpen(true)
  }, [isMobile])

  function roundKey(lat, lng) { return `${lat.toFixed(5)},${lng.toFixed(5)}` }

  async function reverseGeocodeOSM(lat, lng, { signal } = {}) {
    const key = roundKey(lat, lng)
    const now = Date.now()
    const cached = reverseCacheRef.current.get(key)
    if (cached && now - cached.ts < REVERSE_GEO_TTL_MS) return cached.label
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`
    const res = await fetchWithTimeout(url, { timeoutMs: REVERSE_GEO_TIMEOUT_MS, signal, headers: { Accept: 'application/json' } })
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

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      setLoadingBootstrap(true); setLoadingEvents(true); setLoadingClosures(true)
      try {
        const res = await api.get('/map_bootstrap')
        const data = res.data || {}
        if (!alive) return
        setEvents(Array.isArray(data.events) ? data.events : [])
        const cl = Array.isArray(data.closures_active) ? data.closures_active : []
        setClosures(cl)
        closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
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

  function onPick(latlng, mode) {
    if (mode === 'start') { setStart(latlng); setMsg('START tersimpan. Sekarang pilih TUJUAN.'); fillAddressFor('start', latlng) }
    else { setEnd(latlng); setMsg('TUJUAN tersimpan. Tekan "Cari Rute".'); fillAddressFor('end', latlng) }
  }

  function applyEventAsDestination() {
    const ev = events.find((e) => e.id === selectedEventId)
    if (!ev) return
    const pt = { lat: ev.lat, lng: ev.lng }
    setEnd(pt); setMsg(`Tujuan di-set ke event: ${ev.name}. Tekan "Cari Rute".`); fillAddressFor('end', pt)
  }

  async function refreshClosures({ force = false, silent = true } = {}) {
    const cache = closuresCacheRef.current
    if (!force && cache.data && Date.now() - cache.fetchedAt < CLOSURES_TTL_MS) { setClosures(cache.data || []); return }
    if (!silent) setMsg('Memuat rekayasa jalan...')
    setLoadingClosures(true)
    try {
      const res = await api.get('/map_bootstrap')
      const cl = Array.isArray(res.data?.closures_active) ? res.data.closures_active : []
      setClosures(cl); closuresCacheRef.current = { data: cl, fetchedAt: Date.now() }
    } catch (e) { console.warn('refreshClosures failed:', e) }
    finally { setLoadingClosures(false) }
  }

  async function findRoute(customStart, customEnd, { silent = false } = {}) {
    const s = customStart || start, e = customEnd || end
    if (!s || !e) { if (!silent) setMsg('START dan TUJUAN wajib diisi.'); return }
    setLoadingRoute(true)
    if (!silent) setMsg('Menghitung rute A* (tercepat & terpendek)...')
    setRoutes({ fastest: null, shortest: null }); setSteps([]); setStepIdx(0)
    try {
      const res = await api.post('/route', { start: s, end: e, mode: 'both' })
      const data = res.data || {}
      const fastest = data.fastest || null, shortest = data.shortest || null
      setRoutes({ fastest, shortest })
      const chosen = (selectedMode === 'shortest' ? shortest : fastest) || fastest || shortest
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
      const r = res.data || null
      if (!r) return
      setRoutes((prev) => ({ ...prev, [selectedMode]: r }))
      setSteps(Array.isArray(r.steps) ? r.steps : []); setStepIdx(0)
      await refreshClosures({ force: true, silent: true })
    } catch (err) { console.warn('rerouteSelected failed:', err) }
  }

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
    if (haversineM(myPos, next.location) <= STEP_TRIGGER_M) setStepIdx((i) => Math.min(i + 1, steps.length - 1))
  }, [tracking, myPos?.lat, myPos?.lng, steps, stepIdx])

  React.useEffect(() => {
    if (!tracking || !voiceOn) return
    const st = steps?.[stepIdx]
    if (!st?.instruction) return
    const now = Date.now()
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

  const startLabel = startAddr || (start ? `${start.lat.toFixed(5)}, ${start.lng.toFixed(5)}` : null)
  const endLabel = endAddr || (end ? `${end.lat.toFixed(5)}, ${end.lng.toFixed(5)}` : null)
  const canFindRoute = !!start && !!end
  const activeStep = steps?.[stepIdx]
  const nextStep = steps?.[stepIdx + 1]
  const distToNext = myPos && nextStep?.location ? Math.round(haversineM(myPos, nextStep.location)) : null
  const fastest = routes.fastest, shortest = routes.shortest
  const hasRoutes = !!fastest || !!shortest
  const lockPickRoute = tracking

  const handleRecenter = () => {
    if (!mapRef.current) return
    if (myPos) mapRef.current.flyTo([myPos.lat, myPos.lng], Math.max(mapRef.current.getZoom(), FOLLOW_ZOOM), { animate: true, duration: 0.6 })
    else if (start) mapRef.current.flyTo([start.lat, start.lng], 16, { animate: true, duration: 0.6 })
    else mapRef.current.flyTo(DEFAULT_CENTER, 13, { animate: true, duration: 0.6 })
  }

  return (
    <div className="bg-gray-50">
      <div className="relative w-full" style={{ height: `calc(100vh - ${NAVBAR_H_PX}px)` }}>
        <MapBadge tracking={tracking} followMe={followMe} voiceOn={voiceOn} />
        <InstructionOverlay tracking={tracking} activeStep={activeStep} distToNext={distToNext} />
        <RouteSummaryBar activeRoute={activeRoute} selectedMode={selectedMode} tracking={tracking} myPos={myPos} end={end} onRecenter={handleRecenter} />

        <RightDockPanel open={rightPanelOpen} onToggle={() => setRightPanelOpen((v) => !v)} title="RUTE SURO">

          {/* ── Loading state ── */}
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

          {/* ── Status msg ── */}
          <div className="mb-3 rounded-2xl border border-[#DDD8D0] bg-[#F4F2EF] px-3 py-2.5">
            <p className="text-[11px] font-extrabold tracking-[0.08em] text-[#6B6560] uppercase mb-1">Status</p>
            <p className="text-xs font-semibold text-[#2B3440] leading-relaxed">{msg}</p>
          </div>

          {/* ── Location inputs ── */}
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
              {/* Swap indicator between rows */}
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

          {/* Use my location button */}
          <button
            onClick={useMyLocationAsStart}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#DDD8D0] bg-white hover:bg-[#F4F2EF] text-[#2B3440] font-bold text-sm transition hover:border-[#8b1a1a]/40"
          >
            <IconMyLocation className="w-4 h-4 text-[#8b1a1a]" />
            Pakai Lokasi Saya sebagai START
          </button>

          <SectionDivider label="Event" />

          {/* ── Event picker ── */}
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                <IconCalendar className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase">Pilih Event (Opsional)</p>
            </div>

            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#DDD8D0] rounded-xl text-[#2B3440] font-semibold text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8b1a1a]/30 focus:border-[#8b1a1a] transition"
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
              disabled={!selectedEventId}
              className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-sm border transition ${
                selectedEventId
                  ? 'bg-[#8b1a1a] hover:bg-[#6b1414] text-white border-[#8b1a1a]'
                  : 'bg-[#F4F2EF] text-[#A09890] border-[#DDD8D0] cursor-not-allowed'
              }`}
            >
              <IconMapPin className="w-4 h-4" />
              Jadikan Event sebagai Tujuan
            </button>
          </div>

          <SectionDivider label="Navigasi" />

          {/* ── Turn by turn (hanya tampil saat tracking aktif) ── */}
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
                        if (t.includes('left')) return <IconArrowTurnLeft className="w-4 h-4" />
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

          {/* ── 1. CARI RUTE ── */}
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

          {/* ── 2. MULAI / STOP NAVIGASI (tombol utama penuh) ── */}
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

          {/* ── 3. Kontrol sekunder: Ikuti + Suara + Ulangi ── */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={() => setFollowMe((v) => !v)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                followMe
                  ? 'bg-[#2B3440] text-white border-[#2B3440]'
                  : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'
              }`}
            >
              <IconFollow className="w-4 h-4" />
              Ikuti {followMe ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setVoiceOn((v) => !v)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl font-bold text-xs border transition ${
                voiceOn
                  ? 'bg-[#8b1a1a] text-white border-[#8b1a1a] hover:bg-[#6b1414]'
                  : 'bg-white text-[#2B3440] border-[#DDD8D0] hover:bg-[#F4F2EF]'
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

          {/* ── 4. Alternatif rute (muncul setelah rute ditemukan) ── */}
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

          {/* ── Geo error ── */}
          {geoErr && (
            <div className="flex items-start gap-2 text-xs text-[#8b1a1a] font-semibold bg-[#FEF5F5] border border-[#8b1a1a]/30 rounded-xl p-3 mb-3">
              <IconAlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#8b1a1a]" />
              <p>{geoErr}</p>
            </div>
          )}

          {/* ── Road info / closures ── */}
          <div className="rounded-2xl border border-[#DDD8D0] bg-[#F4F2EF] p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b1a1a] text-white">
                <IconAlertTriangle className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-extrabold text-[#2B3440] uppercase tracking-wide">Informasi Peta</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#2B3440] font-semibold ml-9">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-1.5 bg-red-600 rounded-sm" />
                <span>Jalan ditutup (rekayasa lalu lintas)</span>
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

          {myPos && (
            <>
              <Marker position={[myPos.lat, myPos.lng]} icon={makeArrowIcon(bearing)}>
                <Popup><b>Posisi Saya</b><br />Bearing: {Math.round(bearing)}°</Popup>
              </Marker>
              <CircleMarker center={[myPos.lat, myPos.lng]} radius={6} pathOptions={{ color: '#2563eb' }}>
                <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>Saya</Tooltip>
              </CircleMarker>
            </>
          )}

          {start && <Marker position={[start.lat, start.lng]}><Popup>Start</Popup></Marker>}
          {end && <Marker position={[end.lat, end.lng]}><Popup>Tujuan</Popup></Marker>}

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
                  mouseover: (e) => { try { e?.target?.openTooltip?.(); const el = e?.target?.getTooltip?.()?.getElement?.(); if (el) { el.classList.remove('closure-hidden'); el.classList.add('closure-show') } } catch {} },
                  mouseout: (e) => { try { const el = e?.target?.getTooltip?.()?.getElement?.(); if (el) { el.classList.remove('closure-show'); el.classList.add('closure-hidden') } e?.target?.closeTooltip?.() } catch {} },
                  click: (e) => { try { e?.originalEvent?.preventDefault?.(); const t = e?.target; t?.openTooltip?.(); const el = t?.getTooltip?.()?.getElement?.(); if (el) { const isShown = el.classList.contains('closure-show'); el.classList.toggle('closure-show', !isShown); el.classList.toggle('closure-hidden', isShown) } } catch {} }
                }}
              >
                <Tooltip permanent={false} sticky direction="top" offset={[0, -10]} className="closure-pill-tooltip closure-hidden" opacity={1}>
                  DITUTUP: {reason}
                </Tooltip>
                <Popup><b>Ditutup</b><br />{reason}</Popup>
              </Polyline>
            )
          })}

          {routes.fastest?.polyline && (
            <Polyline
              positions={routes.fastest.polyline.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: '#1d4ed8', weight: selectedMode === 'fastest' ? 7 : 4, opacity: selectedMode === 'fastest' ? 1 : 0.35 }}
            >
              <Tooltip sticky>Tercepat • {fmtMin(routes.fastest?.total_time_sec)} • {fmtKm(routes.fastest?.total_length_m)}</Tooltip>
            </Polyline>
          )}

          {routes.shortest?.polyline && (
            <Polyline
              positions={routes.shortest.polyline.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: '#7c3aed', weight: selectedMode === 'shortest' ? 7 : 4, opacity: selectedMode === 'shortest' ? 1 : 0.35, dashArray: selectedMode === 'shortest' ? undefined : '6 10' }}
            >
              <Tooltip sticky>Terpendek • {fmtMin(routes.shortest?.total_time_sec)} • {fmtKm(routes.shortest?.total_length_m)}</Tooltip>
            </Polyline>
          )}

          {tracking && nextStep?.location ? (
            <CircleMarker center={[nextStep.location.lat, nextStep.location.lng]} radius={6} pathOptions={{ color: '#10b981' }}>
              <Popup><b>Step berikutnya</b><br />{nextStep.instruction || '-'}</Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>
    </div>
  )
}