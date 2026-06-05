import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const KATEGORI_COLOR = {
  'Festival':    '#922626',
  'System':      '#2d5a27',
  'Destinasi':   '#922626',
  'Lalu Lintas': '#b45309',
  'Budaya':      '#7c3aed',
  'Umum':        '#4b5563',
}

export default function NewsSection() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('berita')
        .select('id, judul, isi, kategori, thumbnail, embed_url')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3)

      if (!error) setNews(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <section style={{ paddingTop: '96px', paddingBottom: '96px', background: '#f3efef' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px', textAlign: 'center', color: '#9ca3af' }}>
        Memuat berita...
      </div>
    </section>
  )

  if (news.length === 0) return null

  return (
    <section style={{ paddingTop: '96px', paddingBottom: '96px', background: '#f3efef' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Berita Terkini</h2>
          <a href="/berita" style={{ color: '#922626', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Lihat Semua Berita →</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {news.map((n) => (
            <article
              key={n.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.3s',
                cursor: 'pointer',
              }}
              onClick={() => { if (n.embed_url) window.open(n.embed_url, '_blank') }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}
            >
              <div style={{ height: '200px', overflow: 'hidden', background: '#1a1a2e' }}>
                {n.thumbnail ? (
                  <img
                    src={n.thumbnail}
                    alt={n.judul}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Tanpa Gambar</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '20px 24px 24px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  color: KATEGORI_COLOR[n.kategori] || '#4b5563',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                }}>
                  {n.kategori}
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#111827', lineHeight: 1.4, marginBottom: '10px' }}>
                  {n.judul}
                </h4>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {n.isi}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}