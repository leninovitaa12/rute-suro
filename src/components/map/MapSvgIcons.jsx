// ─── Icon factory ─────────────────────────────────────────────────────────────
// Setiap icon cukup didefinisikan sebagai path data + viewBox.
// Tidak perlu repeat boilerplate svg/fill/className per icon.

function icon(paths, vb = '0 0 24 24', sw = 1.8) {
  return function SvgIcon({ className = 'w-4 h-4' }) {
    return (
      <svg viewBox={vb} fill="none" className={className} aria-hidden="true">
        {paths.map((d, i) =>
          typeof d === 'string'
            ? <path key={i} d={d} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
            : React.cloneElement(d, { key: i })
        )}
      </svg>
    )
  }
}

import React from 'react'

export const IconLocationPin = icon([
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
  <circle key="c" cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />,
])

export const IconFlag = icon([
  'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z',
  'M4 22V15',
])

export const IconMyLocation = icon([
  <circle key="c1" cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />,
  'M12 2v3M12 19v3M2 12h3M19 12h3',
  <circle key="c2" cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 3" />,
])

export const IconNavigation = icon(['M3 11l19-9-9 19-2-8-8-2z'])

export const IconVolume = icon([
  <polygon key="p" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  'M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07',
])

export const IconVolumeMute = icon([
  <polygon key="p" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  'M23 9l-6 6M17 9l6 6',
])

export const IconFollow = icon([
  <circle key="c1" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />,
  <circle key="c2" cx="12" cy="12" r="3" fill="currentColor" />,
  'M12 3v2M12 19v2M3 12h2M19 12h2',
])

export const IconRepeat = icon([
  'M17 1l4 4-4 4',
  'M3 11V9a4 4 0 014-4h14',
  'M7 23l-4-4 4-4',
  'M21 13v2a4 4 0 01-4 4H3',
])

export const IconSearch = icon([
  <circle key="c" cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />,
  'M21 21l-4.35-4.35',
])

export const IconRoute = icon([
  <circle key="c1" cx="5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />,
  <circle key="c2" cx="19" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />,
  'M5 8.5v2a5 5 0 005 5h4a5 5 0 015 5',
])

export const IconZap = icon([
  <polygon key="p" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
])

export const IconMinimize = icon([
  'M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3',
])

export const IconAlertTriangle = icon([
  'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  'M12 9v4',
  <line key="l" x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />,
])

export const IconCalendar = icon([
  <rect key="r" x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />,
  'M16 2v4M8 2v4M3 10h18',
])

export const IconMapPin = icon([
  'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z',
  <circle key="c" cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8" />,
])

export const IconInfo = icon([
  <circle key="c" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />,
  'M12 16v-4M12 8h.01',
])

export const IconStop = icon([
  <rect key="r" x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8" />,
])

export const IconArrowTurnLeft = icon([
  'M9 14L4 9l5-5',
  'M4 9h10a6 6 0 016 6v2',
], '0 0 24 24', 2)

export const IconArrowTurnRight = icon([
  'M15 14l5-5-5-5',
  'M20 9H10a6 6 0 00-6 6v2',
], '0 0 24 24', 2)

export const IconArrowUp = icon([
  'M12 19V5',
  'M5 12l7-7 7 7',
], '0 0 24 24', 2)

export const IconClock = icon([
  <circle key="c" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />,
  'M12 6v6l4 2',
])

export const IconArrowSwap = icon([
  'M7 16V4m0 0L3 8m4-4l4 4',
  'M17 8v12m0 0l4-4m-4 4l-4-4',
])

export const IconRecenter = icon([
  <circle key="c" cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />,
  'M12 2v4M12 18v4M2 12h4M18 12h4',
])