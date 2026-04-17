import React from 'react'

export default function Tooltip({ children, content, position = 'top' }) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const tooltipRef = React.useRef(null)
  const triggerRef = React.useRef(null)

  // Detect if device is mobile
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  React.useEffect(() => {
    if (!isMobile) return

    const handleClickOutside = e => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip, isMobile])

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[#2B3440] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[#2B3440] border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[#2B3440] border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[#2B3440] border-t-transparent border-b-transparent border-l-transparent',
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => !isMobile && setShowTooltip(true)}
        onMouseLeave={() => !isMobile && setShowTooltip(false)}
        onClick={() => isMobile && setShowTooltip(v => !v)}
        className="cursor-help"
      >
        {children}
      </div>

      {showTooltip && (
        <div
          ref={tooltipRef}
          className={`absolute z-[10000] ${positionClasses[position]} pointer-events-none select-none`}
        >
          <div className="relative">
            <div className="bg-[#2B3440] text-white text-xs font-semibold rounded-lg px-3 py-2 max-w-xs break-words shadow-lg">
              {content}
            </div>
            <div
              className={`absolute w-2 h-2 border-2 ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
