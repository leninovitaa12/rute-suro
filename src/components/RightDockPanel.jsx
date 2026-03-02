import React from 'react'

export default function RightDockPanel({
  open,
  onToggle,
  title = 'Panel',
  children
}) {
  // Width panel desktop
  const W_DESKTOP = 380

  return (
    <>
      {/* TAB "SHOW" (muncul saat panel hidden) */}
      {!open ? (
        <div className="absolute top-24 right-2 z-[1600] pointer-events-auto">
          <button
            type="button"
            onClick={onToggle}
            className="group flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-lg px-3 py-2"
            aria-label="Tampilkan panel"
            title="Tampilkan panel"
          >
            <span className="text-xs font-extrabold text-gray-900">{title}</span>
            <span className="text-gray-600 text-base leading-none group-hover:translate-x-[1px] transition">
              ‹
            </span>
          </button>
        </div>
      ) : null}

      {/* PANEL */}
      <div
        className={`absolute top-20 right-3 bottom-3 z-[1600] pointer-events-auto transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-[110%]'
        }`}
        style={{ width: `min(${W_DESKTOP}px, 92vw)` }}
      >
        <div className="h-full rounded-2xl border border-gray-200 bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-gray-900 truncate">{title}</p>
              <p className="text-[11px] text-gray-500 truncate">
                Klik tombol untuk Hide/Show
              </p>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className="h-9 px-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-extrabold"
              aria-label="Sembunyikan panel"
              title="Sembunyikan panel"
            >
              Hide <span className="ml-1">›</span>
            </button>
          </div>

          {/* BODY */}
          <div className="h-full overflow-y-auto px-4 py-4">
            {children}
            <div className="h-10" />
          </div>
        </div>
      </div>
    </>
  )
}