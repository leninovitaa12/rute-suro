import React from 'react'
import {
  IconFollow, IconVolume, IconVolumeMute,
  IconArrowTurnLeft, IconArrowTurnRight, IconArrowUp,
  IconRecenter, IconRoute,
} from './MapSvgIcons.jsx'

// ─── Format helpers ───────────────────────────────────────────────────────────
export const fmtMin      = (s)  => s == null || isNaN(+s) ? '?' : (+s / 60) < 10 ? `${(+s/60).toFixed(1)} menit` : `${(+s/60).toFixed(0)} menit`
export const fmtKm       = (m)  => m == null || isNaN(+m) ? '?' : (+m/1000) < 10 ? `${(+m/1000).toFixed(2)} km` : `${(+m/1000).toFixed(1)} km`
export const fmtMinShort = (s)  => !Number.isFinite(+s) ? '?' : (+s/60) < 1 ? '<1' : (+s/60) < 10 ? (+s/60).toFixed(1) : (+s/60).toFixed(0)
export const fmtDistShort= (m)  => !Number.isFinite(+m) ? '?' : +m < 1000 ? `${Math.max(1,Math.round(+m))} m` : (+m/1000) < 10 ? `${(+m/1000).toFixed(2)} km` : `${(+m/1000).toFixed(1)} km`

// ─── Geo helpers ──────────────────────────────────────────────────────────────
export function haversineM(a, b) {
  if (!a || !b) return Infinity
  const R = 6371000, r = x => x * Math.PI / 180
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng)
  const x = Math.sin(dLat/2)**2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function bearingDeg(a, b) {
  if (!a || !b) return 0
  const r = x => x * Math.PI / 180, d = x => x * 180 / Math.PI
  const y = Math.sin(r(b.lng - a.lng)) * Math.cos(r(b.lat))
  const x = Math.cos(r(a.lat)) * Math.sin(r(b.lat)) - Math.sin(r(a.lat)) * Math.cos(r(b.lat)) * Math.cos(r(b.lng - a.lng))
  return (d(Math.atan2(y, x)) + 360) % 360
}

export function distanceToPolylineM(point, polyline) {
  if (!point || !Array.isArray(polyline) || polyline.length < 2) return Infinity
  const toXY = ll => ({ x: ll.lng * 111320 * Math.cos(point.lat * Math.PI / 180), y: ll.lat * 110540 })
  const P = toXY(point)
  let best = Infinity
  for (let i = 0; i < polyline.length - 1; i++) {
    const A = toXY(polyline[i]), B = toXY(polyline[i + 1])
    const dx = B.x - A.x, dy = B.y - A.y
    const t = Math.max(0, Math.min(1, dx || dy ? ((P.x - A.x)*dx + (P.y - A.y)*dy) / (dx*dx + dy*dy) : 0))
    const cx = A.x + t*dx - P.x, cy = A.y + t*dy - P.y
    best = Math.min(best, Math.sqrt(cx*cx + cy*cy))
  }
  return best
}

// pointToSegmentDistanceM masih dieksport untuk kompatibilitas
export function pointToSegmentDistanceM(p, a, b) {
  return distanceToPolylineM(p, [a, b])
}

// ─── Misc helpers ─────────────────────────────────────────────────────────────
export function speak(text, { rate = 1.0, pitch = 1.0, lang = 'id-ID' } = {}) {
  try {
    if (!('speechSynthesis' in window)) return
    const u = new SpeechSynthesisUtterance(text)
    Object.assign(u, { lang, rate, pitch })
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

export async function fetchWithTimeout(url, { timeoutMs = 8000, signal, headers } = {}) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), timeoutMs)
  if (signal) {
    if (signal.aborted) ctrl.abort()
    signal.addEventListener('abort', () => ctrl.abort(), { once: true })
  }
  try { return await fetch(url, { signal: ctrl.signal, headers }) }
  finally { clearTimeout(id) }
}

// ─── UI Components ────────────────────────────────────────────────────────────
export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-[#DDD8D0]" />
      {label && <span className="text-[10px] font-extrabold tracking-[0.12em] text-[#6B6560] uppercase">{label}</span>}
      <div className="flex-1 h-px bg-[#DDD8D0]" />
    </div>
  )
}

