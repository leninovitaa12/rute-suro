// src/components/FeaturesSection.jsx

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      ),
      title: 'Optimasi A*',
      description: 'Memanfaatkan data real-time dan algoritma A* untuk menentukan rute terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro dengan akurasi tinggi.'
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: 'Trafik Real-time',
      description: 'Integrasi data lalu lintas langsung dan pembaruan kondisi jalan secara real-time. Monitor kemacetan dan jalur alternatif untuk menghindari penundaan.'
    },
    {
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      title: 'Acara Budaya',
      description: 'Informasi jadwal dan lokasi lengkap acara Grebeg Suro, kirab pusaka, dan penampilan Reog. Tetap update dengan notifikasi acara terbaru.'
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <style>{`
        /* subtle dot grid bg */
        .feat-bg-dots {
          position:absolute; inset:0; pointer-events:none;
          background-image: radial-gradient(circle, rgba(153,27,27,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
        }

        /* ── card-hover-effect style ── */
        .feat-card {
          position: relative;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          padding: 32px 28px;
          cursor: default;
          overflow: hidden;
          transition:
            border-color 0.4s ease,
            transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1),
            box-shadow 0.4s ease;
        }

        /* animated gradient border sweep on hover */
        .feat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626, #f87171, transparent);
          transform: translateX(-100%);
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 14px 14px 0 0;
        }

        /* soft glow layer */
        .feat-card::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.07) 0%, transparent 65%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .feat-card:hover {
          border-color: rgba(153,27,27,0.4);
          transform: translateY(-6px);
          box-shadow: 0 20px 44px rgba(153,27,27,0.10), 0 4px 14px rgba(0,0,0,0.06);
        }
        .feat-card:hover::before { transform: translateX(100%); }
        .feat-card:hover::after  { opacity: 1; }

        /* icon */
        .feat-icon {
          width: 52px; height: 52px; border-radius: 12px;
          background: linear-gradient(135deg, #991b1b, #dc2626);
          color: white;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          box-shadow: 0 6px 18px rgba(153,27,27,0.25);
          transition: transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.4s ease;
          position: relative; z-index: 1;
        }
        .feat-card:hover .feat-icon {
          transform: translateY(-3px) scale(1.06);
          box-shadow: 0 10px 24px rgba(153,27,27,0.32);
        }
        .feat-card h3, .feat-card p { position: relative; z-index: 1; }

        /* green accent hint */
        .green-dot {
          display: inline-block;
          width: 6px; height: 6px; border-radius: 50%;
          background: #16a34a;
        }
      `}</style>

      {/* bg */}
      <div className="feat-bg-dots" />
      <div style={{ position:'absolute', top:'-80px', left:'-60px', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', right:'-50px', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">

        {/* heading */}
        <div className="text-center mb-12 max-w-xl mx-auto">
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'4px 14px', borderRadius:'999px', background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)', fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'14px' }}>
            <span className="green-dot" />
            Platform Navigasi
          </div>
          <h2 style={{ fontSize:'clamp(24px,4vw,36px)', fontWeight:800, color:'#111827', letterSpacing:'-0.4px', marginBottom:'10px' }}>
            Fitur Utama
          </h2>
          <p style={{ fontSize:'16px', color:'#6b7280', lineHeight:1.7 }}>
            Solusi teknologi untuk mendukung kelancaran tradisi budaya di Ponorogo.
          </p>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3 style={{ fontSize:'18px', fontWeight:800, color:'#111827', marginBottom:'10px' }}>{f.title}</h3>
              <p style={{ color:'#6b7280', lineHeight:1.75, fontSize:'15px' }}>{f.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}