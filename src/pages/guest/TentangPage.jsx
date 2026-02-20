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
        .t-card {
          position:relative; overflow:hidden;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:14px;
          transition:border-color 0.35s ease, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s ease;
        }
        .t-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); border-radius:14px 14px 0 0;
        }
        .t-card:hover { border-color:#991b1b; transform:translateY(-6px); box-shadow:0 20px 44px rgba(153,27,27,0.12); }
        .t-card:hover::before { transform:scaleX(1); }

        .btn-outline-red {
          display:inline-flex; align-items:center; gap:8px;
          padding:12px 32px; border:2px solid #991b1b;
          color:#991b1b; font-weight:700; font-size:15px;
          border-radius:6px; text-decoration:none; background:transparent;
          position:relative; overflow:hidden;
          transition:color 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .btn-outline-red::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index:0;
        }
        .btn-outline-red:hover::before { transform:scaleX(1); }
        .btn-outline-red:hover { color:white; transform:translateY(-2px); box-shadow:0 8px 22px rgba(153,27,27,0.25); }
        .btn-outline-red span { position:relative; z-index:1; }

        @keyframes numFloat {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-3px); }
        }
        .num-badge { animation:numFloat 2.5s ease-in-out infinite; }

        .tech-tag {
          padding:6px 14px; background:rgba(153,27,27,0.07); color:#991b1b;
          font-size:13px; font-weight:700; border-radius:999px;
          border:1px solid rgba(153,27,27,0.15);
          transition:background 0.2s, transform 0.2s;
          cursor:default;
        }
        .tech-tag:hover { background:rgba(153,27,27,0.14); transform:translateY(-2px); }

        .faq-card {
          position:relative; overflow:hidden;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:14px;
          padding:28px;
          transition:border-color 0.35s, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s;
        }
        .faq-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); border-radius:14px 14px 0 0;
        }
        .faq-card:hover { border-color:#991b1b; transform:translateY(-6px); box-shadow:0 20px 44px rgba(153,27,27,0.11); }
        .faq-card:hover::before { transform:scaleX(1); }
      `}</style>

      {/* ── HEADER ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', top:'25%', left:'12%', width:'65px', height:'65px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position:'absolute', bottom:'20%', right:'10%', width:'45px', height:'45px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:'14px' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fca5a5', display:'inline-block' }} />
            Tentang Kami
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Tentang Aplikasi Rute Suro</h1>
          <p className="text-xl text-red-100">Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo</p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-80px', right:'-60px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-60px', left:'-50px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', top:'35%', right:'5%', width:'80px', height:'80px', borderRadius:'50%', border:'1.5px solid rgba(153,27,27,0.07)' }} />
          <div style={{ position:'absolute', bottom:'20%', left:'4%', width:'50px', height:'50px', borderRadius:'50%', background:'rgba(153,27,27,0.04)' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(153,27,27,0.06) 1px, transparent 1px)', backgroundSize:'32px 32px', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-600 text-lg">Memuat data tentang...</p></div>
          ) : error ? (
            <div className="t-card" style={{ padding:'32px', marginBottom:'48px', background:'#fef2f2', borderColor:'#fecaca' }}>
              <p style={{ color:'#991b1b', fontWeight:600, textAlign:'center' }}>{error}</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'32px' }}>

              {/* main content */}
              <div style={{ gridColumn:'span 2', minWidth:0 }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'20px' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#991b1b', display:'inline-block' }} />
                  Konten
                </div>
                <h2 style={{ fontSize:'clamp(22px,3.5vw,30px)', fontWeight:800, color:'#111827', marginBottom:'28px', letterSpacing:'-0.5px' }}>Konten Tentang Aplikasi</h2>

                {tentangItems.length === 0 ? (
                  <div className="t-card" style={{ padding:'32px', textAlign:'center' }}>
                    <p style={{ color:'#6b7280' }}>Belum ada konten tentang</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                    {tentangItems.map((step, idx) => (
                      <div key={step.id} className="t-card" style={{ padding:'28px 28px 28px 84px' }}>
                        <div className="num-badge" style={{ position:'absolute', left:'24px', top:'24px', width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'white', fontWeight:900, fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px rgba(153,27,27,0.28)', animationDelay:`${idx * 0.3}s` }}>
                          {tentangItems.indexOf(step) + 1}
                        </div>
                        <h3 style={{ fontSize:'18px', fontWeight:800, color:'#111827', marginBottom:'8px' }}>{step.title}</h3>
                        <p style={{ color:'#6b7280', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{step.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {tentangItems.length > 0 && (
                  <div className="t-card" style={{ padding:'24px', marginTop:'24px', borderLeft:'4px solid #3b82f6', borderRadius:'0 14px 14px 0' }}>
                    <h3 style={{ fontSize:'16px', fontWeight:700, color:'#111827', marginBottom:'10px' }}>Informasi Tambahan</h3>
                    <p style={{ color:'#6b7280', lineHeight:1.7 }}>
                      Aplikasi Rute Suro dirancang khusus untuk memudahkan pengunjung Grebeg Suro menemukan rute terbaik dengan teknologi navigasi terkini dan algoritma pencarian jalur yang efisien.
                    </p>
                  </div>
                )}
              </div>

              {/* sidebar */}
              <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
                {/* fitur unggulan */}
                <div className="t-card" style={{ padding:'28px' }}>
                  <h3 style={{ fontSize:'18px', fontWeight:800, color:'#111827', marginBottom:'20px' }}>Fitur Unggulan</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                    {[
                      { title:'Algoritma A*', desc:'Perhitungan rute tercepat dengan akurasi tinggi' },
                      { title:'Peta Interaktif', desc:'Visualisasi real-time dengan tampilan intuitif' },
                      { title:'Real-time Traffic', desc:'Informasi lalu lintas langsung dan akurat' },
                      { title:'Event Integration', desc:'Terintegrasi dengan jadwal Grebeg Suro' },
                      { title:'Admin Panel', desc:'Manajemen event dan rekayasa lalu lintas' }
                    ].map((f, i) => (
                      <div key={i} style={{ display:'flex', gap:'12px', padding:'12px 8px', borderBottom:'1px solid #f3f4f6', transition:'background 0.2s, transform 0.2s', borderRadius:'8px', cursor:'default' }}
                        onMouseOver={e=>{ e.currentTarget.style.background='#fafafa'; e.currentTarget.style.transform='translateX(4px)'; }}
                        onMouseOut={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='none'; }}>
                        <div style={{ width:34, height:34, borderRadius:'9px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'13px', flexShrink:0, boxShadow:'0 4px 10px rgba(153,27,27,0.22)' }}>{i + 1}</div>
                        <div>
                          <p style={{ fontWeight:700, color:'#111827', fontSize:'14px', marginBottom:'2px' }}>{f.title}</p>
                          <p style={{ fontSize:'12px', color:'#9ca3af' }}>{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* teknologi */}
                <div className="t-card" style={{ padding:'28px' }}>
                  <h3 style={{ fontSize:'18px', fontWeight:800, color:'#111827', marginBottom:'16px' }}>Teknologi</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {['React','Leaflet','A* Algorithm','OpenStreetMap','Real-time Data','Supabase'].map(t => (
                      <span key={t} className="tech-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-12 sm:py-16 border-t border-gray-200 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-40px', left:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-40px', right:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:'48px' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'14px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#991b1b', display:'inline-block' }} />
              FAQ
            </div>
            <h2 style={{ fontSize:'clamp(24px,4vw,34px)', fontWeight:800, color:'#111827', letterSpacing:'-0.5px' }}>Pertanyaan Umum</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px' }}>
            {[
              { q:'Apakah data rute akurat?', a:'Ya, sistem kami menggunakan data dari OpenStreetMap yang terus diperbarui dan dikombinasikan dengan algoritma A* untuk memberikan rute paling akurat dan efisien berdasarkan kondisi aktual.' },
              { q:'Seberapa akurat estimasi waktu perjalanan?', a:'Estimasi waktu dihitung berdasarkan jarak, kondisi jalan, dan data traffic real-time. Akurasi mencapai 85-90% tergantung kondisi lalu lintas yang dapat berubah sewaktu-waktu.' },
              { q:'Apakah sistem dapat menghindari jalan yang ditutup?', a:'Tentu! Sistem secara otomatis mendeteksi dan menghindari jalan yang ditutup akibat acara atau rekayasa lalu lintas. Admin dapat mengelola penutupan jalan melalui dashboard khusus.' },
              { q:'Bagaimana cara mengakses info jadwal acara?', a:'Anda dapat mengakses jadwal lengkap acara Grebeg Suro melalui menu "Jadwal" di navigasi atas. Informasi mencakup waktu, lokasi, dan detail setiap acara.' },
              { q:'Apakah bisa digunakan offline?', a:'Saat ini aplikasi memerlukan koneksi internet untuk mengakses data peta dan traffic real-time. Fitur offline sedang dalam pengembangan untuk versi mendatang.' },
              { q:'Siapa yang dapat mengakses Admin Panel?', a:'Admin Panel hanya dapat diakses oleh petugas berwenang dari Pemerintah Kabupaten Ponorogo yang memiliki kredensial login khusus untuk mengelola event dan rekayasa lalu lintas.' }
            ].map((item, i) => (
              <div key={i} className="faq-card">
                <h3 style={{ fontWeight:700, color:'#111827', marginBottom:'10px', fontSize:'15px' }}>{item.q}</h3>
                <p style={{ color:'#6b7280', lineHeight:1.75, fontSize:'14px' }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-30px', left:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ position:'relative', zIndex:1 }}>
          <h2 className="text-3xl font-bold mb-4">Siap untuk Memulai?</h2>
          <p className="text-red-100 mb-8 text-lg">Temukan rute terbaik untuk perjalanan Anda</p>
          <Link to="/map" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 36px', border:'2px solid white', color:'#991b1b', fontWeight:700, fontSize:'15px', borderRadius:'6px', background:'white', textDecoration:'none', transition:'background 0.2s, transform 0.2s, box-shadow 0.2s' }}
            onMouseOver={e=>{ e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.2)'; }}
            onMouseOut={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            Mulai Navigasi
          </Link>
        </div>
      </section>
    </div>
  )
}