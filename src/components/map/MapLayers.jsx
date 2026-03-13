import React from 'react'
import { Marker, Popup, Polyline, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet'
import {
  makeArrowIcon,
  makeStartIcon,
  makeEndIcon,
  makeParkingIcon,
  makeEventPreviewIcon,
  makeEventSelectedIcon,
} from './mapIcons.js'
import { fmtMin, fmtKm } from './MapOverlays.jsx'

// ─── ClickSetter ──────────────────────────────────────────────────────────────
export function ClickSetter({ mode, onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng }, mode)
    },
  })
  return null
}

// ─── MapLayers: semua marker + polyline ───────────────────────────────────────
export default function MapLayers({
  myPos,
  bearing,
  start,
  end,
  selectedEventId,
  events,
  destinationType,
  spotsForSelectedEvent,
  selectedParkingId,
  closures,
  routes,
  selectedMode,
  tracking,
  nextStep,
  setEnd,
  setSelectedParkingId,
  setDestinationType,
  setMsg,
  fillAddressFor,
  applyEventAsDestination,
}) {
  return (
    <>
      {/* ── Posisi user ── */}
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


      {start && (
        <Marker position={[start.lat, start.lng]} icon={makeStartIcon()}>
          <Popup><b>Titik Awal</b></Popup>
        </Marker>
      )}
      {/* END marker hanya muncul jika tujuan dipilih manual (klik peta), bukan dari event/parkir */}
      {end && destinationType === null && (
        <Marker position={[end.lat, end.lng]} icon={makeEndIcon()}>
          <Popup><b>Tujuan</b></Popup>
        </Marker>
      )}

      {/* ── Marker lokasi event:
           • Preview abu dashed  → event dipilih di dropdown, belum klik "Tuju Lokasi Event"
           • Selected merah 🎯   → setelah klik "Tuju Lokasi Event"                       ── */}
      {selectedEventId && (() => {
        const ev = events.find(e => String(e.id) === String(selectedEventId))
        if (!ev?.lat || !ev?.lng) return null
        const isEventDest = destinationType === 'event'
        return (
          <Marker
            key={`event_marker_${ev.id}`}
            position={[ev.lat, ev.lng]}
            icon={isEventDest ? makeEventSelectedIcon() : makeEventPreviewIcon()}
            zIndexOffset={isEventDest ? 900 : 100}
          >
            <Popup>
              <div style={{ minWidth: '170px' }}>
                {/* Header warna sesuai state */}
                <div style={{
                  background: isEventDest
                    ? 'linear-gradient(135deg,#fef2f2,#fee2e2)'
                    : 'linear-gradient(135deg,#f9fafb,#f3f4f6)',
                  borderRadius: '8px 8px 0 0',
                  padding: '8px 10px',
                  marginBottom: '8px',
                  border: `1px solid ${isEventDest ? '#fca5a5' : '#e5e7eb'}`,
                  borderBottom: 'none',
                }}>
                  <p style={{
                    fontWeight: '800', fontSize: '13px',
                    color: isEventDest ? '#b91c1c' : '#374151',
                    marginBottom: '2px',
                  }}>
                    {ev.name}
                  </p>
                  {ev.location && (
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>{ev.location}</p>
                  )}
                </div>

                {isEventDest ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px 8px',
                    color: '#b91c1c', fontSize: '12px', fontWeight: '700',
                  }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{display:'inline',marginRight:'4px'}}><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Dipilih sebagai tujuan</span>
                  </div>
                ) : (
                  <div style={{ padding: '0 10px 8px' }}>
                    <button
                      style={{
                        width: '100%', padding: '6px 10px',
                        background: 'linear-gradient(135deg,#991b1b,#7f1d1d)',
                        color: 'white', border: 'none',
                        borderRadius: '6px', fontWeight: '700',
                        cursor: 'pointer', fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(153,27,27,0.35)',
                      }}
                      onClick={applyEventAsDestination}
                    >
                      Jadikan Tujuan
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })()}

      {/* ── Marker titik parkir ── */}
      {selectedEventId && spotsForSelectedEvent.map((spot) => {
        const isSelected = destinationType === 'parking' && String(spot.id) === String(selectedParkingId)
        return (
          <Marker
            key={`parking_${spot.id}`}
            position={[spot.lat, spot.lng]}
            icon={makeParkingIcon(isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div style={{ minWidth: '170px' }}>
                {/* Header parkir */}
                <div style={{
                  background: isSelected
                    ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
                    : 'linear-gradient(135deg,#eff6ff,#dbeafe)',
                  borderRadius: '8px 8px 0 0',
                  padding: '8px 10px',
                  marginBottom: '8px',
                  border: `1px solid ${isSelected ? '#fcd34d' : '#bfdbfe'}`,
                  borderBottom: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      display: 'inline-flex', width: '22px', height: '22px',
                      alignItems: 'center', justifyContent: 'center',
                      borderRadius: '5px',
                      background: isSelected ? '#f59e0b' : '#1d4ed8',
                      color: 'white', fontWeight: '900', fontSize: '13px',
                    }}>P</span>
                    <p style={{
                      fontWeight: '800', fontSize: '13px',
                      color: isSelected ? '#92400e' : '#1e40af',
                    }}>
                      {spot.name}
                      {isSelected && <span style={{ fontSize: '10px', marginLeft: '4px', fontWeight: '600' }}>(Tujuan)</span>}
                    </p>
                  </div>
                  {spot.description && (
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>{spot.description}</p>
                  )}
                  {spot.capacity != null && (
                    <p style={{
                      fontSize: '11px', fontWeight: '700',
                      color: isSelected ? '#b45309' : '#1d4ed8',
                      marginTop: '2px',
                    }}>
                      Kapasitas: {spot.capacity} kendaraan
                    </p>
                  )}
                </div>

                <div style={{ padding: '0 10px 8px' }}>
                  {isSelected ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      color: '#b45309', fontSize: '12px', fontWeight: '700',
                      padding: '4px 0',
                    }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{display:'inline',marginRight:'4px'}}><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>Parkir ini sedang dipilih</span>
                    </div>
                  ) : (
                    <button
                      style={{
                        width: '100%', padding: '6px 10px',
                        background: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)',
                        color: 'white', border: 'none',
                        borderRadius: '6px', fontWeight: '700',
                        cursor: 'pointer', fontSize: '12px',
                        boxShadow: '0 2px 6px rgba(29,78,216,0.35)',
                      }}
                      onClick={() => {
                        const pt = { lat: spot.lat, lng: spot.lng }
                        setEnd(pt)
                        setSelectedParkingId(String(spot.id))
                        setDestinationType('parking')
                        setMsg(`Tujuan di-set ke parkir: ${spot.name}. Tekan "Cari Rute".`)
                        fillAddressFor('end', pt)
                      }}
                    >
                      Jadikan Tujuan
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* ── Closures ── */}
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
              mouseout:  (e) => { try { const el = e?.target?.getTooltip?.()?.getElement?.(); if (el) { el.classList.remove('closure-show'); el.classList.add('closure-hidden') } e?.target?.closeTooltip?.() } catch {} },
              click:     (e) => { try { e?.originalEvent?.preventDefault?.(); const t = e?.target; t?.openTooltip?.(); const el = t?.getTooltip?.()?.getElement?.(); if (el) { const isShown = el.classList.contains('closure-show'); el.classList.toggle('closure-show', !isShown); el.classList.toggle('closure-hidden', isShown) } } catch {} },
            }}
          >
            <Tooltip permanent={false} sticky direction="top" offset={[0, -10]} className="closure-pill-tooltip closure-hidden" opacity={1}>
              DITUTUP: {reason}
            </Tooltip>
            <Popup><b>Ditutup</b><br />{reason}</Popup>
          </Polyline>
        )
      })}

      {/* ── Rute Tercepat ──
           Aktif   → biru solid #1d4ed8, tebal
           Inaktif → abu lebih terang #9ca3af, medium, dash          ── */}
      {routes.fastest?.polyline && (
        <Polyline
          positions={routes.fastest.polyline.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color:     selectedMode === 'fastest' ? '#1d4ed8' : '#9ca3af',
            weight:    selectedMode === 'fastest' ? 7 : 5,
            opacity:   selectedMode === 'fastest' ? 1 : 0.65,
            dashArray: selectedMode === 'fastest' ? undefined : '10 8',
          }}
        >
          <Tooltip sticky>
            Tercepat • {fmtMin(routes.fastest?.total_time_sec)} • {fmtKm(routes.fastest?.total_length_m)}
          </Tooltip>
        </Polyline>
      )}

      {/* ── Rute Terpendek ──
           Aktif   → biru terang #38bdf8, tebal
           Inaktif → abu lebih terang #9ca3af, medium, dash          ── */}
      {routes.shortest?.polyline && (
        <Polyline
          positions={routes.shortest.polyline.map((p) => [p.lat, p.lng])}
          pathOptions={{
            color:     selectedMode === 'shortest' ? '#38bdf8' : '#9ca3af',
            weight:    selectedMode === 'shortest' ? 7 : 5,
            opacity:   selectedMode === 'shortest' ? 1 : 0.65,
            dashArray: selectedMode === 'shortest' ? undefined : '10 8',
          }}
        >
          <Tooltip sticky>
            Terpendek • {fmtMin(routes.shortest?.total_time_sec)} • {fmtKm(routes.shortest?.total_length_m)}
          </Tooltip>
        </Polyline>
      )}

      {/* ── Next step marker ── */}
      {tracking && nextStep?.location && (
        <CircleMarker
          center={[nextStep.location.lat, nextStep.location.lng]}
          radius={6}
          pathOptions={{ color: '#10b981' }}
        >
          <Popup><b>Step berikutnya</b><br />{nextStep.instruction || '-'}</Popup>
        </CircleMarker>
      )}
    </>
  )
}