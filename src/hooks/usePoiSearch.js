import { useState, useRef, useCallback } from 'react'
import { api } from '../lib/api.js'   // axios instance ke backend

// ── Alias lokal — mirror dari search_router.py ───────────────────────────────
// Kunci: kata kunci pendek (lowercase) → query yang dikirim
const LOCAL_ALIAS = {
  'pnm':          'Politeknik Negeri Madiun',
  'ejsc':         'EJSC Madiun',
  'ejsc madiun':  'EJSC Madiun Sport Center',
  'pasar pon':    'Pasar Ponorogo',
  'rsud pon':     'RSUD dr. Hardjono Ponorogo',
  'rsud madiun':  'RSUD dr. Soedono Madiun',
  'rsud':         'Rumah Sakit Umum Daerah',
  'unipma':       'Universitas PGRI Madiun',
  'iain pon':     'IAIN Ponorogo',
  'unmuh pon':    'Universitas Muhammadiyah Ponorogo',
  'alun alun':    'Alun-Alun Ponorogo',
  'terminal pon': 'Terminal Seloaji Ponorogo',
  'terminal mad': 'Terminal Madiun',
  'stasiun mad':  'Stasiun Madiun',
  'stasiun pon':  'Stasiun Ponorogo',
}

// Expand alias (lowercase match)
function expandAlias(q) {
  return LOCAL_ALIAS[q.trim().toLowerCase()] ?? q.trim()
}

// ── OSM Nominatim direct fallback ─────────────────────────────────────────────
async function searchNominatim(query, lat, lon, signal) {
  const params = new URLSearchParams({
    q:               query,
    format:          'jsonv2',
    addressdetails:  1,
    limit:           7,
    countrycodes:    'id',
    'accept-language': 'id',
  })
  if (lat && lon) {
    params.set('viewbox', `${lon - 0.8},${lat + 0.8},${lon + 0.8},${lat - 0.8}`)
  }
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      signal,
      headers: { 'User-Agent': 'NavigasiPonorogo/1.0' },
    }
  )
  if (!resp.ok) throw new Error('Nominatim error')
  const data = await resp.json()

  return data.map((r) => {
    const osm_type = r.type || ''
    let type = 'place'
    if (['amenity', 'tourism', 'shop', 'leisure', 'office'].includes(osm_type)) type = 'poi'
    else if (['road', 'street', 'residential'].includes(osm_type)) type = 'street'
    return {
      name:    (r.display_name || '').split(',')[0].trim(),
      address: r.display_name || '',
      lat:     parseFloat(r.lat),
      lon:     parseFloat(r.lon),
      type,
    }
  }).filter((r) => r.name)
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * @param {object}  opts
 * @param {number}  [opts.userLat]    - latitude user (untuk bias hasil)
 * @param {number}  [opts.userLon]    - longitude user
 * @param {number}  [opts.debounceMs] - delay debounce (default 350)
 * @param {number}  [opts.limit]      - max hasil (default 7)
 */
export function usePoiSearch({ userLat, userLon, debounceMs = 350, limit = 7 } = {}) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const debounceRef = useRef(null)
  const abortRef    = useRef(null)

  const search = useCallback(
    (rawQuery) => {
      // Reset jika query kosong
      if (!rawQuery || rawQuery.trim().length < 2) {
        setResults([])
        setLoading(false)
        setError(null)
        clearTimeout(debounceRef.current)
        return
      }

      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        // Batalkan request sebelumnya
        if (abortRef.current) abortRef.current.abort()
        const controller = new AbortController()
        abortRef.current = controller

        const query = expandAlias(rawQuery)
        setLoading(true)
        setError(null)

        try {
          // 1. Coba via backend /search
          const params = { q: query, limit }
          if (userLat) params.lat = userLat
          if (userLon) params.lon = userLon

          const { data } = await api.get('/search', {
            params,
            signal: controller.signal,
          })

          if (!controller.signal.aborted) {
            setResults(Array.isArray(data) ? data : [])
          }
        } catch (backendErr) {
          // Jika request sengaja dibatalkan → jangan fallback
          if (controller.signal.aborted) return

          console.warn('[usePoiSearch] backend /search gagal, fallback ke Nominatim:', backendErr)

          // 2. Fallback ke Nominatim langsung
          try {
            const fallbackResults = await searchNominatim(
              query, userLat, userLon, controller.signal
            )
            if (!controller.signal.aborted) {
              setResults(fallbackResults)
            }
          } catch (osmErr) {
            if (!controller.signal.aborted) {
              setError('Pencarian gagal. Periksa koneksi internet.')
              setResults([])
            }
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false)
        }
      }, debounceMs)
    },
    [userLat, userLon, debounceMs, limit]
  )

  const clear = useCallback(() => {
    clearTimeout(debounceRef.current)
    if (abortRef.current) abortRef.current.abort()
    setResults([])
    setLoading(false)
    setError(null)
  }, [])

  return { results, loading, error, search, clear }
}