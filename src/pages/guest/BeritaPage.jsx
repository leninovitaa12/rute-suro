import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ExternalLink, Search, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import dayjs from 'dayjs'

const KATEGORI_COLOR = {
  'Festival':    { bg: '#fef2f2', text: '#b91c1c' },
  'System':      { bg: '#eff6ff', text: '#1d4ed8' },
  'Destinasi':   { bg: '#f5f3ff', text: '#7c3aed' },
  'Lalu Lintas': { bg: '#fff7ed', text: '#c2410c' },
  'Budaya':      { bg: '#fdf2f8', text: '#be185d' },
  'Umum':        { bg: '#f9fafb', text: '#374151' },
}

const KATEGORI_LIST = ['Semua', 'Festival', 'System', 'Destinasi', 'Lalu Lintas', 'Budaya', 'Umum']

/**
 * Ekstrak thumbnail dari URL berita menggunakan berbagai strategi:
 * 1. YouTube → img.youtube.com
 * 2. Detik  → OG image via allorigins proxy
 * 3. Kompas, Tribun, Liputan6, CNN Indonesia, dll → OG image via allorigins proxy
 * 4. Fallback: null (tampilkan placeholder)
 */
function extractYoutubeThumbnail(url) {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
  return null
}

/**
 * Buat URL proxy untuk ambil OG image dari domain berita mana pun.
 * Menggunakan allorigins.win yang bebas CORS.
 */
function makeOgProxyUrl(url) {
  if (!url) return null
  try {
    new URL(url) // validasi URL
    return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
  } catch {
    return null
  }
}

/**
 * Parse OG image dari HTML string
 */
function parseOgImage(html) {
  const match = html.match(/<meta[^>]+(?:property=["']og:image["']|name=["']og:image["'])[^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property=["']og:image["']|name=["']og:image["'])/i)
  return match ? match[1] : null
}

// Cache thumbnail supaya tidak fetch ulang
const thumbnailCache = {}

/**
 * Hook untuk auto-fetch thumbnail dari URL berita apapun
 */
function useAutoThumbnail(berita) {
  const [thumb, setThumb] = useState(berita.thumbnail || null)

  useEffect(() => {
    const url = berita.embed_url
    if (!url) return

    // Sudah ada thumbnail di DB → gunakan langsung
    if (berita.thumbnail) {
      setThumb(berita.thumbnail)
      return
    }

    // YouTube → langsung tanpa fetch
    const ytThumb = extractYoutubeThumbnail(url)
    if (ytThumb) {
      setThumb(ytThumb)
      return
    }

    // Cache hit
    if (thumbnailCache[url] !== undefined) {
      setThumb(thumbnailCache[url])
      return
    }

    // Fetch OG image via proxy
    const proxyUrl = makeOgProxyUrl(url)
    if (!proxyUrl) return

    let cancelled = false
    fetch(proxyUrl)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const html = data?.contents || ''
        const ogImage = parseOgImage(html)
        thumbnailCache[url] = ogImage || null
        setThumb(ogImage || null)
      })
      .catch(() => {
        if (!cancelled) {
          thumbnailCache[url] = null
          setThumb(null)
        }
      })

    return () => { cancelled = true }
  }, [berita.embed_url, berita.thumbnail])

  return thumb
}

// Komponen card berita dengan thumbnail otomatis
function BeritaCard({ berita }) {
  const thumb = useAutoThumbnail(berita)
  const kat = KATEGORI_COLOR[berita.kategori] || KATEGORI_COLOR['Umum']

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid #f3f4f6',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: berita.embed_url ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
      onClick={() => berita.embed_url && window.open(berita.embed_url, '_blank')}
    >
      {/* Thumbnail */}
      <div style={{
        height: 150,
        background: thumb
          ? `url(${thumb}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Jika tidak ada thumbnail → tampilkan placeholder teks */}
        {!thumb && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 6, color: 'rgba(255,255,255,0.35)',
          }}>
            <ImageIcon size={28} />
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>Tanpa Gambar</span>
          </div>
        )}

        {berita.embed_url && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: '4px 6px',
          }}>
            <ExternalLink size={12} color="#fff" />
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Badge kategori + tanggal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{
            padding: '2px 10px', borderRadius: 20,
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: kat.bg, color: kat.text,
          }}>{berita.kategori}</span>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
            {dayjs(berita.created_at).format('DD/MM/YYYY')}
          </span>
        </div>

        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.4 }}>
          {berita.judul}
        </h3>
        <p style={{
          fontSize: '0.8rem', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.6,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          flex: 1,
        }}>
          {berita.isi}
        </p>

        {/* Footer card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
          {berita.lokasi_lat && berita.lokasi_lng && (
            <Link
              to={`/map?dest_lat=${berita.lokasi_lat}&dest_lng=${berita.lokasi_lng}&dest_name=${encodeURIComponent(berita.lokasi_nama || 'Lokasi')}`}
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#b91c1c', textDecoration: 'none', fontWeight: 600 }}
            >
              <MapPin size={12} /> {berita.lokasi_nama || 'Lihat Lokasi'}
            </Link>
          )}
          {berita.embed_url && (
            <a
              href={berita.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#6b7280', textDecoration: 'none', marginLeft: 'auto' }}
            >
              <ExternalLink size={12} /> Baca Selengkapnya
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BeritaPage() {
  const [beritaList, setBeritaList] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterKat, setFilterKat]   = useState('Semua')

  useEffect(() => {
    async function fetchBerita() {
      setLoading(true)
      const { data } = await supabase
        .from('berita')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      setBeritaList(data || [])
      setLoading(false)
    }
    fetchBerita()
  }, [])

  const filtered = beritaList.filter(b => {
    const matchKat = filterKat === 'Semua' || b.kategori === filterKat
    const matchSearch = b.judul.toLowerCase().includes(search.toLowerCase()) ||
                        b.isi.toLowerCase().includes(search.toLowerCase())
    return matchKat && matchSearch
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
        padding: '4rem 1.5rem 3rem',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.75 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.85rem' }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ fontSize: '0.85rem' }}>Berita</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 10px' }}>Berita Terkini</h1>
          <p style={{ fontSize: '1rem', opacity: 0.85, margin: 0 }}>
            Informasi terbaru seputar Grebeg Suro, sistem navigasi, dan destinasi wisata Ponorogo.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari berita..."
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Kategori pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {KATEGORI_LIST.map(k => (
              <button
                key={k}
                onClick={() => setFilterKat(k)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: filterKat === k ? 'none' : '1px solid #e5e7eb',
                  background: filterKat === k ? '#b91c1c' : '#fff',
                  color: filterKat === k ? '#fff' : '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
                <div style={{ height: 150, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '1rem' }}>
                  <div style={{ height: 14, background: '#f3f4f6', borderRadius: 6, marginBottom: 8 }} />
                  <div style={{ height: 10, background: '#f3f4f6', borderRadius: 6, width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#9ca3af' }}>
            <svg style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.3 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p style={{ fontWeight: 600 }}>Tidak ada berita ditemukan</p>
            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.25rem' }}>
              Menampilkan {filtered.length} berita
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {filtered.map(berita => (
                <BeritaCard key={berita.id} berita={berita} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}