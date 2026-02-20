// src/components/FeaturesSection.jsx
// ✅ UI upgrade — fungsi tidak berubah

export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      ),
      title: 'Optimasi A*',
      description: 'Memanfaatkan data real-time dan algoritma A* untuk menentukan rute terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro dengan akurasi tinggi.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: 'Trafik Real-time',
      description: 'Integrasi data lalu lintas langsung dan pembaruan kondisi jalan secara real-time. Monitor kemacetan dan jalur alternatif untuk menghindari penundaan perjalanan.'
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ── bubble background ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        {/* large bubbles */}
        <div style={{ position:'absolute', top:'-100px', left:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,28,28,0.05) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-80px', right:'-60px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,28,28,0.05) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(185,28,28,0.03) 0%, transparent 70%)' }} />
        {/* small accent bubbles */}
        <div style={{ position:'absolute', top:'15%', right:'10%', width:'120px', height:'120px', borderRadius:'50%', border:'1.5px solid rgba(185,28,28,0.08)' }} />
        <div style={{ position:'absolute', bottom:'20%', left:'8%', width:'80px', height:'80px', borderRadius:'50%', border:'1.5px solid rgba(185,28,28,0.07)' }} />
        <div style={{ position:'absolute', top:'60%', right:'5%', width:'50px', height:'50px', borderRadius:'50%', background:'rgba(185,28,28,0.04)' }} />
        {/* dot grid */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle, rgba(185,28,28,0.07) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }} />
      </div>

      <style>{`
        @keyframes featFadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes iconFloat {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-4px); }
        }
        .feat-card {
          position:relative; overflow:hidden;
          background:#fff;
          border:1.5px solid #e5e7eb;
          border-radius:14px;
          padding:36px 32px;
          transition:border-color 0.35s ease, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s ease;
          cursor:default;
        }
        .feat-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          border-radius:14px 14px 0 0;
        }
        .feat-card::after {
          content:'';
          position:absolute; bottom:0; right:0;
          width:120px; height:120px; border-radius:50%;
          background:radial-gradient(circle, rgba(185,28,28,0.06) 0%, transparent 70%);
          transition:transform 0.4s ease, opacity 0.4s ease;
          transform:translate(40px,40px);
          opacity:0;
        }
        .feat-card:hover { border-color:#991b1b; transform:translateY(-8px); box-shadow:0 24px 48px rgba(185,28,28,0.13); }
        .feat-card:hover::before { transform:scaleX(1); }
        .feat-card:hover::after  { transform:translate(20px,20px); opacity:1; }
        .feat-card:hover .feat-icon { animation:iconFloat 1.4s ease-in-out infinite; }
        .feat-icon {
          display:inline-flex; align-items:center; justify-content:center;
          width:56px; height:56px; border-radius:14px;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          color:white; margin-bottom:20px;
          box-shadow:0 8px 20px rgba(185,28,28,0.28);
          transition:box-shadow 0.3s ease;
        }
        .feat-card:hover .feat-icon { box-shadow:0 12px 28px rgba(185,28,28,0.38); }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-6" style={{ position:'relative', zIndex:1 }}>

        {/* heading */}
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'8px',
            padding:'4px 14px', borderRadius:'999px',
            background:'rgba(153,27,27,0.07)', border:'1px solid rgba(153,27,27,0.15)',
            fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase',
            color:'#991b1b', fontWeight:700, marginBottom:'14px',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#991b1b', display:'inline-block' }} />
            Platform Navigasi
          </div>
          <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:800, color:'#111827', marginBottom:'12px', letterSpacing:'-0.5px' }}>
            Fitur Utama
          </h2>
          <p style={{ fontSize:'17px', color:'#6b7280', lineHeight:1.7 }}>
            Solusi teknologi untuk mendukung kelancaran tradisi budaya di Ponorogo.
          </p>
        </div>

        {/* cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'24px' }}>
          {features.map((f, idx) => (
            <div key={idx} className="feat-card" style={{ animationDelay:`${idx * 0.1}s` }}>
              <div className="feat-icon">{f.icon}</div>
              <h3 style={{ fontSize:'19px', fontWeight:800, color:'#111827', marginBottom:'10px' }}>{f.title}</h3>
              <p style={{ color:'#6b7280', lineHeight:1.75, fontSize:'15px' }}>{f.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}