import React from 'react'
import {
  IconFollow, IconVolume, IconVolumeMute,
  IconArrowTurnLeft, IconArrowTurnRight, IconArrowUp,
  IconRecenter, IconRoute,
} from './MapSvgIcons.jsx'

// ─── Format helpers 
export function fmtMin(sec) {
  if (sec == null || Number.isNaN(Number(sec))) return '?'
  const mins = Number(sec) / 60
  return mins < 10 ? `${mins.toFixed(1)} menit` : `${mins.toFixed(0)} menit`
}
export function fmtKm(m) {
  if (m == null || Number.isNaN(Number(m))) return '?'
  const km = Number(m) / 1000
  return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`
}
export function fmtMinShort(sec) {
  if (sec == null || !Number.isFinite(Number(sec))) return '?'
  const mins = Number(sec) / 60
  if (mins < 1) return '<1'
  if (mins < 10) return mins.toFixed(1)
  return mins.toFixed(0)
}
export function fmtDistShort(m) {
  if (m == null || !Number.isFinite(Number(m))) return '?'
  const mm = Number(m)
  if (mm < 1000) return `${Math.max(1, Math.round(mm))} m`
  const km = mm / 1000
  return km < 10 ? `${km.toFixed(2)} km` : `${km.toFixed(1)} km`
}

// ─── Math helpers 
export function haversineM(a, b) {
  if (!a || !b) return Infinity
  const R = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function bearingDeg(a, b) {
  if (!a || !b) return 0
  const toRad = (x) => (x * Math.PI) / 180
  const toDeg = (x) => (x * 180) / Math.PI
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat)
  const dLon = toRad(b.lng - a.lng)
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export function pointToSegmentDistanceM(p, a, b) {
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

export function distanceToPolylineM(point, polyline) {
  if (!point || !Array.isArray(polyline) || polyline.length < 2) return Infinity
  let best = Infinity
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentDistanceM(point, polyline[i], polyline[i + 1])
    if (d < best) best = d
  }
  return best
}

// ─── speak helper
export function speak(text, { rate = 1.0, pitch = 1.0, lang = 'id-ID' } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = rate; u.pitch = pitch
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch { }
}

// ─── fetchWithTimeout 
export async function fetchWithTimeout(url, { timeoutMs = 8000, signal, headers } = {}) {
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

// ─── SectionDivider 
export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-[#DDD8D0]" />
      {label ? <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#6B6560] uppercase">{label}</span> : null}
      <div className="flex-1 h-px bg-[#DDD8D0]" />
    </div>
  )
}

// ─── LocationRow 
export function LocationRow({ icon: Icon, label, value, placeholder, active, onClick }) {
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

// ─── MapBadge 
export function MapBadge({ tracking, followMe, voiceOn }) {
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

// ─── InstructionOverlay 
export function InstructionOverlay({ tracking, activeStep, distToNext }) {
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

// ─── RouteSummaryBar 
export function RouteSummaryBar({ activeRoute, selectedMode, tracking, myPos, end, onRecenter }) {
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

// ─── LaneSim 
export function LaneSim({ step }) {
  if (!step) return null
  const t = (step.type || '').toLowerCase()
  let active = 'straight'
  if (t.includes('left')) active = 'left'
  else if (t.includes('right')) active = 'right'

  const Lane = ({ kind, label }) => (
    <div className={`flex-1 flex flex-col items-center justify-center border rounded-xl py-2 gap-1 ${
      active === kind ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]' : 'bg-white text-gray-600 border-gray-200'
    }`}>
      {kind === 'left'     && <IconArrowTurnLeft className="w-4 h-4" />}
      {kind === 'straight' && <IconArrowUp className="w-4 h-4" />}
      {kind === 'right'    && <IconArrowTurnRight className="w-4 h-4" />}
      <div className="text-[10px] font-bold">{label}</div>
      {active === kind && <div className="text-[9px] opacity-75">disarankan</div>}
    </div>
  )

  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-emerald-900/70 mb-1.5">Simulasi lajur</p>
      <div className="flex gap-1.5">
        <Lane kind="left"     label="Kiri" />
        <Lane kind="straight" label="Lurus" />
        <Lane kind="right"    label="Kanan" />
      </div>
      <p className="mt-1 text-[10px] text-emerald-900/50">
        *Simulasi berdasarkan manuver, bukan data lajur asli.
      </p>
    </div>
  )
}