import React from 'react'

export default function BottomSheet({
  snap,
  setSnap,
  title,
  subtitle,
  rightBadge,
  children
}) {
  const drag = React.useRef({ y0: 0, dragging: false })

  const snapHeights = React.useCallback(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxH = Math.max(320, vh - 72)
    return {
      peek: 200,
      half: Math.min(460, Math.floor(maxH * 0.62)),
      full: maxH
    }
  }, [])

  // ✅ Saat hidden: render FAB, bukan sheet mini
  if (snap === 'hidden') {
    return (
      <div className="absolute inset-x-0 bottom-0 z-[1500] pointer-events-none">
        <div
          className="flex justify-center pointer-events-auto"
          style={{
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))'
          }}
        >
          <button
            type="button"
            onClick={() => setSnap('peek')}
            className="px-4 py-3 rounded-full bg-white/95 backdrop-blur border border-gray-200 shadow-xl text-sm font-extrabold flex items-center gap-2"
            aria-label="Buka menu"
            title="Buka menu"
          >
            <span className="text-gray-900">Menu</span>
            <span className="text-gray-500 text-lg leading-none">˄</span>
          </button>
        </div>
      </div>
    )
  }

  const H = snapHeights()[snap] ?? 200

  const cycle = () => {
    setSnap((prev) => {
      if (prev === 'peek') return 'half'
      if (prev === 'half') return 'full'
      return 'peek'
    })
  }

  const collapse = () => setSnap('hidden')

  const onPointerDown = (e) => {
    drag.current = { y0: e.clientY, dragging: true }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }

  const onPointerMove = (e) => {
    if (!drag.current.dragging) return
    const dy = e.clientY - drag.current.y0

    // swipe down => collapse step
    if (dy > 50) {
      drag.current.dragging = false
      setSnap((prev) => {
        if (prev === 'full') return 'half'
        if (prev === 'half') return 'peek'
        return 'hidden'
      })
    }

    // swipe up => expand step
    if (dy < -50) {
      drag.current.dragging = false
      setSnap((prev) => {
        if (prev === 'peek') return 'half'
        return 'full'
      })
    }
  }

  const onPointerUp = () => { drag.current.dragging = false }

  return (
    <div className="absolute inset-x-0 bottom-0 z-[1500] pointer-events-none">
      <div
        className="mx-3 pointer-events-auto bg-white/96 backdrop-blur border border-gray-200 shadow-2xl rounded-2xl overflow-hidden"
        style={{
          height: H,
          marginBottom: 'calc(12px + env(safe-area-inset-bottom))'
        }}
      >
        {/* HANDLE + HEADER */}
        <div
          className="px-4 pt-2 pb-2 select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="button"
          tabIndex={0}
        >
          <div className="flex justify-center">
            <div className="w-12 h-1.5 rounded-full bg-gray-300" />
          </div>

          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-gray-900 line-clamp-1">{title}</div>
              {subtitle ? (
                <div className="text-[11px] text-gray-600 line-clamp-1">{subtitle}</div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {rightBadge ? (
                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700 whitespace-nowrap">
                  {rightBadge}
                </span>
              ) : null}

              <button
                type="button"
                onClick={cycle}
                className="px-3 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold"
                title="Ubah ukuran"
              >
                {snap === 'peek' ? 'Detail' : snap === 'half' ? 'Lebih' : 'Ringkas'}
              </button>

              <button
                type="button"
                onClick={collapse}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 grid place-items-center"
                aria-label="Tutup"
                title="Tutup"
              >
                ˅
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ height: `calc(${H}px - 76px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}