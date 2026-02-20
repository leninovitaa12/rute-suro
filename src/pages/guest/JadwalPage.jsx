// src/pages/guest/JadwalPage.jsx
// ✅ UI upgrade — fungsi tidak berubah

import React from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'
import dayjs from 'dayjs'

export default function JadwalPage() {
  const [events, setEvents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('all')

  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await api.get('/events')
        setEvents(res.data || [])
      } catch (error) {
        console.error('Error loading events:', error)
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  const now = dayjs()
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return event.start_time && dayjs(event.start_time).isAfter(now)
    if (filter === 'past') return event.end_time && dayjs(event.end_time).isBefore(now)
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* ── unified card ── */
        .j-card {
          position:relative; overflow:hidden;
          background:#fff; border:1.5px solid #e5e7eb; border-radius:14px;
          transition:border-color 0.35s ease, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s ease;
        }
        .j-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          border-radius:14px 14px 0 0;
        }
        .j-card:hover { border-color:#991b1b; transform:translateY(-6px); box-shadow:0 20px 44px rgba(153,27,27,0.12); }
        .j-card:hover::before { transform:scaleX(1); }

        /* ── filter button active ── */
        .filter-btn {
          padding:10px 24px; border-radius:6px; font-weight:700; font-size:14px;
          border:2px solid #d1d5db; background:#fff; color:#374151;
          cursor:pointer; position:relative; overflow:hidden;
          transition:color 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .filter-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index:0;
        }
        .filter-btn span { position:relative; z-index:1; }
        .filter-btn.active { color:white; border-color:#991b1b; box-shadow:0 6px 18px rgba(153,27,27,0.22); }
        .filter-btn.active::before { transform:scaleX(1); }
        .filter-btn:not(.active):hover { border-color:#991b1b; color:#991b1b; transform:translateY(-1px); }

        /* ── outline red button (sama dengan CTA) ── */
        .btn-outline-red {
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 28px; border:2px solid #991b1b;
          color:#991b1b; font-weight:700; font-size:14px;
          border-radius:6px; text-decoration:none; background:transparent;
          position:relative; overflow:hidden;
          transition:color 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.3s;
          width:100%; justify-content:center; text-align:center;
        }
        .btn-outline-red::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index:0;
        }
        .btn-outline-red:hover::before { transform:scaleX(1); }
        .btn-outline-red:hover { color:white; border-color:#991b1b; transform:translateY(-2px); box-shadow:0 8px 22px rgba(153,27,27,0.25); }
        .btn-outline-red span { position:relative; z-index:1; }

        /* ── solid red button ── */
        .btn-solid-red {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding:11px 28px; border:2px solid #991b1b;
          color:white; font-weight:700; font-size:14px;
          border-radius:6px; text-decoration:none;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          position:relative; overflow:hidden;
          transition:transform 0.2s, box-shadow 0.3s;
          width:100%; text-align:center;
        }
        .btn-solid-red::after {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          opacity:0; transition:opacity 0.3s;
        }
        .btn-solid-red:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(153,27,27,0.3); }
        .btn-solid-red:hover::after { opacity:1; }

        /* hero bubble bg */
        .jadwal-hero-bubbles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
      `}</style>

      {/* ── HEADER ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="jadwal-hero-bubbles">
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', top:'20%', left:'20%', width:'80px', height:'80px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
          <div style={{ position:'absolute', bottom:'15%', right:'15%', width:'50px', height:'50px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:'14px' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#fca5a5', display:'inline-block' }} />
            Grebeg Suro
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Jadwal Acara Grebeg Suro</h1>
          <p className="text-xl text-red-100">
            Temukan dan ikuti rangkaian acara lengkap Grebeg Suro yang penuh makna dan budaya
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-12 sm:py-16 relative overflow-hidden">
        {/* bubble bg */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-80px', right:'-60px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', bottom:'-60px', left:'-50px', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(153,27,27,0.06) 1px, transparent 1px)', backgroundSize:'32px 32px', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>

          {/* filter buttons */}
          <div style={{ display:'flex', gap:'12px', marginBottom:'32px', flexWrap:'wrap' }}>
            {['all', 'upcoming', 'past'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? ' active' : ''}`}>
                <span>
                  {f === 'all' && 'Semua Event'}
                  {f === 'upcoming' && 'Akan Datang'}
                  {f === 'past' && 'Selesai'}
                </span>
              </button>
            ))}
          </div>

          {/* events grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Memuat jadwal acara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="j-card text-center" style={{ padding:'64px 32px', marginBottom:'48px' }}>
              <div style={{ fontSize:'56px', marginBottom:'16px', opacity:0.4 }}>📋</div>
              <h3 style={{ fontSize:'22px', fontWeight:800, color:'#111827', marginBottom:'8px' }}>Belum Ada Event</h3>
              <p style={{ color:'#6b7280' }}>Saat ini belum ada jadwal event yang tersedia. Silakan cek kembali nanti atau hubungi admin.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'24px', marginBottom:'64px' }}>
              {filteredEvents.map(event => {
                const startTime = event.start_time ? dayjs(event.start_time) : null
                const endTime   = event.end_time   ? dayjs(event.end_time)   : null
                const isUpcoming = startTime && startTime.isAfter(now)
                const isPast     = endTime   && endTime.isBefore(now)
                return (
                  <div key={event.id} className="j-card">
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6', background:'#fafafa' }}>
                      {isPast     && <span style={{ padding:'3px 12px', background:'#6b7280', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>SELESAI</span>}
                      {isUpcoming && <span style={{ padding:'3px 12px', background:'#2563eb', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>AKAN DATANG</span>}
                      {!isPast && !isUpcoming && <span style={{ padding:'3px 12px', background:'#16a34a', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>BERLANGSUNG</span>}
                    </div>
                    <div style={{ padding:'24px' }}>
                      <h3 style={{ fontSize:'17px', fontWeight:700, color:'#111827', marginBottom:'10px' }}>{event.name}</h3>
                      {event.description && <p style={{ color:'#6b7280', fontSize:'14px', marginBottom:'16px', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{event.description}</p>}
                      <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                        {startTime && (
                          <div style={{ fontSize:'13px' }}>
                            <p style={{ color:'#9ca3af', fontWeight:600, marginBottom:'2px' }}>Tanggal & Waktu</p>
                            <p style={{ color:'#111827', fontWeight:700 }}>{startTime.format('DD MMM YYYY, HH:mm')} WIB</p>
                            {endTime && <p style={{ color:'#6b7280', fontSize:'12px' }}>s/d {endTime.format('DD MMM YYYY, HH:mm')} WIB</p>}
                          </div>
                        )}
                        <div style={{ fontSize:'13px' }}>
                          <p style={{ color:'#9ca3af', fontWeight:600, marginBottom:'2px' }}>Lokasi</p>
                          <p style={{ color:'#111827', fontWeight:600, fontFamily:'monospace', fontSize:'12px' }}>{event.lat.toFixed(5)}, {event.lng.toFixed(5)}</p>
                        </div>
                      </div>
                      <Link to={`/map?eventId=${event.id}`} className="btn-outline-red"><span>Lihat di Map</span></Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* main events */}
          <div>
            <div style={{ textAlign:'center', marginBottom:'48px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'14px' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#991b1b', display:'inline-block' }} />
                Highlight
              </div>
              <h2 style={{ fontSize:'clamp(24px,4vw,34px)', fontWeight:800, color:'#111827', letterSpacing:'-0.5px' }}>Acara Utama Grebeg Suro</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'24px' }}>
              {[
                { image:'https://images.unsplash.com/photo-1533461502511-0a882bc1fcc1?w=600&h=400&fit=crop', badge:'UNGGULAN', title:'Pertunjukan Reog Ponorogo', time:'08:00 - 12:00 WIB', location:'Alun-alun Ponorogo' },
                { image:'https://images.unsplash.com/photo-1514991642331-c93f5fabd185?w=600&h=400&fit=crop', badge:'UNGGULAN', title:'Festival Grebeg Suro', time:'19:00 - 22:00 WIB', location:'Panggung Utama' },
                { image:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', badge:'EVENT', title:'Kirab Pusaka', time:'13:00 - 16:00 WIB', location:'Kawasan Kota Lama' },
                { image:'https://images.unsplash.com/photo-1496024840928-4c417e47f168?w=600&h=400&fit=crop', badge:'EVENT', title:'Pasar Malam Ponorogo', time:'17:00 - 23:00 WIB', location:'Alun-alun Tengah' }
              ].map((event, i) => (
                <div key={i} className="j-card">
                  <div style={{ position:'relative', height:'180px', overflow:'hidden', borderRadius:'12px 12px 0 0' }}>
                    <img src={event.image} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                      onMouseOver={e => e.target.style.transform='scale(1.06)'}
                      onMouseOut={e => e.target.style.transform='scale(1)'} />
                    <div style={{ position:'absolute', top:'12px', right:'12px', padding:'3px 12px', background:event.badge==='UNGGULAN'?'#991b1b':'#374151', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>
                      {event.badge}
                    </div>
                  </div>
                  <div style={{ padding:'24px' }}>
                    <h3 style={{ fontSize:'17px', fontWeight:700, color:'#111827', marginBottom:'12px' }}>{event.title}</h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#374151' }}>
                        <span style={{ color:'#991b1b' }}>🕐</span>{event.time}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#374151' }}>
                        <span style={{ color:'#991b1b' }}>📍</span>{event.location}
                      </div>
                    </div>
                    <button className="btn-solid-red">Pilih Event sebagai Tujuan</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 mt-12 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-30px', left:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position:'relative', zIndex:1 }}>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Dampak pada Mobilitas Kota</h2>
            <p className="text-red-100 mb-8 text-lg max-w-3xl mx-auto leading-relaxed">
              Selama acara Grebeg Suro berlangsung, beberapa ruas jalan akan ditutup atau dialihkan. Gunakan aplikasi Rute Suro untuk menemukan jalur alternatif dan menghindari kemacetan.
            </p>
            <Link to="/map" style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'14px 36px', border:'2px solid white', color:'#991b1b', fontWeight:700, fontSize:'15px', borderRadius:'6px', background:'white', textDecoration:'none', transition:'background 0.2s, transform 0.2s, box-shadow 0.2s' }}
              onMouseOver={e=>{ e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.2)'; }}
              onMouseOut={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              Cek Rute Alternatif
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}