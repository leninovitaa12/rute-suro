// src/pages/guest/TentangPage.jsx
// ✅ UI upgrade — fungsi tidak berubah

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTentang } from '../../lib/backendApi'

export default function TentangPage() {
  const [tentangItems, setTentangItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadTentang() }, [])

  const loadTentang = async () => {
    try {
      setLoading(true)
      const data = await getTentang()
      setTentangItems(data)
    } catch (err) {
      console.error('[v0] Error loading tentang:', err)
      setError('Gagal memuat data tentang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* ── card-hover-effect style ── */
        .t-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          transition:
            border-color 0.4s ease,
            transform 0.4s cubic-bezier(0.34,1.4,0.64,1),
            box-shadow 0.4s ease;
        }
        .t-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
          border-radius: 14px 14px 0 0;
        }
        .t-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.05) 0%, transparent 65%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .t-card:hover {
          border-color: rgba(153,27,27,0.4);
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(153,27,27,0.10), 0 4px 14px rgba(0,0,0,0.05);
        }
        .t-card:hover::before { transform: translateX(100%); }
        .t-card:hover::after  { opacity: 1; }

        .faq-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          padding: 26px;
          transition:
            border-color 0.4s ease,
            transform 0.4s cubic-bezier(0.34,1.4,0.64,1),
            box-shadow 0.4s ease;
        }
        .faq-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .faq-card:hover {
          border-color: rgba(153,27,27,0.4);
          transform: translateY(-5px);
          box-shadow: 0 16px 36px rgba(153,27,27,0.09);
        }
        .faq-card:hover::before { transform: translateX(100%); }

        @keyframes numFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .num-badge {
          animation: numFloat 2.8s ease-in-out infinite;
          position: absolute; z-index: 1;
        }

        .tech-tag {
          padding: 5px 13px;
          background: rgba(153,27,27,0.07);
          color: #991b1b;
          font-size: 13px; font-weight: 700;
          border-radius: 999px;
          border: 1px solid rgba(153,27,27,0.15);
          transition: background 0.25s, transform 0.2s;
          cursor: default;
        }
        .tech-tag:hover { background: rgba(153,27,27,0.13); transform: translateY(-2px); }

        .feat-row-item {
          display: flex; gap: 12px; padding: 10px 8px;
          border-bottom: 1px solid #f3f4f6; border-radius: 8px;
          transition: background 0.2s, transform 0.2s;
          cursor: default;
          position: relative; z-index: 1;
        }
        .feat-row-item:hover { background: #fafafa; transform: translateX(4px); }

        .btn-outline-red {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 32px; border: 2px solid #991b1b;
          color: #991b1b; font-weight: 700; font-size: 15px;
          border-radius: 6px; text-decoration: none; background: transparent;
          position: relative; overflow: hidden;
          transition: color 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .btn-outline-red::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#991b1b,#dc2626);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index: 0;
        }
        .btn-outline-red:hover::before { transform: scaleX(1); }
        .btn-outline-red:hover { color: white; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(153,27,27,0.22); }
        .btn-outline-red span { position: relative; z-index: 1; }

        .green-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#16a34a; }
      `}</style>

      {/* ── HEADER ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
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

      {/* ── CONTENT ── */}
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
                  <div className="t-card" style={{ padding:'22px 22px 22px 22px', borderLeft:'3px solid #3b82f6', borderRadius:'0 14px 14px 0' }}>
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
                        { title:'Algoritma A*', desc:'Rute tercepat dengan akurasi tinggi' },
                        { title:'Peta Interaktif', desc:'Visualisasi real-time intuitif' },
                        { title:'Real-time Traffic', desc:'Info lalu lintas langsung' },
                        { title:'Event Integration', desc:'Terintegrasi jadwal Grebeg Suro' },
                        { title:'Admin Panel', desc:'Manajemen event & rekayasa lalu lintas' }
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

      {/* ── FAQ ── */}
      <section className="bg-white py-12 sm:py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign:'center', marginBottom:'44px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'12px' }}>
              <span className="green-dot" />
              FAQ
            </div>
            <h2 style={{ fontSize:'clamp(22px,3.5vw,32px)', fontWeight:800, color:'#111827', letterSpacing:'-0.3px' }}>Pertanyaan Umum</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { q:'Apakah data rute akurat?', a:'Ya, sistem kami menggunakan data dari OpenStreetMap yang terus diperbarui dan dikombinasikan dengan algoritma A* untuk memberikan rute paling akurat berdasarkan kondisi aktual.' },
              { q:'Seberapa akurat estimasi waktu?', a:'Estimasi waktu dihitung berdasarkan jarak, kondisi jalan, dan data traffic real-time. Akurasi mencapai 85–90% tergantung kondisi lalu lintas.' },
              { q:'Bisa menghindari jalan yang ditutup?', a:'Tentu! Sistem otomatis mendeteksi dan menghindari jalan yang ditutup. Admin dapat mengelola penutupan jalan melalui dashboard khusus.' },
              { q:'Bagaimana cara akses jadwal acara?', a:'Akses jadwal lengkap Grebeg Suro melalui menu "Jadwal" di navigasi atas. Mencakup waktu, lokasi, dan detail setiap acara.' },
              { q:'Apakah bisa digunakan offline?', a:'Saat ini memerlukan koneksi internet untuk data peta dan traffic real-time. Fitur offline sedang dalam pengembangan.' },
              { q:'Siapa yang dapat akses Admin Panel?', a:'Admin Panel hanya bisa diakses petugas berwenang dari Pemkab Ponorogo dengan kredensial login khusus.' }
            ].map((item, i) => (
              <div key={i} className="faq-card">
                <h3 style={{ fontWeight:700, color:'#111827', marginBottom:'8px', fontSize:'15px' }}>{item.q}</h3>
                <p style={{ color:'#6b7280', lineHeight:1.75, fontSize:'14px' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-30px', left:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
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