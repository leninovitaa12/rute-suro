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

function TrafficPolylines({ trafficSegments }) {
  if (!Array.isArray(trafficSegments) || trafficSegments.length === 0) return null

  return (
    <>
      {trafficSegments.map((seg, i) => {
        if (seg.level === 'NORMAL') return null

        const pts = (seg.segment_points || [])
          .filter(p => p?.lat != null && p?.lng != null)
          .map(p => [p.lat, p.lng])

        if (pts.length < 2) return null

        const isHeavy   = seg.level === 'HEAVY'
        const color     = isHeavy ? '#dc2626' : '#ea580c'
        const haloColor = isHeavy ? '#7f1d1d' : '#7c2d12'
        const label     = isHeavy ? 'Macet Parah' : 'Macet Sedang'
        const delayMin  = Math.round((seg.delay || 0) / 60)

        const tooltipContent = (
          <div style={{ minWidth: 160 }}>
            <p style={{ fontWeight: 'bold', color, marginBottom: 2 }}>
              🚦 {label}
              <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>LIVE</span>
            </p>
            {delayMin > 0 && (
              <p style={{ fontSize: 11, color: '#555' }}>⏱ Delay: +{delayMin} menit</p>
            )}
            <p style={{ fontSize: 10, color: '#d97706', marginTop: 2, fontWeight: 600 }}>
              📡 Data TomTom real-time
            </p>
          </div>
        )

        return (
          <React.Fragment key={`traffic_seg_${i}`}>
            <Polyline
              positions={pts}
              pathOptions={{ color: haloColor, weight: 14, opacity: 0.20 }}
            />
            <Polyline
              positions={pts}
              pathOptions={{ color, weight: 7, opacity: 0.92 }}
            >
              <Tooltip sticky direction="top">{tooltipContent}</Tooltip>
            </Polyline>
          </React.Fragment>
        )
      })}
    </>
  )
}

function CongestionLines({ cz }) {
  const heavy     = (cz.level || 'MODERATE') === 'HEAVY'
  const color     = heavy ? '#9a3412' : '#c2410c'
  const dashArray = heavy ? '8, 5' : '14, 7'
  const label     = heavy ? 'Macet Parah' : 'Macet Sedang'
  const eta       = heavy ? 'ETA ~5× lebih lambat' : 'ETA ~2.5× lebih lambat'

  const isLive   = (cz.source || 'manual') === 'tomtom'
  const srcBadge = isLive
    ? <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>🔴 LIVE</span>
    : <span style={{ fontSize: 10, fontWeight: 700, background: '#f3f4f6', color: '#6b7280', borderRadius: 4, padding: '1px 5px', marginLeft: 4 }}>MANUAL</span>

  const tooltipContent = (
    <div style={{ minWidth: 170 }}>
      <p style={{ fontWeight: 'bold', color, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
        🚦 {label}{srcBadge}
      </p>
      {cz.reason && <p style={{ fontSize: 11, color: '#555', marginBottom: 1 }}>{cz.reason}</p>}
      <p style={{ fontSize: 11, color: '#888' }}>{eta}</p>
      {isLive && (
        <p style={{ fontSize: 10, color: '#d97706', marginTop: 2, fontWeight: 600 }}>
          📡 Data TomTom real-time
        </p>
      )}
    </div>
  )

  const polylineEdges = []
  const dotEdges      = []

  ;(cz.edges || []).forEach((e, ei) => {
    const pts = (e.polyline || []).filter(p => p?.lat && p?.lng).map(p => [p.lat, p.lng])
    if (pts.length >= 2) {
      polylineEdges.push({ pts, ei })
    } else if (e.lat != null && e.lng != null) {
      dotEdges.push({ lat: e.lat, lng: e.lng, ei })
    } else if (e.polyline?.length === 1) {
      const p = e.polyline[0]
      if (p?.lat && p?.lng) dotEdges.push({ lat: p.lat, lng: p.lng, ei })
    }
  })

  return (
    <>
      {polylineEdges.map(({ pts, ei }) => (
        <React.Fragment key={`cg_${cz.id}_line_${ei}`}>
          <Polyline
            positions={pts}
            pathOptions={{ color: heavy ? '#450a0a' : '#431407', weight: 12, opacity: 0.18 }}
          />
          <Polyline
            positions={pts}
            pathOptions={{ color, weight: 6, opacity: 1, dashArray }}
          >
            <Tooltip sticky direction="top">{tooltipContent}</Tooltip>
          </Polyline>
        </React.Fragment>
      ))}

      {dotEdges.map(({ lat, lng, ei }) => (
        <React.Fragment key={`cg_${cz.id}_dot_${ei}`}>
          <CircleMarker
            center={[lat, lng]}
            radius={heavy ? 14 : 11}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.15, weight: 2, opacity: 0.5 }}
          />
          <CircleMarker
            center={[lat, lng]}
            radius={heavy ? 7 : 5}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 2, opacity: 1 }}
          >
            <Tooltip sticky direction="top">{tooltipContent}</Tooltip>
          </CircleMarker>
        </React.Fragment>
      ))}
    </>
  )
}

