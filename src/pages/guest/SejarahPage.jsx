// src/pages/guest/SejarahPage.jsx
// ✅ UI upgrade — fungsi tidak berubah

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getSejarah } from "../../lib/backendApi"

export default function SejarahPage() {
  const [sejarahItems, setSejarahItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { loadSejarah() }, [])

  const loadSejarah = async () => {
    try {
      setLoading(true)
      const data = await getSejarah()
      setSejarahItems(data)
    } catch (err) {
      console.error('[v0] Error loading sejarah:', err)
      setError('Gagal memuat data sejarah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .s-card {
          position:relative; overflow:hidden;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:14px;
          transition:border-color 0.35s ease, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s ease;
        }
        .s-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); border-radius:14px 14px 0 0;
        }
        .s-card:hover { border-color:#991b1b; transform:translateY(-6px); box-shadow:0 20px 44px rgba(153,27,27,0.12); }
        .s-card:hover::before { transform:scaleX(1); }

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

        @keyframes timelineDot {
          0%,100% { box-shadow:0 0 0 0 rgba(153,27,27,0.35); }
          50%      { box-shadow:0 0 0 8px rgba(153,27,27,0); }
        }
        .tl-dot { animation: timelineDot 3s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', top:'30%', left:'15%', width:'70px', height:'70px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:'14px' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fca5a5', display:'inline-block' }} />
            Warisan Budaya
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Sejarah & Tradisi Event</h1>
          <p className="text-xl text-red-100">Menyelami lebih dalam tradisi dan warisan budaya Grebeg Suro yang kaya akan makna dan sejarah</p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-12 sm:py-16 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-80px', right:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-60px', left:'-50px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', top:'40%', right:'8%', width:'90px', height:'90px', borderRadius:'50%', border:'1.5px solid rgba(153,27,27,0.07)' }} />
          <div style={{ position:'absolute', bottom:'25%', left:'6%', width:'55px', height:'55px', borderRadius:'50%', background:'rgba(153,27,27,0.04)' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(153,27,27,0.06) 1px, transparent 1px)', backgroundSize:'32px 32px', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          {loading ? (
            <div className="text-center py-12"><p className="text-gray-600 text-lg">Memuat data sejarah...</p></div>
          ) : error ? (
            <div className="s-card" style={{ padding:'32px', marginBottom:'48px', background:'#fef2f2', borderColor:'#fecaca' }}>
              <p style={{ color:'#991b1b', fontWeight:600, textAlign:'center' }}>{error}</p>
            </div>
          ) : sejarahItems.length === 0 ? (
            <div className="s-card text-center" style={{ padding:'48px', marginBottom:'48px' }}>
              <p style={{ color:'#6b7280' }}>Belum ada konten sejarah</p>
            </div>
          ) : (
            <div style={{ marginBottom:'64px' }}>
              {sejarahItems.map((item, idx) => idx === 0 && (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'32px', marginBottom:'64px' }}>
                  <div style={{ background:'linear-gradient(135deg,#7f1d1d,#991b1b)', borderRadius:'14px', minHeight:'240px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', boxShadow:'0 20px 48px rgba(153,27,27,0.25)' }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:'64px', fontWeight:900, opacity:0.2, marginBottom:'8px' }}>KP</div>
                      <p style={{ fontWeight:700, fontSize:'17px' }}>{item.title}</p>
                    </div>
                  </div>
                  <div>
                    <h2 style={{ fontSize:'28px', fontWeight:800, color:'#111827', marginBottom:'16px', letterSpacing:'-0.5px' }}>{item.title}</h2>
                    <p style={{ color:'#6b7280', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          {!loading && !error && sejarahItems.length > 0 && (
            <div style={{ marginBottom:'64px' }}>
              <div style={{ textAlign:'center', marginBottom:'48px' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'14px' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#991b1b', display:'inline-block' }} />
                  Arsip
                </div>
                <h2 style={{ fontSize:'clamp(24px,4vw,34px)', fontWeight:800, color:'#111827', letterSpacing:'-0.5px' }}>Konten Sejarah</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
                {sejarahItems.map((item, idx) => (
                  <div key={item.id} className="s-card" style={{ padding:'28px 28px 28px 80px', position:'relative' }}>
                    <div className="tl-dot" style={{ position:'absolute', left:'24px', top:'28px', width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'white', fontWeight:900, fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 16px rgba(153,27,27,0.28)', animationDelay:`${idx * 0.4}s` }}>
                      {idx + 1}
                    </div>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'#111827', marginBottom:'8px' }}>{item.title}</h3>
                    <p style={{ color:'#6b7280', lineHeight:1.75, whiteSpace:'pre-wrap' }}>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quote */}
          {!loading && !error && sejarahItems.length > 0 && (
            <div className="s-card" style={{ background:'linear-gradient(135deg,#7f1d1d,#991b1b)', color:'white', padding:'48px', textAlign:'center', border:'none' }}>
              <div style={{ fontSize:'48px', opacity:0.3, lineHeight:1, marginBottom:'16px' }}>"</div>
              <p style={{ fontSize:'clamp(16px,2.5vw,22px)', fontWeight:600, lineHeight:1.7, marginBottom:'20px' }}>
                Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk menjaga warisan leluhur sambil melangkah maju ke masa depan.
              </p>
              <p style={{ color:'rgba(255,255,255,0.65)', fontWeight:600, fontSize:'14px', letterSpacing:'1px' }}>— Tokoh Budaya Ponorogo</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-gray-100 py-12 sm:py-16 border-t border-gray-200 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontSize:'clamp(22px,4vw,30px)', fontWeight:800, color:'#111827', marginBottom:'12px' }}>Ingin Melihat Jadwal Lengkap?</h2>
          <p style={{ color:'#6b7280', marginBottom:'28px', fontSize:'16px' }}>Temukan semua jadwal acara Grebeg Suro dan rencanakan kunjungan Anda</p>
          <Link to="/jadwal" className="btn-outline-red"><span>Lihat Jadwal Event</span></Link>
        </div>
      </section>
    </div>
  )
}