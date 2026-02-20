// src/pages/guest/JadwalPage.jsx
// ✅ UI upgrade — fungsi tidak berubah | Highlight section removed

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
        /* card-hover-effect style */
        .j-card {
          position: relative; overflow: hidden;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          transition:
            border-color 0.4s ease,
            transform 0.4s cubic-bezier(0.34,1.4,0.64,1),
            box-shadow 0.4s ease;
        }
        .j-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1);
          border-radius: 14px 14px 0 0;
        }
        .j-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.06) 0%, transparent 65%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .j-card:hover {
          border-color: rgba(153,27,27,0.4);
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(153,27,27,0.10), 0 4px 14px rgba(0,0,0,0.05);
        }
        .j-card:hover::before { transform: translateX(100%); }
        .j-card:hover::after  { opacity: 1; }

        /* filter btn */
        .filter-btn {
          padding: 9px 22px; border-radius: 6px; font-weight: 700; font-size: 14px;
          border: 1.5px solid #d1d5db; background: #fff; color: #374151;
          cursor: pointer; position: relative; overflow: hidden;
          transition: color 0.3s, border-color 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .filter-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #991b1b, #dc2626);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index: 0;
        }
        .filter-btn span { position: relative; z-index: 1; }
        .filter-btn.active { color: white; border-color: #991b1b; box-shadow: 0 4px 14px rgba(153,27,27,0.20); }
        .filter-btn.active::before { transform: scaleX(1); }
        .filter-btn:not(.active):hover { border-color: #991b1b; color: #991b1b; transform: translateY(-1px); }

        /* outline red button */
        .btn-outline-red {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 24px; border: 2px solid #991b1b;
          color: #991b1b; font-weight: 700; font-size: 14px;
          border-radius: 6px; text-decoration: none; background: transparent;
          position: relative; overflow: hidden; width: 100%;
          transition: color 0.3s, transform 0.2s, box-shadow 0.3s;
        }
        .btn-outline-red::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #991b1b, #dc2626);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.35s cubic-bezier(0.34,1.2,0.64,1); z-index: 0;
        }
        .btn-outline-red:hover::before { transform: scaleX(1); }
        .btn-outline-red:hover { color: white; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(153,27,27,0.22); }
        .btn-outline-red span { position: relative; z-index: 1; }

        .green-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:#16a34a; }

        /* jadwal hero bubbles */
        .jadwal-hero-bubbles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      `}</style>

      {/* ── HEADER ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="jadwal-hero-bubbles">
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
          <div style={{ position:'absolute', top:'20%', left:'20%', width:'80px', height:'80px', borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.1)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', fontWeight:700, marginBottom:'14px' }}>
            <span className="green-dot" />
            Jadwal Acara
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Jadwal Event Grebeg Suro</h1>
          <p className="text-lg text-red-100">Semua jadwal diperbarui oleh admin secara langsung.</p>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* filter */}
          <div className="flex flex-wrap gap-3 mb-10">
            {['all', 'upcoming', 'past'].map(f => (
              <button
                key={f}
                className={`filter-btn${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
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
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Memuat jadwal acara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="j-card text-center" style={{ padding:'64px 32px' }}>
              <div style={{ fontSize:'52px', marginBottom:'16px', opacity:0.35 }}>📋</div>
              <h3 style={{ fontSize:'20px', fontWeight:800, color:'#111827', marginBottom:'8px' }}>Belum Ada Event</h3>
              <p style={{ color:'#6b7280' }}>Saat ini belum ada jadwal event yang tersedia. Silakan cek kembali nanti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => {
                const startTime = event.start_time ? dayjs(event.start_time) : null
                const endTime   = event.end_time   ? dayjs(event.end_time)   : null
                const isUpcoming = startTime && startTime.isAfter(now)
                const isPast     = endTime   && endTime.isBefore(now)
                return (
                  <div key={event.id} className="j-card">
                    <div style={{ padding:'10px 16px', borderBottom:'1px solid #f3f4f6', background:'#fafafa', position:'relative', zIndex:1 }}>
                      {isPast     && <span style={{ padding:'3px 12px', background:'#6b7280', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>SELESAI</span>}
                      {isUpcoming && <span style={{ padding:'3px 12px', background:'#2563eb', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>AKAN DATANG</span>}
                      {!isPast && !isUpcoming && <span style={{ padding:'3px 12px', background:'#16a34a', color:'white', fontSize:'11px', fontWeight:700, borderRadius:'999px', letterSpacing:'1px' }}>BERLANGSUNG</span>}
                    </div>
                    <div style={{ padding:'24px', position:'relative', zIndex:1 }}>
                      <h3 style={{ fontSize:'17px', fontWeight:700, color:'#111827', marginBottom:'10px' }}>{event.name}</h3>
                      {event.description && (
                        <p style={{ color:'#6b7280', fontSize:'14px', marginBottom:'16px', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {event.description}
                        </p>
                      )}
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'20px' }}>
                        {startTime && (
                          <div style={{ fontSize:'13px' }}>
                            <p style={{ color:'#9ca3af', fontWeight:600, marginBottom:'2px' }}>Tanggal & Waktu</p>
                            <p style={{ color:'#111827', fontWeight:700 }}>{startTime.format('DD MMM YYYY, HH:mm')} WIB</p>
                            {endTime && <p style={{ color:'#6b7280', fontSize:'12px' }}>s/d {endTime.format('DD MMM YYYY, HH:mm')} WIB</p>}
                          </div>
                        )}
                        <div style={{ fontSize:'13px' }}>
                          <p style={{ color:'#9ca3af', fontWeight:600, marginBottom:'2px' }}>Lokasi</p>
                          <p style={{ color:'#111827', fontWeight:600, fontFamily:'monospace', fontSize:'12px' }}>
                            {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                          </p>
                        </div>
                      </div>
                      <Link to={`/map?eventId=${event.id}`} className="btn-outline-red">
                        <span>Lihat di Map</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-red-800 text-white py-12 sm:py-16 mt-4 relative overflow-hidden">
        <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />
          <div style={{ position:'absolute', bottom:'-30px', left:'-30px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Dampak pada Mobilitas Kota</h2>
          <p className="text-red-100 mb-8 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Selama acara Grebeg Suro berlangsung, beberapa ruas jalan akan ditutup atau dialihkan. Gunakan aplikasi Rute Suro untuk menemukan jalur alternatif dan menghindari kemacetan.
          </p>
          <Link
            to="/map"
            style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 34px', border:'2px solid white', color:'#991b1b', fontWeight:700, fontSize:'15px', borderRadius:'6px', background:'white', textDecoration:'none', transition:'background 0.2s, transform 0.2s, box-shadow 0.2s' }}
            onMouseOver={e=>{ e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 28px rgba(0,0,0,0.18)'; }}
            onMouseOut={e=>{ e.currentTarget.style.background='white'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
          >
            Cek Rute Alternatif
          </Link>
        </div>
      </section>
    </div>
  )
}