export function TrafficDelaySummary({ congestionZones, activeRoute }) {
  const activeCong    = (congestionZones || []).filter(cz => cz.is_active !== false)
  const heavyCount    = activeCong.filter(c => c.level === 'HEAVY').length
  const moderateCount = activeCong.filter(c => c.level === 'MODERATE').length
  const delayS        = activeRoute?.traffic_delay_s || 0
  const delayMin      = Math.round(delayS / 60)

  if (activeCong.length === 0) return null

  return (
    <div style={{
      position: 'absolute', bottom: 90, left: 12, zIndex: 900,
      background: 'rgba(255,255,255,0.96)', borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      border: '1.5px solid #fed7aa',
      padding: '8px 12px', minWidth: 175,
      backdropFilter: 'blur(6px)',
    }}>
      <p style={{ fontWeight: 800, fontSize: 12, color: '#9a3412', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
        🚦 Info Kemacetan
        <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>LIVE</span>
      </p>
      {heavyCount > 0 && (
        <p style={{ fontSize: 11, color: '#9a3412', fontWeight: 700, marginBottom: 2 }}>
          🔴 {heavyCount} zona macet parah
        </p>
      )}
      {moderateCount > 0 && (
        <p style={{ fontSize: 11, color: '#c2410c', fontWeight: 700, marginBottom: 2 }}>
          🟠 {moderateCount} zona macet sedang
        </p>
      )}
      {delayMin > 0 && (
        <p style={{ fontSize: 11, color: '#d97706', fontWeight: 700, borderTop: '1px solid #fed7aa', paddingTop: 4, marginTop: 2 }}>
          ⏱ Delay: +{delayMin} menit
        </p>
      )}
      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 3 }}>
        Rute sudah menghindari kemacetan
      </p>
    </div>
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

  const activeRoute = routes?.[selectedMode] || null
  const activeTrafficSegments = activeRoute?.traffic_segments || []

  return (
    <>
      <TrafficDelaySummary congestionZones={congestionZones} activeRoute={activeRoute} />

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

      {start && <Marker position={[start.lat, start.lng]} icon={makeStartIcon()}><Popup><b>Titik Awal</b></Popup></Marker>}
      {end && destinationType === null && <Marker position={[end.lat, end.lng]} icon={makeEndIcon()}><Popup><b>Tujuan</b></Popup></Marker>}

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
            <Tooltip sticky>
              {tooltip} • {fmtMin(route.total_time_sec)} • {fmtKm(route.total_length_m)}
              {(route.traffic_delay_s || 0) > 60 && (
                <span style={{ color: '#d97706', fontWeight: 700, marginLeft: 6 }}>
                  (+{Math.round(route.traffic_delay_s / 60)} mnt delay macet)
                </span>
              )}
            </Tooltip>
          </Polyline>
        )
      })}

      {Array.isArray(congestionZones) && congestionZones
        .filter(cz => cz?.is_active !== false)
        .map((cz) => (
          <CongestionLines key={`cz_${cz.id}`} cz={cz} />
        ))}

      <TrafficPolylines trafficSegments={activeTrafficSegments} />

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

      {tracking && nextStep?.location && (
        <CircleMarker center={[nextStep.location.lat, nextStep.location.lng]} radius={6} pathOptions={{ color: '#10b981' }}>
          <Popup><b>Step berikutnya</b><br />{nextStep.instruction || '-'}</Popup>
        </CircleMarker>
      )}
    </>
  )
}