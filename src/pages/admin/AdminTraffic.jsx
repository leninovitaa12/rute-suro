import React, { useState, useEffect, useRef, useCallback } from 'react'
import dayjs from 'dayjs'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import Swal from 'sweetalert2'

import {
  getEvents,
  getClosures,
  createClosure,
  updateClosure,
  deleteClosure,
  deriveEdges,
} from '../../lib/backendApi'

import { supabase } from '../../lib/supabase'

// ── Congestion API (langsung ke Supabase, source=manual) ──────────────────────
const getCongestions = async () => {
  const { data, error } = await supabase
    .from('congestion_zones')
    .select('*')
    .eq('source', 'manual')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}
const createCongestion = async (body) => {
  const { data, error } = await supabase
    .from('congestion_zones')
    .insert([{ ...body, source: 'manual' }])
    .select()
    .single()
  if (error) throw error
  return data
}
const updateCongestionById = async (id, body) => {
  const { data, error } = await supabase
    .from('congestion_zones')
    .update({ ...body, source: 'manual' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
const deleteCongestionById = async (id) => {
  const { error } = await supabase.from('congestion_zones').delete().eq('id', id)
  if (error) throw error
  return true
}

const DEFAULT_CENTER = [-7.871, 111.462]

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toIso   = v => { const d = new Date(v); return isNaN(d) ? null : d.toISOString() }
const swalFn  = (icon, title, opts = {}) => Swal.fire({ icon, title, confirmButtonColor: icon === 'success' ? '#16a34a' : icon === 'error' ? '#dc2626' : '#2563eb', confirmButtonText: icon === 'error' ? 'Tutup' : 'OK', ...opts })
const swalOK  = (title, text) => swalFn('success', title, { text, timer: 3000, timerProgressBar: true })
const swalErr = (title, text) => swalFn('error', title, { text: text || 'Terjadi kesalahan.' })
const swalDel = name => Swal.fire({ icon: 'warning', title: 'Hapus data ini?', html: `<span style="color:#374151;font-size:14px"><b>${name}</b> akan dihapus permanen.</span>`, showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280', confirmButtonText: 'Ya, Hapus!', cancelButtonText: 'Batal', reverseButtons: true })

// ─── FIX 4: Reverse geocoding — ubah koordinat → nama tempat ──────────────────
async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1&accept-language=id`
    const res  = await fetch(url, { headers: { 'Accept-Language': 'id' } })
    const data = await res.json()
    if (!data || data.error) return null

    const a = data.address || {}
    // Prioritas: nama landmark/POI → jalan → kampung/kelurahan
    const poi =
      data.name ||
      a.amenity ||
      a.tourism ||
      a.shop ||
      a.leisure ||
      a.building ||
      a.historic ||
      a.office ||
      null

    const road = a.road || a.pedestrian || a.footway || a.path || a.street || null
    const area = a.suburb || a.village || a.neighbourhood || a.hamlet || null
    const city = a.city || a.town || a.municipality || null

    // Susun label: "Pendopo Agung, Jl. Pahlawan, Madiun"
    const parts = [poi, road, area || city].filter(Boolean)
    return parts.length > 0 ? parts.slice(0, 2).join(', ') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return null
  }
}

// ─── MapPicker ────────────────────────────────────────────────────────────────
function MapPicker({ onPick }) {
  useMapEvents({ click: e => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// ─── MapFlyTo ─────────────────────────────────────────────────────────────────
function MapFlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 17, { duration: 1.2 })
  }, [coords, map])
  return null
}

// ─── FIX 4: MapSearchBox — search + reverse geocode pada titik A & B ──────────
function MapSearchBox({ accentColor = '#2563eb' }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [flyTo, setFlyTo]     = useState(null)
  const [open, setOpen]       = useState(false)
  const debounceRef           = useRef(null)
  const wrapRef               = useRef(null)
  const inputRef              = useRef(null)

  useEffect(() => {
    const fn = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const search = useCallback((q) => {
    if (!q || q.trim().length < 3) { setResults([]); setOpen(false); return }
    setLoading(true)
    // Bounding box Madiun & sekitarnya
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=id&viewbox=111.1,-8.0,111.8,-7.6&bounded=0&limit=7&addressdetails=1`
    fetch(url, { headers: { 'Accept-Language': 'id' } })
      .then(r => r.json())
      .then(data => {
        setResults(data || [])
        setOpen((data || []).length > 0)
      })
      .catch(() => { setResults([]); setOpen(false) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 420)
    return () => clearTimeout(debounceRef.current)
  }, [query, search])

  const handleSelect = (item) => {
    const a    = item.address || {}
    const poi  = item.name || a.amenity || a.tourism || a.shop || a.leisure || a.building || null
    const road = a.road || a.pedestrian || a.footway || null
    const label = [poi, road].filter(Boolean).slice(0, 2).join(', ') || item.display_name.split(',').slice(0, 2).join(', ')
    setQuery(label)
    setResults([])
    setOpen(false)
    setFlyTo({ lat: parseFloat(item.lat), lng: parseFloat(item.lon) })
    inputRef.current?.blur()
  }

  const clear = () => { setQuery(''); setResults([]); setOpen(false); inputRef.current?.focus() }

  return (
    <>
      {flyTo && <MapFlyTo coords={flyTo} />}
      <div
        ref={wrapRef}
        style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 800, width: 340 }}
        // Cegah klik search bar agar tidak diteruskan ke MapPicker
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Input wrapper */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* icon search */}
          <svg style={{ position: 'absolute', left: 10, width: 15, height: 15, color: '#9ca3af', pointerEvents: 'none' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Cari lokasi: Pendopo Agung, Alun-alun..."
            style={{
              width: '100%',
              padding: '9px 32px 9px 32px',
              fontSize: 13,
              fontWeight: 500,
              border: `1.5px solid ${accentColor}55`,
              borderRadius: 10,
              outline: 'none',
              background: '#ffffff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.14)',
              color: '#111827',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={e => { e.target.style.borderColor = accentColor }}
            onBlur={e => { e.target.style.borderColor = `${accentColor}55` }}
          />
          {/* spinner or clear */}
          {loading && (
            <span style={{
              position: 'absolute', right: 10,
              width: 14, height: 14,
              border: '2px solid #e5e7eb',
              borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'mspin 0.7s linear infinite',
              display: 'inline-block',
            }} />
          )}
          {!loading && query && (
            <button onClick={clear} style={{
              position: 'absolute', right: 10,
              background: 'none', border: 'none',
              cursor: 'pointer', color: '#9ca3af',
              fontSize: 18, lineHeight: 1, padding: 0,
              display: 'flex', alignItems: 'center',
            }}>×</button>
          )}
        </div>

        {/* Dropdown results */}
        {open && results.length > 0 && (
          <div style={{
            marginTop: 4,
            background: '#fff',
            borderRadius: 10,
            border: '0.5px solid #e5e7eb',
            boxShadow: '0 8px 28px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            maxHeight: 260,
            overflowY: 'auto',
          }}>
            {results.map((item, i) => {
              const a    = item.address || {}
              const poi  = item.name || a.amenity || a.tourism || a.shop || a.leisure || a.building || null
              const road = a.road || a.pedestrian || a.footway || null
              const area = a.suburb || a.village || a.neighbourhood || null
              const city = a.city || a.town || a.county || null
              const main = [poi, road].filter(Boolean).slice(0, 2).join(', ') ||
                           item.display_name.split(',').slice(0, 2).join(',').trim()
              const sub  = [area, city].filter(Boolean).slice(0, 2).join(', ')

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  onMouseDown={e => e.stopPropagation()}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 14px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: i < results.length - 1 ? '0.5px solid #f3f4f6' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  {/* pin icon */}
                  <svg style={{ width: 14, height: 14, flexShrink: 0, marginTop: 3, color: accentColor }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{main}</p>
                    {sub && <p style={{ fontSize: 11, color: '#6b7280', margin: '1px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <style>{`@keyframes mspin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </>
  )
}

// ─── Form field components ────────────────────────────────────────────────────
const Lbl  = ({ text }) => <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{text}</label>
const Sel  = ({ value, onChange, cls = '', children }) => <select value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition bg-white ${cls}`}>{children}</select>
const Inp  = ({ value, onChange, placeholder, cls = '' }) => <input type="text" value={value} onChange={onChange} placeholder={placeholder} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition ${cls}`} />
const DtIn = ({ value, onChange, cls = '' }) => <input type="datetime-local" value={value} onChange={onChange} className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition ${cls}`} />

// ─── FIX 4: useEdgePicker — simpan label POI untuk titik A & B ────────────────
function useEdgePicker() {
  const [pickA,      setPickA]      = useState(null)   // { lat, lng }
  const [pickB,      setPickB]      = useState(null)
  const [labelA,     setLabelA]     = useState(null)   // nama tempat dari reverse geocode
  const [labelB,     setLabelB]     = useState(null)
  const [edges,      setEdges]      = useState([])
  const [geocoding,  setGeocoding]  = useState(false)  // loading indicator saat reverse geocode

  const reset = () => {
    setPickA(null); setPickB(null)
    setLabelA(null); setLabelB(null)
    setEdges([])
  }

  const onMapClick = async (p) => {
    if (!pickA) {
      setPickA(p)
      setGeocoding(true)
      const lbl = await reverseGeocode(p.lat, p.lng)
      setLabelA(lbl || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`)
      setGeocoding(false)
    } else if (!pickB) {
      setPickB(p)
      setGeocoding(true)
      const lbl = await reverseGeocode(p.lat, p.lng)
      setLabelB(lbl || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`)
      setGeocoding(false)
    } else {
      // klik ketiga: reset & mulai ulang dari A
      setPickA(p)
      setPickB(null)
      setLabelB(null)
      setEdges([])
      setGeocoding(true)
      const lbl = await reverseGeocode(p.lat, p.lng)
      setLabelA(lbl || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`)
      setGeocoding(false)
    }
  }

  const derive = async () => {
    if (!pickA || !pickB) {
      swalFn('info', 'Perlu 2 titik', { text: 'Klik 2 titik di peta (A lalu B).' })
      return
    }
    try {
      const e = await deriveEdges(pickA.lat, pickA.lng, pickB.lat, pickB.lng)
      setEdges(e || [])
      Swal.fire({
        icon: 'success', title: 'Ruas Jalan Terdeteksi',
        text: `${(e||[]).length} ruas jalan berhasil di-derive.`,
        timer: 2000, timerProgressBar: true, showConfirmButton: false,
      })
    } catch {
      const fallback = [{
        polyline: [
          pickA,
          { lat: (pickA.lat + pickB.lat) / 2, lng: (pickA.lng + pickB.lng) / 2 },
          pickB,
        ],
      }]
      setEdges(fallback)
      swalFn('info', 'Fallback Mode', { text: 'Server tidak merespons. Menggunakan garis lurus.' })
    }
  }

  return { pickA, pickB, labelA, labelB, geocoding, edges, setEdges, reset, onMapClick, derive }
}

// ─── FIX 2 & 4: PickerPanel — tampilkan nama POI, bukan koordinat ─────────────
function PickerPanel({ pickA, pickB, labelA, labelB, geocoding, edges, onDerive, onReset, accentColor = 'bg-blue-600' }) {
  return (
    <>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-xs">
        <p className="font-semibold text-blue-900 mb-1">Pilih ruas jalan di peta:</p>
        <p className="text-blue-700">Klik 2 titik di peta (A lalu B), lalu tekan Derive Edges.</p>
      </div>

      {/* Titik A & B — tampilkan nama POI hasil reverse geocode */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
        {[
          { lbl: 'A', pt: pickA, name: labelA, bg: 'bg-blue-600' },
          { lbl: 'B', pt: pickB, name: labelB, bg: 'bg-gray-500' },
        ].map(({ lbl, pt, name, bg }) => (
          <div key={lbl} className="flex items-start gap-2 text-xs">
            <span className={`w-5 h-5 rounded-full ${bg} text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5`}>
              {lbl}
            </span>
            <div className="min-w-0">
              {!pt ? (
                <span className="text-gray-400 italic">Belum dipilih</span>
              ) : geocoding && !name ? (
                <span className="text-gray-400 italic">Memuat nama lokasi…</span>
              ) : (
                <>
                  <p className="text-gray-800 font-semibold leading-tight truncate">{name}</p>
                  <p className="text-gray-400 font-mono text-[10px] mt-0.5">{pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {geocoding && (
          <p className="text-[10px] text-blue-500 flex items-center gap-1">
            <span className="inline-block w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
            Sedang mencari nama lokasi…
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onReset}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition">
          Reset
        </button>
        <button onClick={onDerive}
          className={`flex-1 px-3 py-2 ${accentColor} text-white text-sm font-semibold rounded-lg hover:opacity-90 transition`}>
          Derive Edges
        </button>
      </div>

      <div className={`p-3 rounded-lg border text-xs font-semibold ${edges.length > 0 ? 'bg-green-50 border-green-300 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
        Ruas jalan terdeteksi: <span className="font-bold text-base">{edges.length}</span>
      </div>
    </>
  )
}

// ─── HistoryRow ───────────────────────────────────────────────────────────────
function HistoryRow({ item, editingId, onEdit, onDelete, badgeClass, badgeLabel, extraInfo }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${editingId === item.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${badgeClass}`}>{badgeLabel}</span>
          {item.reason && <span className="text-sm font-semibold text-gray-900 truncate">{item.reason}</span>}
          {editingId === item.id && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700">
              ✏️ Sedang diedit
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {item.edges?.length || 0} ruas jalan
          {item.start_time && <> &middot; {dayjs(item.start_time).format('DD/MM/YYYY HH:mm')}</>}
          {extraInfo}
        </p>
      </div>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(item)}
          className="px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
          Edit
        </button>
        <button onClick={() => onDelete(item)}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
          Hapus
        </button>
      </div>
    </div>
  )
}

const MAP_HEIGHT = 620

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTraffic() {
  const [activeTab, setActiveTab] = useState('closure')

  // FIX 1: State terpisah untuk setiap entitas, reload eksplisit setelah mutasi
  const [closures,    setClosures]    = useState([])
  const [events,      setEvents]      = useState([])
  const [loadingCl,   setLoadingCl]   = useState(true)
  const [error,       setError]       = useState(null)
  const [saving,      setSaving]      = useState(false)

  const EMPTY_CL = { id: null, event_id: '', type: 'CLOSED', reason: '', start_time: '', end_time: '' }
  const [clForm, setClForm] = useState(EMPTY_CL)
  const clPicker = useEdgePicker()

  const [congestions,  setCongestions]  = useState([])
  const [loadingCong,  setLoadingCong]  = useState(true)
  const [cgSaving,     setCgSaving]     = useState(false)
  const EMPTY_CG = { id: null, event_id: '', level: 'MODERATE', reason: '', start_time: '', end_time: '' }
  const [cgForm, setCgForm] = useState(EMPTY_CG)
  const cgPicker = useEdgePicker()

  // FIX 1: loadClosures — selalu fetch ulang, tidak pakai cache
  const loadClosures = useCallback(async () => {
    try {
      setLoadingCl(true)
      // timestamp param untuk bust cache jika backend melakukan caching
      const cl = await getClosures(false)
      setClosures(Array.isArray(cl) ? cl : [])
    } catch (err) {
      console.error('[AdminTraffic] closure load error:', err)
      setClosures([])
    } finally {
      setLoadingCl(false)
    }
  }, [])

  const loadCongestions = useCallback(async () => {
    try {
      setLoadingCong(true)
      const data = await getCongestions()
      setCongestions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('[AdminTraffic] congestion load error:', err)
      setCongestions([])
    } finally {
      setLoadingCong(false)
    }
  }, [])

  // Load awal
  useEffect(() => {
    ;(async () => {
      try {
        const ev = await getEvents()
        setEvents(ev || [])
        setError(null)
      } catch (err) {
        console.error('[AdminTraffic] event load error:', err)
        setError('Tidak dapat memuat data. Periksa koneksi Supabase.')
      }
    })()
    loadClosures()
    loadCongestions()
  }, [loadClosures, loadCongestions])

  // ── Closure CRUD ──────────────────────────────────────────────────────────
  const resetCl = () => { setClForm(EMPTY_CL); clPicker.reset() }

  const saveClosure = async () => {
    if (!clPicker.edges.length) {
      swalErr('Ruas Jalan Kosong', 'Pilih 2 titik di peta lalu tekan Derive Edges.')
      return
    }
    if (!clForm.reason.trim()) {
      swalErr('Alasan Wajib Diisi', 'Mohon isi field alasan rekayasa lalu lintas.')
      return
    }
    setSaving(true)
    const p = {
      event_id:   clForm.event_id || null,
      type:       clForm.type,
      reason:     clForm.reason.trim() || null,
      start_time: toIso(clForm.start_time),
      end_time:   toIso(clForm.end_time),
      edges:      clPicker.edges,
      is_active:  true,
    }
    try {
      if (clForm.id) {
        await updateClosure(clForm.id, p)
        await swalOK('Berhasil Diperbarui!', 'Data rekayasa telah diperbarui.')
      } else {
        await createClosure(p)
        await swalOK('Berhasil Disimpan!', 'Rekayasa baru berhasil ditambahkan.')
      }
      resetCl()
      // FIX 1: Reload dari server setelah save agar data segar
      await loadClosures()
    } catch (e) {
      swalErr('Gagal Menyimpan', e?.message || 'Terjadi kesalahan.')
    } finally {
      setSaving(false)
    }
  }

  const editClosure = c => {
    setClForm({
      id:         c.id,
      event_id:   c.event_id || '',
      type:       c.type || 'CLOSED',
      reason:     c.reason || '',
      start_time: c.start_time?.slice(0, 16) || '',
      end_time:   c.end_time?.slice(0, 16)   || '',
    })
    clPicker.setEdges(c.edges || [])
    setTimeout(() => document.getElementById('closure-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const deleteCl = async c => {
    const r = await swalDel(`${c.type}${c.reason ? ' — ' + c.reason : ''}`)
    if (!r.isConfirmed) return
    try {
      await deleteClosure(c.id)
      // Jika item yang dihapus sedang diedit, reset form
      if (clForm.id === c.id) resetCl()
      await swalOK('Berhasil Dihapus!', 'Data rekayasa telah dihapus.')
      await loadClosures()
    } catch (e) {
      swalErr('Gagal Menghapus', e?.message)
    }
  }

  // ── Congestion CRUD ───────────────────────────────────────────────────────
  const resetCg = () => { setCgForm(EMPTY_CG); cgPicker.reset() }

  const saveCongestion = async () => {
    if (!cgPicker.edges.length) {
      swalErr('Ruas Jalan Kosong', 'Pilih 2 titik di peta lalu tekan Derive Edges.')
      return
    }
    setCgSaving(true)
    const p = {
      event_id:   cgForm.event_id || null,
      level:      cgForm.level,
      reason:     cgForm.reason || null,
      start_time: toIso(cgForm.start_time),
      end_time:   toIso(cgForm.end_time),
      edges:      cgPicker.edges,
      is_active:  true,
    }
    try {
      if (cgForm.id) {
        await updateCongestionById(cgForm.id, p)
        await swalOK('Berhasil Diperbarui!', 'Zona kemacetan diperbarui.')
      } else {
        await createCongestion(p)
        await swalOK('Berhasil Disimpan!', 'Zona kemacetan ditambahkan.')
      }
      resetCg()
      await loadCongestions()
    } catch (e) {
      swalErr('Gagal Menyimpan', e?.message || 'Terjadi kesalahan.')
    } finally {
      setCgSaving(false)
    }
  }

  const editCongestion = cg => {
    if (cg.source && cg.source !== 'manual') {
      swalErr('Tidak Dapat Diedit', 'Hanya zona kemacetan manual yang dapat diedit.')
      return
    }
    setCgForm({
      id:         cg.id,
      event_id:   cg.event_id || '',
      level:      cg.level    || 'MODERATE',
      reason:     cg.reason   || '',
      start_time: cg.start_time?.slice(0, 16) || '',
      end_time:   cg.end_time?.slice(0, 16)   || '',
    })
    cgPicker.setEdges(cg.edges || [])
    setTimeout(() => document.getElementById('congestion-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const deleteCg = async cg => {
    const r = await swalDel(`${cg.level} — ${cg.reason || 'Zona Kemacetan'}`)
    if (!r.isConfirmed) return
    try {
      await deleteCongestionById(cg.id)
      if (cgForm.id === cg.id) resetCg()
      await swalOK('Berhasil Dihapus!', 'Zona kemacetan telah dihapus.')
      await loadCongestions()
    } catch (e) {
      swalErr('Gagal Menghapus', e?.message)
    }
  }

  const fcl = 'focus:ring-red-500/20 focus:border-red-400'
  const fcg = 'focus:ring-orange-500/20 focus:border-orange-400'

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Rekayasa Lalu Lintas</h1>
        <p className="text-gray-600 mt-1">Kelola penutupan jalan dan zona kemacetan</p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          ['closure',    'bg-red-600',    'bg-red-400',    'Penutupan Jalan'],
          ['congestion', 'bg-orange-500', 'bg-orange-400', 'Zona Kemacetan'],
        ].map(([tab, act, dot, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? `${act} text-white shadow-md` : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`}>
            <span className="flex items-center gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`} />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ══ CLOSURE ══════════════════════════════════════════════════════════ */}
      {activeTab === 'closure' && (
        <>
          {/* FIX 2: Banner edit mode yang jelas di atas form */}
          {clForm.id && (
            <div className="mb-3 flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-300 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-blue-800 font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Mode Edit Aktif — sedang mengedit rekayasa lalu lintas
              </div>
              <button onClick={resetCl}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal Edit
              </button>
            </div>
          )}

          <div
            id="closure-form"
            className={`flex gap-5 rounded-xl overflow-hidden border shadow-sm bg-white ${clForm.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}
            style={{ height: MAP_HEIGHT }}
          >
            {/* Form panel */}
            <div className="overflow-y-auto p-6 space-y-4 border-r border-gray-100" style={{ width: 300, flexShrink: 0 }}>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {clForm.id ? '✏️ Edit Rekayasa' : 'Tambah Rekayasa Baru'}
                </h2>
                {clForm.id && <p className="text-xs text-blue-600 font-semibold mt-0.5">Mode edit aktif</p>}
              </div>

              <div>
                <Lbl text="Terkait Event" />
                <Sel value={clForm.event_id} onChange={e => setClForm({ ...clForm, event_id: e.target.value })} cls={fcl}>
                  <option value="">-- Pilih Event (opsional) --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </Sel>
              </div>

              <div>
                <Lbl text="Tipe Rekayasa" />
                <Sel value={clForm.type} onChange={e => setClForm({ ...clForm, type: e.target.value })} cls={fcl}>
                  <option value="CLOSED">CLOSED (Jalan Ditutup)</option>
                  <option value="DIVERSION">DIVERSION (Dialihkan)</option>
                </Sel>
              </div>

              <div>
                <Lbl text="Alasan Rekayasa *" />
                <Inp value={clForm.reason} onChange={e => setClForm({ ...clForm, reason: e.target.value })} placeholder="Contoh: Kirab pusaka" cls={fcl} />
              </div>
              <div><Lbl text="Waktu Mulai" /><DtIn value={clForm.start_time} onChange={e => setClForm({ ...clForm, start_time: e.target.value })} cls={fcl} /></div>
              <div><Lbl text="Waktu Selesai" /><DtIn value={clForm.end_time} onChange={e => setClForm({ ...clForm, end_time: e.target.value })} cls={fcl} /></div>

              {/* FIX 4: PickerPanel dengan POI labels */}
              <PickerPanel
                pickA={clPicker.pickA}
                pickB={clPicker.pickB}
                labelA={clPicker.labelA}
                labelB={clPicker.labelB}
                geocoding={clPicker.geocoding}
                edges={clPicker.edges}
                onDerive={clPicker.derive}
                onReset={clPicker.reset}
                accentColor="bg-blue-600"
              />

              {/* FIX 2: Tombol Batal di dalam form */}
              <div className={`flex gap-2 ${clForm.id ? '' : ''}`}>
                {clForm.id && (
                  <button onClick={resetCl}
                    className="flex-1 px-4 py-3 font-bold text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
                    Batal
                  </button>
                )}
                <button onClick={saveClosure} disabled={saving}
                  className={`${clForm.id ? 'flex-1' : 'w-full'} px-4 py-3 font-bold text-sm rounded-lg transition ${saving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : clForm.id ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {saving ? 'Menyimpan…' : clForm.id ? '✏️ Update Rekayasa' : '➕ Simpan Rekayasa'}
                </button>
              </div>
            </div>

            {/* Map — FIX 4: MapSearchBox aktif dan tidak trigger MapPicker */}
            <div className="flex-1 flex flex-col min-w-0" style={{ isolation: 'isolate' }}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700">Peta Rekayasa Lalu Lintas</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-red-500 rounded inline-block" />Ditutup</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-400 rounded inline-block" />Dialihkan</span>
                </div>
              </div>
              <div className="flex-1" style={{ position: 'relative', zIndex: 0, minHeight: 0 }}>
                <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {/* FIX 4: search bar — stopPropagation cegah trigger MapPicker */}
                  <MapSearchBox accentColor="#dc2626" />
                  <MapPicker onPick={clPicker.onMapClick} />
                  {clPicker.pickA && (
                    <Marker position={[clPicker.pickA.lat, clPicker.pickA.lng]}>
                      <Popup><b>Titik A</b><br /><span style={{ fontSize: 12, color: '#555' }}>{clPicker.labelA || '…'}</span></Popup>
                    </Marker>
                  )}
                  {clPicker.pickB && (
                    <Marker position={[clPicker.pickB.lat, clPicker.pickB.lng]}>
                      <Popup><b>Titik B</b><br /><span style={{ fontSize: 12, color: '#555' }}>{clPicker.labelB || '…'}</span></Popup>
                    </Marker>
                  )}
                  {clPicker.edges.map((e, i) => (
                    <Polyline key={'d' + i}
                      positions={e.polyline.map(p => [p.lat, p.lng])}
                      pathOptions={{ color: clForm.type === 'CLOSED' ? 'red' : 'orange', weight: 6, opacity: 0.85 }} />
                  ))}
                  {closures.flatMap(c => (c.edges || []).map((e, i) => (
                    <Polyline key={c.id + '_' + i}
                      positions={e.polyline.map(p => [p.lat, p.lng])}
                      pathOptions={{ color: c.type === 'CLOSED' ? 'red' : 'orange', weight: 4, opacity: 0.6 }}>
                      <Popup>
                        <p style={{ fontWeight: 'bold', marginBottom: 4 }}>{c.type}</p>
                        <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{c.reason || '—'}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => editClosure(c)} style={{ flex: 1, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteCl(c)} style={{ flex: 1, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                        </div>
                      </Popup>
                    </Polyline>
                  )))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Histori Closure */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Histori Rekayasa Lalu Lintas</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">{closures.length} data</span>
                <button onClick={loadClosures}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            {loadingCl ? (
              <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center">
                <span className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
                Memuat data…
              </div>
            ) : closures.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada rekayasa lalu lintas terdaftar.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {closures.map(c => (
                  <HistoryRow key={c.id} item={c} editingId={clForm.id}
                    onEdit={editClosure} onDelete={deleteCl}
                    badgeClass={c.type === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                    badgeLabel={c.type} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ CONGESTION ═══════════════════════════════════════════════════════ */}
      {activeTab === 'congestion' && (
        <>
          <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-orange-50 border border-orange-200 text-orange-900 rounded-xl text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold mb-0.5">Tentang Zona Kemacetan</p>
              <p className="text-xs text-orange-800 leading-relaxed">
                Jalan macet <b>tetap bisa dilewati</b> — A* memberi bobot lebih tinggi.
                Ditampilkan <span className="font-bold text-orange-600">garis oranye</span> di peta pengguna.{' '}
                <b>MODERATE</b> = 2.5× lebih lambat, <b>HEAVY</b> = 5× lebih lambat.
              </p>
              <p className="text-xs text-orange-700 font-semibold mt-1">
                📋 Halaman ini hanya menampilkan kemacetan yang diinput manual oleh admin. Data realtime TomTom dikelola otomatis oleh sistem.
              </p>
            </div>
          </div>

          {/* FIX 2: Banner edit mode congestion */}
          {cgForm.id && (
            <div className="mb-3 flex items-center justify-between px-4 py-3 bg-orange-50 border border-orange-300 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-orange-800 font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Mode Edit Aktif — sedang mengedit zona kemacetan
              </div>
              <button onClick={resetCg}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batal Edit
              </button>
            </div>
          )}

          <div
            id="congestion-form"
            className={`flex gap-5 rounded-xl overflow-hidden border shadow-sm bg-white ${cgForm.id ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-200'}`}
            style={{ height: MAP_HEIGHT }}
          >
            {/* Form panel */}
            <div className="overflow-y-auto p-6 space-y-4 border-r border-gray-100" style={{ width: 300, flexShrink: 0 }}>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {cgForm.id ? '✏️ Edit Kemacetan' : 'Tambah Zona Macet'}
                </h2>
                {cgForm.id && <p className="text-xs text-orange-600 font-semibold mt-0.5">Mode edit aktif</p>}
              </div>

              <div>
                <Lbl text="Terkait Event" />
                <Sel value={cgForm.event_id} onChange={e => setCgForm({ ...cgForm, event_id: e.target.value })} cls={fcg}>
                  <option value="">-- Pilih Event (opsional) --</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </Sel>
              </div>

              <div>
                <Lbl text="Level Kemacetan" />
                <Sel value={cgForm.level} onChange={e => setCgForm({ ...cgForm, level: e.target.value })} cls={fcg}>
                  <option value="MODERATE">MODERATE — Macet Sedang (ETA 2.5×)</option>
                  <option value="HEAVY">HEAVY — Macet Parah (ETA 5×)</option>
                </Sel>
                <p className="mt-1 text-[11px] text-gray-400">A* akan menghindari jika ada jalur alternatif lebih cepat.</p>
              </div>

              <div>
                <Lbl text="Keterangan" />
                <Inp value={cgForm.reason} onChange={e => setCgForm({ ...cgForm, reason: e.target.value })} placeholder="Contoh: Antrian kirab, pasar malam" cls={fcg} />
              </div>
              <div><Lbl text="Waktu Mulai" /><DtIn value={cgForm.start_time} onChange={e => setCgForm({ ...cgForm, start_time: e.target.value })} cls={fcg} /></div>
              <div><Lbl text="Waktu Selesai" /><DtIn value={cgForm.end_time} onChange={e => setCgForm({ ...cgForm, end_time: e.target.value })} cls={fcg} /></div>

              <PickerPanel
                pickA={cgPicker.pickA}
                pickB={cgPicker.pickB}
                labelA={cgPicker.labelA}
                labelB={cgPicker.labelB}
                geocoding={cgPicker.geocoding}
                edges={cgPicker.edges}
                onDerive={cgPicker.derive}
                onReset={cgPicker.reset}
                accentColor="bg-orange-500"
              />

              <div className={`flex gap-2`}>
                {cgForm.id && (
                  <button onClick={resetCg}
                    className="flex-1 px-4 py-3 font-bold text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition">
                    Batal
                  </button>
                )}
                <button onClick={saveCongestion} disabled={cgSaving}
                  className={`${cgForm.id ? 'flex-1' : 'w-full'} px-4 py-3 font-bold text-sm rounded-lg transition ${cgSaving ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : cgForm.id ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                  {cgSaving ? 'Menyimpan…' : cgForm.id ? '✏️ Update Zona Macet' : '➕ Simpan Zona Macet'}
                </button>
              </div>
            </div>

            {/* Map congestion */}
            <div className="flex-1 flex flex-col min-w-0" style={{ isolation: 'isolate' }}>
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700">
                  Peta Zona Kemacetan <span className="text-xs text-gray-400 font-normal">(manual saja)</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-400 rounded inline-block" />Macet Sedang</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-1.5 bg-orange-600 rounded inline-block" />Macet Parah</span>
                </div>
              </div>
              <div className="flex-1" style={{ position: 'relative', zIndex: 0, minHeight: 0 }}>
                <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ position: 'absolute', inset: 0, height: '100%', width: '100%' }}>
                  <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapSearchBox accentColor="#f97316" />
                  <MapPicker onPick={cgPicker.onMapClick} />
                  {cgPicker.pickA && (
                    <Marker position={[cgPicker.pickA.lat, cgPicker.pickA.lng]}>
                      <Popup><b>Titik A</b><br /><span style={{ fontSize: 12, color: '#555' }}>{cgPicker.labelA || '…'}</span></Popup>
                    </Marker>
                  )}
                  {cgPicker.pickB && (
                    <Marker position={[cgPicker.pickB.lat, cgPicker.pickB.lng]}>
                      <Popup><b>Titik B</b><br /><span style={{ fontSize: 12, color: '#555' }}>{cgPicker.labelB || '…'}</span></Popup>
                    </Marker>
                  )}
                  {cgPicker.edges.map((e, i) => (
                    <Polyline key={'cgd' + i}
                      positions={e.polyline.map(p => [p.lat, p.lng])}
                      pathOptions={{ color: cgForm.level === 'HEAVY' ? '#ea580c' : '#fb923c', weight: 6, opacity: 0.85, dashArray: '8,4' }} />
                  ))}
                  {congestions.map(cg => (cg.edges || []).map((e, i) => (
                    <Polyline key={cg.id + '_cg_' + i}
                      positions={e.polyline.map(p => [p.lat, p.lng])}
                      pathOptions={{ color: cg.level === 'HEAVY' ? '#ea580c' : '#fb923c', weight: 5, opacity: 0.7, dashArray: '8,4' }}>
                      <Popup>
                        <p style={{ fontWeight: 'bold', marginBottom: 2 }}>🚦 {cg.level === 'HEAVY' ? 'Macet Parah' : 'Macet Sedang'}</p>
                        <p style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{cg.reason || '—'}</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => editCongestion(cg)} style={{ flex: 1, padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => deleteCg(cg)} style={{ flex: 1, padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                        </div>
                      </Popup>
                    </Polyline>
                  )))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Histori Congestion */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Daftar Zona Kemacetan <span className="text-xs text-gray-400 font-normal">(manual)</span>
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium">{congestions.length} data</span>
                <button onClick={loadCongestions}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
            {loadingCong ? (
              <div className="flex items-center gap-3 text-sm text-gray-400 px-6 py-10 justify-center">
                <span className="w-4 h-4 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                Memuat data…
              </div>
            ) : congestions.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-400">Belum ada zona kemacetan manual terdaftar.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {congestions.map(cg => (
                  <HistoryRow key={cg.id} item={cg} editingId={cgForm.id}
                    onEdit={editCongestion} onDelete={deleteCg}
                    badgeClass={cg.level === 'HEAVY' ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600'}
                    badgeLabel={`🚦 ${cg.level}`}
                    extraInfo={cg.end_time ? <> s/d {dayjs(cg.end_time).format('DD/MM HH:mm')}</> : null} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}