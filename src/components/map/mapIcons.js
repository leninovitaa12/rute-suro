import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const IMG = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'

// Marker dengan CSS filter warna
function filteredMarker(filter, w = 25, h = 41) {
  return L.divIcon({
    html: `<div style="filter:${filter};width:${w}px;height:${h}px;"><img src="${IMG}" width="${w}" height="${h}" style="display:block"/></div>`,
    className: '',
    iconSize: [w, h], iconAnchor: [Math.round(w / 2), h], popupAnchor: [0, -(h + 2)],
  })
}

const RED_FILTER = 'hue-rotate(140deg) saturate(3) brightness(0.85)'

export const makeStartIcon = () => L.divIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid white;box-shadow:0 0 0 2px #1a73e8,0 2px 6px rgba(26,115,232,0.5)"></div>`,
  className: '', iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -12],
})

export const makeArrowIcon = (deg = 0) => L.divIcon({
  html: `<div style="width:36px;height:36px;border-radius:50%;background:rgba(26,115,232,0.15);display:flex;align-items:center;justify-content:center;border:2px solid rgba(26,115,232,0.7);box-shadow:0 2px 8px rgba(0,0,0,0.15)"><div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:16px solid #1a73e8;transform:rotate(${Number.isFinite(deg) ? deg : 0}deg);transform-origin:50% 70%"></div></div>`,
  className: '', iconSize: [36, 36], iconAnchor: [18, 18],
})

export const makeEndIcon          = ()         => filteredMarker(RED_FILTER)
export const makeEventPreviewIcon = ()         => filteredMarker('none')
export const makeEventSelectedIcon = ()        => filteredMarker(RED_FILTER, 30, 49)

export const makeParkingIcon = (isSelected) => {
  if (isSelected) return filteredMarker(RED_FILTER, 30, 49)
  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35));width:28px;height:28px;"><svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="26" height="26" rx="5" fill="#1a47a0" stroke="#0d2d6e" stroke-width="1.5"/><text x="14" y="21" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="18" fill="white">P</text></svg></div>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
  })
}