export function LocationRow({ icon: Icon, label, value, placeholder, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer ${active ? 'border-[#8b1a1a] bg-[#FEF5F5] ring-1 ring-[#8b1a1a]/20' : 'border-[#DDD8D0] bg-white hover:border-[#8b1a1a]/40 hover:bg-[#F4F2EF]'}`}>
      <span className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-[#8b1a1a] text-white' : 'bg-[#F4F2EF] text-[#6B6560]'}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold tracking-[0.08em] text-[#6B6560] uppercase">{label}</p>
        <p className={`text-xs font-bold truncate leading-tight ${value ? 'text-[#2B3440]' : 'text-[#A09890]'}`}>{value || placeholder}</p>
      </div>
    </div>
  )
}

export function MapBadge({ tracking, followMe, voiceOn }) {
  const chip = (active, activeClass, children) =>
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${active ? activeClass : 'bg-white/70 text-gray-700 border-gray-200'}`}>{children}</span>
  return (
    <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
      <div className="bg-white/80 backdrop-blur border border-gray-200 shadow-sm rounded-2xl px-3 py-2 flex items-center gap-2 flex-wrap">
        {chip(tracking, 'bg-emerald-50/80 text-emerald-800 border-emerald-200', <><span className={`w-1.5 h-1.5 rounded-full ${tracking ? 'bg-emerald-500' : 'bg-gray-400'}`} />{tracking ? 'NAVIGASI AKTIF' : 'NAVIGASI OFF'}</>)}
        {chip(followMe, 'bg-gray-900/90 text-white border-gray-900', <><IconFollow className="w-3 h-3" />{followMe ? 'ON' : 'OFF'}</>)}
        {chip(voiceOn, 'bg-indigo-50/80 text-indigo-800 border-indigo-200', <>{voiceOn ? <IconVolume className="w-3 h-3" /> : <IconVolumeMute className="w-3 h-3" />}{voiceOn ? 'ON' : 'OFF'}</>)}
      </div>
    </div>
  )
}

export function InstructionOverlay({ tracking, activeStep, distToNext }) {
  if (!tracking || !activeStep) return null
  const t = (activeStep.type || '').toLowerCase()
  const Icon = t.includes('left') ? IconArrowTurnLeft : t.includes('right') ? IconArrowTurnRight : IconArrowUp
  return (
    <div className="absolute top-3 right-3 left-3 sm:left-auto z-[1000] pointer-events-none">
      <div className="bg-emerald-600/90 backdrop-blur border border-emerald-500 shadow-lg rounded-2xl px-4 py-3 flex items-start gap-3">
        <span className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white mt-0.5">
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider mb-0.5">Instruksi</p>
          <p className="text-sm font-bold text-white leading-snug">{activeStep.instruction}</p>
          {distToNext != null && <p className="mt-1 text-[11px] text-emerald-200 font-semibold">{distToNext} m lagi</p>}
        </div>
      </div>
    </div>
  )
}

export function RouteSummaryBar({ activeRoute, selectedMode, tracking, myPos, end, onRecenter }) {
  if (!activeRoute) return null
  const totalSec = +activeRoute.total_time_sec, totalLen = +activeRoute.total_length_m
  let tSec = totalSec, tM = totalLen
  if (tracking && myPos && end && Number.isFinite(totalSec) && totalSec > 0 && totalLen > 0) {
    const rem = haversineM(myPos, end)
    tSec = Math.max(0, rem / Math.max(totalLen / totalSec, 0.15))
    tM = rem
  }
  const [dispSec, setDispSec] = React.useState(Number.isFinite(tSec) ? tSec : 0)
  const [dispM,   setDispM]   = React.useState(Number.isFinite(tM)   ? tM   : 0)
  React.useEffect(() => {
    let raf, alive = true
    const lerp = (a, b) => a + (b - a) * 0.18
    const tick = () => {
      if (!alive) return
      setDispSec(p => lerp(isFinite(p) ? p : 0, isFinite(tSec) ? tSec : 0))
      setDispM  (p => lerp(isFinite(p) ? p : 0, isFinite(tM)   ? tM   : 0))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { alive = false; cancelAnimationFrame(raf) }
  }, [tSec, tM])

  return (
    <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
      <div className="route-summary-shell">
        <div className="route-summary-main">
          <div className="route-summary-time">{fmtMinShort(dispSec)}<span className="route-summary-unit"> min</span></div>
          <div className="route-summary-meta">
            <span className="route-summary-dist">{fmtDistShort(dispM)}</span>
            <span className={`route-summary-chip ${selectedMode === 'fastest' ? 'chip-fast' : 'chip-short'}`}>
              {selectedMode === 'fastest' ? 'Tercepat' : 'Terpendek'}
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

export function LaneSim({ step }) {
  if (!step) return null
  const t = (step.type || '').toLowerCase()
  const active = t.includes('left') ? 'left' : t.includes('right') ? 'right' : 'straight'
  const lanes = [
    { kind: 'left',     label: 'Kiri',   Icon: IconArrowTurnLeft  },
    { kind: 'straight', label: 'Lurus',  Icon: IconArrowUp        },
    { kind: 'right',    label: 'Kanan',  Icon: IconArrowTurnRight },
  ]
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-emerald-900/70 mb-1.5">Simulasi lajur</p>
      <div className="flex gap-1.5">
        {lanes.map(({ kind, label, Icon }) => (
          <div key={kind} className={`flex-1 flex flex-col items-center justify-center border rounded-xl py-2 gap-1 ${active === kind ? 'bg-[#8b1a1a] text-white border-[#8b1a1a]' : 'bg-white text-gray-600 border-gray-200'}`}>
            <Icon className="w-4 h-4" />
            <div className="text-[10px] font-bold">{label}</div>
            {active === kind && <div className="text-[9px] opacity-75">disarankan</div>}
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-emerald-900/50">*Simulasi berdasarkan manuver, bukan data lajur asli.</p>
    </div>
  )
}