import React from 'react'
import { Marker, Popup, Polyline, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet'
import { makeArrowIcon, makeStartIcon, makeEndIcon, makeParkingIcon, makeEventPreviewIcon, makeEventSelectedIcon } from './mapIcons.js'
import { fmtMin, fmtKm } from './MapOverlays.jsx'

export function ClickSetter({ mode, onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }, mode) })
  return null
}

function PopupHeader({ title, subtitle, active, accentColor = '#b91c1c', lightBg = '#fef2f2', lightBorder = '#fca5a5', neutralBg = '#f9fafb', neutralBorder = '#e5e7eb' }) {
  const bg = active ? `linear-gradient(135deg,${lightBg},${lightBg})` : `linear-gradient(135deg,${neutralBg},#f3f4f6)`
  return (
    <div style={{ background: bg, borderRadius: '8px 8px 0 0', padding: '8px 10px', marginBottom: 8, border: `1px solid ${active ? lightBorder : neutralBorder}`, borderBottom: 'none' }}>
      <p style={{ fontWeight: 800, fontSize: 13, color: active ? accentColor : '#374151', marginBottom: 2 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 11, color: '#6b7280' }}>{subtitle}</p>}
    </div>
  )
}

function PopupBtn({ onClick, color = '#991b1b', label }) {
  return (
    <div style={{ padding: '0 10px 8px' }}>
      <button onClick={onClick} style={{ width: '100%', padding: '6px 10px', background: `linear-gradient(135deg,${color},${color}dd)`, color: 'white', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12, boxShadow: `0 2px 6px ${color}55` }}>
        {label}
      </button>
    </div>
  )
}

function SelectedBadge({ color = '#b91c1c', label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px 8px', color, fontSize: 12, fontWeight: 700 }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {label}
    </div>
  )
}

// ─── CongestionLines ──────────────────────────────────────────────────────────
// Warna ORANGE GELAP agar jelas terlihat di atas peta maupun rute biru.
// Dibedakan dari closure (merah solid) via dashArray putus-putus.
//   MODERATE → orange gelap  #c2410c  putus renggang  14, 7
//   HEAVY    → orange merah  #9a3412  putus rapat      8, 5

