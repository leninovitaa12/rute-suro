import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Helper: Leaflet default marker + CSS filter warna ────────────────────────
function makeFilteredMarker(filter, w, h) {
  w = w || 25
  h = h || 41
  var html = '<div style="filter:' + filter + ';width:' + w + 'px;height:' + h + 'px;">'
    + '<img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"'
    + ' width="' + w + '" height="' + h + '" style="display:block;" />'
    + '</div>'
  return L.divIcon({
    html: html,
    className: '',
    iconSize:    [w, h],
    iconAnchor:  [Math.round(w/2), h],
    popupAnchor: [0, -(h + 2)],
  })
}

// ─── START — lingkaran biru kecil (Google Maps style) ─────────────────────────
export function makeStartIcon() {
  var html = '<div style="'
    + 'width:16px;height:16px;border-radius:50%;'
    + 'background:#1a73e8;'
    + 'border:3px solid white;'
    + 'box-shadow:0 0 0 2px #1a73e8,0 2px 6px rgba(26,115,232,0.5);'
    + '"></div>'
  return L.divIcon({ html: html, className: '', iconSize: [16,16], iconAnchor: [8,8], popupAnchor: [0,-12] })
}

// ─── ARROW (posisi user navigasi) ─────────────────────────────────────────────
export function makeArrowIcon(deg) {
  var d = Number.isFinite(deg) ? deg : 0
  var html = '<div style="width:36px;height:36px;border-radius:50%;background:rgba(26,115,232,0.15);display:flex;align-items:center;justify-content:center;border:2px solid rgba(26,115,232,0.7);box-shadow:0 2px 8px rgba(0,0,0,0.15);">'
    + '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid #1a73e8;transform:rotate(' + d + 'deg);transform-origin:50% 70%;"></div>'
    + '</div>'
  return L.divIcon({ html: html, className: '', iconSize: [36,36], iconAnchor: [18,18] })
}

// ─── END / TUJUAN manual — marker merah normal ────────────────────────────────
export function makeEndIcon() {
  return makeFilteredMarker('hue-rotate(140deg) saturate(3) brightness(0.85)')
}

// ─── EVENT PREVIEW — marker biru default ─────────────────────────────────────
export function makeEventPreviewIcon() {
  return makeFilteredMarker('none')
}

// ─── EVENT SELECTED — marker merah, lebih besar ───────────────────────────────
export function makeEventSelectedIcon() {
  return makeFilteredMarker('hue-rotate(140deg) saturate(3) brightness(0.85)', 30, 49)
}

// ─── PARKIR NORMAL — kotak biru rambu parkir ─────────────────────────────────
export function makeParkingIcon(isSelected) {
  if (isSelected) {
    // Dipilih sebagai tujuan → marker merah lebih besar
    return makeFilteredMarker('hue-rotate(140deg) saturate(3) brightness(0.85)', 30, 49)
  }

  // Normal → rambu parkir: kotak biru dengan huruf P putih (SVG murni)
  var html = '<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));width:28px;height:28px;">'
    + '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<rect x="1" y="1" width="26" height="26" rx="5" fill="#1a47a0" stroke="#0d2d6e" stroke-width="1.5"/>'
    + '<text x="14" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="18" fill="white">P</text>'
    + '</svg>'
    + '</div>'
  return L.divIcon({
    html: html,
    className: '',
    iconSize:    [28, 28],
    iconAnchor:  [14, 14],
    popupAnchor: [0, -16],
  })
}