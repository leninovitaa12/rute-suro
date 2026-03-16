// src/pages/guest/TentangPage.jsx
// ✅ Layout asli 100% + bubble animasi + poster infografis + lightbox fullscreen (navbar hide, FAQ dihapus)

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTentang, getPoster } from '../../lib/backendApi'

export default function TentangPage() {
  const [tentangItems, setTentangItems]   = useState([])
  const [posters, setPosters]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [posterLoading, setPosterLoading] = useState(true)
  const [error, setError]                 = useState(null)
  const [lightboxImg, setLightboxImg]     = useState(null)

  useEffect(() => { loadTentang(); loadPosters() }, [])

  // ESC untuk tutup lightbox
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeLightbox() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // saat lightbox buka: hide navbar + lock scroll
  // saat lightbox tutup: restore navbar + unlock scroll
  useEffect(() => {
    if (lightboxImg) {
      document.body.style.overflow = 'hidden'
      // sembunyikan semua elemen navbar (header/nav yang sticky/fixed di atas)
      const navEls = document.querySelectorAll('header, nav, [class*="navbar"], [class*="Navbar"]')
      navEls.forEach(el => {
        el.dataset.prevZindex = el.style.zIndex || ''
        el.dataset.prevVisibility = el.style.visibility || ''
        el.style.zIndex = '0'
        el.style.visibility = 'hidden'
      })
    } else {
      document.body.style.overflow = ''
      const navEls = document.querySelectorAll('header, nav, [class*="navbar"], [class*="Navbar"]')
      navEls.forEach(el => {
        el.style.zIndex = el.dataset.prevZindex || ''
        el.style.visibility = el.dataset.prevVisibility || ''
      })
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxImg])

  const openLightbox  = (poster) => setLightboxImg(poster)
  const closeLightbox = ()       => setLightboxImg(null)

  const loadTentang = async () => {
    try {
      setLoading(true)
      const data = await getTentang()
      setTentangItems(data)
    } catch (err) {
      console.error('[v0] Error loading tentang:', err)
      setError('Gagal memuat data tentang')
    } finally { setLoading(false) }
  }

  const loadPosters = async () => {
    try {
      setPosterLoading(true)
      const data = await getPoster()
      setPosters(data)
    } catch (err) {
      console.error('[v0] Error loading poster:', err)
    } finally { setPosterLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* ════════════════════════════════════
           SEMUA STYLE ASLI — TIDAK BERUBAH
        ════════════════════════════════════ */
        .t-card {
          position: relative; overflow: hidden;
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px;
          transition: border-color 0.4s ease, transform 0.4s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.4s ease;
        }
        .t-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%); transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
          border-radius: 14px 14px 0 0;
        }
        .t-card::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.05) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.4s ease; pointer-events: none;
        }
        .t-card:hover { border-color: rgba(153,27,27,0.4); transform: translateY(-6px); box-shadow: 0 20px 44px rgba(153,27,27,0.10), 0 4px 14px rgba(0,0,0,0.05); }
        .t-card:hover::before { transform: translateX(100%); }
        .t-card:hover::after  { opacity: 1; }

        @keyframes numFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .num-badge { animation: numFloat 2.8s ease-in-out infinite; position: absolute; z-index: 1; }

        .tech-tag {
          padding: 5px 13px; background: rgba(153,27,27,0.07); color: #991b1b;
          font-size: 13px; font-weight: 700; border-radius: 999px;
          border: 1px solid rgba(153,27,27,0.15); transition: background 0.25s, transform 0.2s; cursor: default;
        }
        .tech-tag:hover { background: rgba(153,27,27,0.13); transform: translateY(-2px); }

        .feat-row-item {
          display: flex; gap: 12px; padding: 10px 8px;
          border-bottom: 1px solid #f3f4f6; border-radius: 8px;
          transition: background 0.2s, transform 0.2s; cursor: default; position: relative; z-index: 1;
        }
        .feat-row-item:hover { background: #fafafa; transform: translateX(4px); }

        .green-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#16a34a; }

        /* ════════════════════════════════════
           BUBBLE ANIMASI
        ════════════════════════════════════ */
        @keyframes bFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          30%     { transform: translate(16px,-24px) scale(1.04); }
          65%     { transform: translate(6px,-42px) scale(0.97); }
        }
        @keyframes bFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          25%     { transform: translate(-22px,18px) scale(1.06); }
          60%     { transform: translate(-8px,34px) scale(0.95); }
        }
        @keyframes bFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(14px,20px) scale(1.05); }
          75%     { transform: translate(-12px,10px) scale(0.96); }
        }
        @keyframes bFloat4 {
          0%,100% { transform: translate(0,0) scale(1); }
          35%     { transform: translate(20px,-14px) scale(0.94); }
          70%     { transform: translate(8px,-30px) scale(1.07); }
        }
        @keyframes bPulse { 0%,100% { opacity: 0.14; } 50% { opacity: 0.30; } }
        .bubble { position: absolute; border-radius: 50%; pointer-events: none; }
        .b1 { animation: bFloat1  9s    ease-in-out infinite,         bPulse  9s    ease-in-out infinite; }
        .b2 { animation: bFloat2  12s   ease-in-out infinite,         bPulse  12s   ease-in-out infinite 1s; }
        .b3 { animation: bFloat3  7.5s  ease-in-out infinite,         bPulse  7.5s  ease-in-out infinite .5s; }
        .b4 { animation: bFloat4  10.5s ease-in-out infinite,         bPulse  10.5s ease-in-out infinite 2s; }
        .b5 { animation: bFloat1  14s   ease-in-out infinite reverse, bPulse  14s   ease-in-out infinite 3s; }
        .b6 { animation: bFloat3  11s   ease-in-out infinite reverse, bPulse  11s   ease-in-out infinite 1.5s; }

        /* ════════════════════════════════════
           POSTER GRID
        ════════════════════════════════════ */
        .poster-card {
          position: relative; overflow: hidden; border-radius: 14px;
          background: #fff; border: 1.5px solid #e5e7eb;
          box-shadow: 0 4px 14px rgba(0,0,0,0.07);
          transition: transform 0.35s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.35s, border-color 0.3s;
          cursor: pointer;
        }
        .poster-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 24px 48px rgba(153,27,27,0.15);
          border-color: rgba(153,27,27,0.45);
        }
        .poster-card img {
          width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block;
          transition: transform 0.5s;
        }
        .poster-card:hover img { transform: scale(1.04); }
        .poster-overlay {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 18px 16px;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          transform: translateY(100%); transition: transform 0.35s ease;
        }
        .poster-card:hover .poster-overlay { transform: translateY(0); }
        .poster-zoom-badge {
          position: absolute; top: 10px; right: 10px;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.92); color: #991b1b;
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(0.6);
          transition: opacity 0.3s, transform 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .poster-card:hover .poster-zoom-badge { opacity: 1; transform: scale(1); }

        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .poster-skeleton {
          width: 100%; aspect-ratio: 2/3; border-radius: 14px;
          background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);
          background-size: 200% 100%; animation: shimmer 1.5s infinite;
        }

        /* ════════════════════════════════════
           LIGHTBOX — fullscreen total, navbar hidden
        ════════════════════════════════════ */
        .lb-backdrop {
          position: fixed; inset: 0;
          /* z-index sangat tinggi agar di atas semua elemen termasuk navbar */
          z-index: 99999;
          background: rgba(0,0,0,0.95);
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          animation: lbFadeIn 0.22s ease;
        }
        @keyframes lbFadeIn { from{opacity:0} to{opacity:1} }

        .lb-inner {
          position: relative;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          width: 100%; height: 100%;
          padding: 60px 16px 40px;
          gap: 12px;
          animation: lbZoomIn 0.28s cubic-bezier(0.34,1.4,0.64,1);
        }
        @keyframes lbZoomIn { from{transform:scale(0.88);opacity:0} to{transform:scale(1);opacity:1} }

        /* gambar mengisi layar semaksimal mungkin */
        .lb-img {
          max-width: 100%;
          max-height: calc(100vh - 120px);
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          display: block;
        }

        .lb-title {
          color: rgba(255,255,255,0.88);
          font-weight: 700; font-size: 15px;
          text-align: center; max-width: 600px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.6);
          padding: 0 16px;
        }

        /* Tombol X — pojok kanan atas, besar & jelas */
        .lb-close-btn {
          position: fixed; top: 16px; right: 16px;
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 2px solid rgba(255,255,255,0.4);
          color: white; font-size: 22px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, transform 0.25s, border-color 0.2s;
          backdrop-filter: blur(6px);
          z-index: 100000;
          line-height: 1;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .lb-close-btn:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: scale(1.1) rotate(90deg);
        }

        .lb-hint {
          position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
          color: rgba(255,255,255,0.35); font-size: 12px;
          pointer-events: none; white-space: nowrap; z-index: 100000;
        }
      `}</style>

      {/* ════════════════════════════════════════════════════════
          HEADER — ASLI 100% + bubble animasi (TANPA GAMBAR)
      ════════════════════════════════════════════════════════ */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div className="bubble b1" style={{ top:'-60px', right:'-60px', width:'280px', height:'280px', background:'rgba(255,255,255,0.05)' }} />
          <div className="bubble b2" style={{ bottom:'-40px', left:'-40px', width:'200px', height:'200px', background:'rgba(255,255,255,0.04)' }} />
          <div className="bubble b3" style={{ top:'18%', left:'7%',    width:'90px',  height:'90px',  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)' }} />
          <div className="bubble b4" style={{ top:'12%', right:'20%',  width:'65px',  height:'65px',  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }} />
          <div className="bubble b5" style={{ bottom:'10%', left:'28%',width:'50px',  height:'50px',  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.09)' }} />
          <div className="bubble b6" style={{ bottom:'18%', right:'8%',width:'38px',  height:'38px',  background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.10)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:'14px' }}>
            <span className="green-dot" />
            Tentang Kami
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Tentang Aplikasi Rute Suro</h1>
          <p className="text-lg text-red-100">Solusi teknologi untuk mendukung kelancaran tradisi budaya di Ponorogo</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          POSTER INFOGRAFIS
      ════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-14 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'12px' }}>
              <span className="green-dot" />
              Infografis
            </div>
            <h2 style={{ fontSize:'clamp(20px,3vw,30px)', fontWeight:800, color:'#111827', letterSpacing:'-0.3px' }}>
              Poster &amp; Panduan Visual
            </h2>
            <p style={{ color:'#6b7280', marginTop:'6px', fontSize:'14px' }}>Klik poster untuk melihat lebih jelas</p>
          </div>

          {posterLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="poster-skeleton" />)}
            </div>
          ) : posters.length === 0 ? (
            <div className="t-card text-center" style={{ padding:'56px 32px' }}>
              <svg className="mx-auto mb-4 w-14 h-14" fill="none" stroke="#d1d5db" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p style={{ color:'#9ca3af', fontWeight:600, fontSize:'15px' }}>Belum ada poster tersedia</p>
              <p style={{ color:'#d1d5db', fontSize:'13px', marginTop:'4px' }}>Admin dapat menambahkan poster melalui dashboard</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posters.map(poster => (
                <div
                  key={poster.id}
                  className="poster-card"
                  onClick={() => openLightbox(poster)}
                  title={`Klik untuk memperbesar: ${poster.title}`}
                >
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    loading="lazy"
                    onError={e => { e.target.src = 'https://placehold.co/400x600/f9fafb/9ca3af?text=Poster' }}
                  />
                  <div className="poster-zoom-badge">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0zm-6-3v6m-3-3h6"/>
                    </svg>
                  </div>
                  <div className="poster-overlay">
                    <p style={{ color:'white', fontWeight:700, fontSize:'15px', margin:0 }}>{poster.title}</p>
                    {poster.description && (
                      <p style={{ color:'rgba(255,255,255,0.78)', fontSize:'13px', margin:'5px 0 0', lineHeight:1.5 }}>
                        {poster.description.substring(0,80)}{poster.description.length > 80 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LIGHTBOX — fullscreen, navbar disembunyikan via JS
      ════════════════════════════════════════════════════════ */}
      {lightboxImg && (
        <>
          <div className="lb-backdrop" onClick={closeLightbox}>
            <div className="lb-inner" onClick={e => e.stopPropagation()}>
              <img
                className="lb-img"
                src={lightboxImg.image_url}
                alt={lightboxImg.title}
                onError={e => { e.target.src = 'https://placehold.co/400x600/f9fafb/9ca3af?text=Poster' }}
              />
              {lightboxImg.title && (
                <p className="lb-title">{lightboxImg.title}</p>
              )}
            </div>
          </div>

          {/* Tombol X fixed — selalu di atas segalanya */}
          <button className="lb-close-btn" onClick={closeLightbox} aria-label="Tutup">
            ✕
          </button>

          <div className="lb-hint">Tekan ESC atau klik latar belakang untuk menutup</div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          CONTENT ASLI — Cara Kerja + Fitur Unggulan + Teknologi
      ════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-500 text-lg">Memuat data...</p></div>
          ) : error ? (
            <div className="t-card mb-8" style={{ padding:'28px', background:'#fef2f2', borderColor:'#fecaca' }}>
              <p style={{ color:'#991b1b', fontWeight:600, textAlign:'center' }}>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* main — steps from CMS */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                <div style={{ textAlign:'left', marginBottom:'8px' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'12px' }}>
                    <span className="green-dot" />
                    Cara Kerja
                  </div>
                  <h2 style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:800, color:'#111827', letterSpacing:'-0.3px' }}>
                    Bagaimana Sistem Bekerja
                  </h2>
                </div>

                {tentangItems.length === 0 ? (
                  <div className="t-card text-center" style={{ padding:'48px 32px' }}>
                    <p style={{ color:'#6b7280' }}>Belum ada konten tentang</p>
                  </div>
                ) : (
                  tentangItems.map((step, idx) => (
                    <div key={step.id} className="t-card" style={{ padding:'26px 26px 26px 80px' }}>
                      <div className="num-badge" style={{ left:'20px', top:'22px', width:'42px', height:'42px', borderRadius:'11px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'white', fontWeight:900, fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 5px 14px rgba(153,27,27,0.28)', animationDelay:`${idx * 0.3}s` }}>
                        {idx + 1}
                      </div>
                      <div style={{ position:'relative', zIndex:1 }}>
                        <h3 style={{ fontSize:'17px', fontWeight:800, color:'#111827', marginBottom:'7px' }}>{step.title}</h3>
                        <p style={{ color:'#6b7280', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{step.description}</p>
                      </div>
                    </div>
                  ))
                )}

                {tentangItems.length > 0 && (
                  <div className="t-card" style={{ padding:'22px', borderLeft:'3px solid #3b82f6', borderRadius:'0 14px 14px 0' }}>
                    <div style={{ position:'relative', zIndex:1 }}>
                      <h3 style={{ fontSize:'15px', fontWeight:700, color:'#111827', marginBottom:'8px' }}>Informasi Tambahan</h3>
                      <p style={{ color:'#6b7280', lineHeight:1.7, fontSize:'14px' }}>
                        Aplikasi Rute Suro dirancang khusus untuk memudahkan pengunjung Grebeg Suro menemukan rute terbaik dengan teknologi navigasi terkini.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* sidebar */}
              <div className="flex flex-col gap-6">
                {/* fitur unggulan */}
                <div className="t-card" style={{ padding:'26px' }}>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <h3 style={{ fontSize:'17px', fontWeight:800, color:'#111827', marginBottom:'18px' }}>Fitur Unggulan</h3>
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      {[
                        { title:'Algoritma A*',      desc:'Rute tercepat dengan akurasi tinggi' },
                        { title:'Peta Interaktif',   desc:'Visualisasi real-time intuitif' },
                        { title:'Real-time Traffic', desc:'Info lalu lintas langsung' },
                        { title:'Event Integration', desc:'Terintegrasi jadwal Grebeg Suro' },
                        { title:'Admin Panel',       desc:'Manajemen event & rekayasa lalu lintas' }
                      ].map((f, i) => (
                        <div key={i} className="feat-row-item">
                          <div style={{ width:32, height:32, borderRadius:'8px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'13px', flexShrink:0 }}>
                            {i + 1}
                          </div>
                          <div>
                            <p style={{ fontWeight:700, color:'#111827', fontSize:'14px', marginBottom:'1px' }}>{f.title}</p>
                            <p style={{ fontSize:'12px', color:'#9ca3af' }}>{f.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* teknologi */}
                <div className="t-card" style={{ padding:'26px' }}>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <h3 style={{ fontSize:'17px', fontWeight:800, color:'#111827', marginBottom:'14px' }}>Teknologi</h3>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                      {['React','Leaflet','A* Algorithm','OpenStreetMap','Real-time Data','Supabase'].map(t => (
                        <span key={t} className="tech-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ── CTA BOTTOM — ASLI ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div className="bubble b1" style={{ top:'-40px', right:'-40px', width:'200px', height:'200px', background:'rgba(255,255,255,0.05)' }} />
          <div className="bubble b2" style={{ bottom:'-30px', left:'-30px', width:'160px', height:'160px', background:'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Siap untuk Memulai?</h2>
          <p className="text-red-100 mb-7 text-base sm:text-lg">Temukan rute terbaik untuk perjalanan Anda</p>
          <Link
            to="/map"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 34px', border:'2px solid white', color:'#991b1b', fontWeight:700, fontSize:'15px', borderRadius:'6px', background:'white', textDecoration:'none', transition:'background 0.2s, transform 0.2s, box-shadow 0.2s' }}
            onMouseOver={e=>{ e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.18)'; }}
            onMouseOut={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
          >
            Mulai Navigasi
          </Link>
        </div>
      </section>
    </div>
  )
}