function CongestionLines({ cz }) {
  const heavy     = (cz.level || 'MODERATE') === 'HEAVY'
  const color     = heavy ? '#9a3412' : '#c2410c'   // orange-700 / orange-900
  const dashArray = heavy ? '8, 5' : '14, 7'
  const label     = heavy ? 'Macet Parah' : 'Macet Sedang'
  const eta       = heavy ? 'ETA ~5× lebih lambat' : 'ETA ~2.5× lebih lambat'

  return (
    <>
      {(cz.edges || []).map((e, ei) => {
        const pts = (e.polyline || []).filter(p => p.lat && p.lng).map(p => [p.lat, p.lng])
        if (pts.length < 2) return null
        return (
          <Polyline
            key={`cg_${cz.id}_${ei}`}
            positions={pts}
            pathOptions={{ color, weight: 6, opacity: 1, dashArray }}
          >
            <Tooltip sticky direction="top">
              <div style={{ minWidth: 150 }}>
                <p style={{ fontWeight: 'bold', color, marginBottom: 2 }}>🚦 {label}</p>
                {cz.reason && <p style={{ fontSize: 11, color: '#555', marginBottom: 1 }}>{cz.reason}</p>}
                <p style={{ fontSize: 11, color: '#888' }}>{eta}</p>
              </div>
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}

export default function MapLayers({
  myPos, bearing, start, end,
  selectedEventId, events, destinationType,
  spotsForSelectedEvent, selectedParkingId,
  closures, congestionZones,
  routes, selectedMode, tracking, nextStep,
  setEnd, setSelectedParkingId, setDestinationType, setMsg, fillAddressFor,
  applyEventAsDestination,
}) {
  const routeCfg = [
    { key: 'fastest',  route: routes.fastest,  activeColor: '#1d4ed8', tooltip: 'Tercepat'  },
    { key: 'shortest', route: routes.shortest, activeColor: '#38bdf8', tooltip: 'Terpendek' },
  ]

  return (
    <>
      {/* Posisi user */}
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

      {/* Start / End markers */}
      {start && <Marker position={[start.lat, start.lng]} icon={makeStartIcon()}><Popup><b>Titik Awal</b></Popup></Marker>}
      {end && destinationType === null && <Marker position={[end.lat, end.lng]} icon={makeEndIcon()}><Popup><b>Tujuan</b></Popup></Marker>}

      {/* Event marker */}
      {selectedEventId && (() => {
        const ev = events.find(e => String(e.id) === String(selectedEventId))
        if (!ev?.lat || !ev?.lng) return null
        const isDest = destinationType === 'event'
        return (
          <Marker key={`event_${ev.id}`} position={[ev.lat, ev.lng]} icon={isDest ? makeEventSelectedIcon() : makeEventPreviewIcon()} zIndexOffset={isDest ? 900 : 100}>
            <Popup>
              <div style={{ minWidth: 170 }}>
                <PopupHeader title={ev.name} subtitle={ev.location} active={isDest} />
                {isDest ? <SelectedBadge label="Dipilih sebagai tujuan" /> : <PopupBtn onClick={applyEventAsDestination} label="Jadikan Tujuan" />}
              </div>
            </Popup>
          </Marker>
        )
      })()}

      {/* Parkir markers */}
      {selectedEventId && spotsForSelectedEvent.map((spot) => {
        const isSel = destinationType === 'parking' && String(spot.id) === String(selectedParkingId)
        return (
          <Marker key={`parking_${spot.id}`} position={[spot.lat, spot.lng]} icon={makeParkingIcon(isSel)} zIndexOffset={isSel ? 1000 : 0}>
            <Popup>
              <div style={{ minWidth: 170 }}>
                <PopupHeader
                  title={`${spot.name}${isSel ? ' (Tujuan)' : ''}`}
                  subtitle={spot.description || (spot.capacity ? `Kapasitas: ${spot.capacity} kendaraan` : undefined)}
                  active={isSel} accentColor="#92400e" lightBg="#fffbeb" lightBorder="#fcd34d"
                  neutralBg="#eff6ff" neutralBorder="#bfdbfe"
                />
                {spot.capacity != null && !spot.description && (
                  <p style={{ fontSize: 11, fontWeight: 700, color: isSel ? '#b45309' : '#1d4ed8', padding: '0 10px 4px' }}>
                    Kapasitas: {spot.capacity} kendaraan
                  </p>
                )}
                {isSel
                  ? <SelectedBadge color="#b45309" label="Parkir ini sedang dipilih" />
                  : <PopupBtn color="#1d4ed8" label="Jadikan Tujuan" onClick={() => {
                      const pt = { lat: spot.lat, lng: spot.lng }
                      setEnd(pt); setSelectedParkingId(String(spot.id))
                      setDestinationType('parking')
                      setMsg(`Tujuan di-set ke parkir: ${spot.name}. Tekan "Cari Rute".`)
                      fillAddressFor('end', pt)
                    }} />
                }
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* 1. Rute biru */}
      {routeCfg.map(({ key, route, activeColor, tooltip }) => {
        if (!route?.polyline) return null
        const isActive = selectedMode === key
        return (
          <Polyline key={key}
            positions={route.polyline.map(p => [p.lat, p.lng])}
            pathOptions={{
              color:     isActive ? activeColor : '#9ca3af',
              weight:    isActive ? 7 : 5,
              opacity:   isActive ? 1 : 0.65,
              dashArray: isActive ? undefined : '10 8',
            }}
          >
            <Tooltip sticky>{tooltip} • {fmtMin(route.total_time_sec)} • {fmtKm(route.total_length_m)}</Tooltip>
          </Polyline>
        )
      })}

      {/* 2.  Congestion — orange gelap putus-putus, di atas rute biru */}
      {Array.isArray(congestionZones) && congestionZones.map((cz) => (
        <CongestionLines key={`cz_${cz.id}`} cz={cz} />
      ))}

      {/* 3.  Closure — merah solid, paling atas */}
      {closures.map((c) => {
        const positions = (c.edges || [])
          .map(e => Array.isArray(e.polyline) ? e.polyline.map(p => [p.lat, p.lng]) : null)
          .filter(pl => pl?.length > 1)
        if (!positions.length) return null
        const reason = c.reason || 'Rekayasa / ditutup'
        return (
          <Polyline key={`closure_${c.id}`} positions={positions}
            pathOptions={{ color: '#dc2626', weight: 7, opacity: 1 }}
            eventHandlers={{
              mouseover: e => e.target.openTooltip(),
              mouseout:  e => e.target.closeTooltip(),
            }}
          >
            <Tooltip sticky direction="top" offset={[0, -10]} opacity={1}>🚫 DITUTUP: {reason}</Tooltip>
            <Popup><b>🚫 Ditutup</b><br />{reason}</Popup>
          </Polyline>
        )
      })}

      {/* Next step marker */}
      {tracking && nextStep?.location && (
        <CircleMarker center={[nextStep.location.lat, nextStep.location.lng]} radius={6} pathOptions={{ color: '#10b981' }}>
          <Popup><b>Step berikutnya</b><br />{nextStep.instruction || '-'}</Popup>
        </CircleMarker>
      )}
    </>
  )
}