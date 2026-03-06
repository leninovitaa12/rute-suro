import React from 'react'

function ChevronLeftIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MapIcon({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3v15M15 6v15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function NavigationPanelIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="5" r="1.2" fill="currentColor" />
      <circle cx="15" cy="5" r="1.2" fill="currentColor" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <circle cx="9" cy="19" r="1.2" fill="currentColor" />
      <circle cx="15" cy="19" r="1.2" fill="currentColor" />
    </svg>
  )
}

// ── Component ────────────────────────────────────────────────────────────────
export default function RightDockPanel({
  open,
  onToggle,
  title = 'Panel',
  children,
  topOffset = 92
}) {
  const W_DESKTOP = 372

  return (
    <>
      {/* Collapsed pill trigger */}
      {!open && (
        <div
          className="absolute right-3 z-[1600] pointer-events-auto"
          style={{ top: `${topOffset}px` }}
        >
          <button
            type="button"
            onClick={onToggle}
            className="group inline-flex items-center gap-2 rounded-full border border-[#E7E2DA] bg-white/95 backdrop-blur px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.10)] hover:shadow-[0_14px_36px_rgba(0,0,0,0.14)] transition-all"
            aria-label="Tampilkan panel navigasi"
            title="Tampilkan panel navigasi"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F3EE] text-[#6B7280] border border-[#ECE7DF]">
              <ChevronLeftIcon className="w-4 h-4" />
            </span>
            <span className="pr-1 text-xs font-extrabold tracking-[0.08em] text-[#2B3440] uppercase flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-[#8b1a1a]" />
              {title}
            </span>
          </button>
        </div>
      )}

      {/* Expanded panel */}
      <div
        className={`absolute right-3 bottom-3 z-[1600] pointer-events-auto transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-[112%]'
        }`}
        style={{
          top: `${topOffset}px`,
          width: `min(${W_DESKTOP}px, 92vw)`
        }}
      >
        <div className="h-full overflow-hidden rounded-[20px] border border-[#EAE4DB] bg-[rgba(255,255,255,0.97)] backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.18)]">

          {/* ── Panel header ── */}
          <div className="flex items-center justify-between border-b border-[#F0EBE4] px-4 py-3 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Brand icon */}
              <span className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b1a1a] text-white shadow-sm">
                <MapIcon className="w-4.5 h-4.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-black tracking-[0.1em] text-[#2F3946] uppercase leading-tight">
                  {title}
                </p>
                <p className="truncate text-[11px] text-[#8A93A1] leading-tight">
                  Panel Navigasi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Grip visual */}
              <span className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECE7DF] bg-[#F8F5F1] text-[#9AA3AF]">
                <NavigationPanelIcon className="w-3.5 h-3.5" />
              </span>

              {/* Hide button */}
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#ECE7DF] bg-white px-3 text-[12px] font-bold text-[#2B3440] shadow-sm transition hover:bg-[#FAF8F5] hover:border-[#D9D2C9]"
                aria-label="Sembunyikan panel"
                title="Sembunyikan panel"
              >
                <span>Sembunyikan</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="h-full overflow-y-auto px-4 py-4 pb-16" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E7E2DA transparent' }}>
            {children}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </>
  )
}