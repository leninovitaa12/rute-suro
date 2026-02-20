// src/components/CTASection.jsx
// ✅ UI upgrade — fungsi tidak berubah

import { Link } from 'react-router-dom'

export default function CTASection() {
  const steps = [
    { number: '1', title: 'Pilih Lokasi', description: 'Tentukan titik awal dan tujuan Anda di peta interaktif atau pilih dari daftar acara.' },
    { number: '2', title: 'Pilih Metode', description: 'Pilih preferensi transportasi: jalan kaki, motor, mobil, atau transportasi umum.' },
    { number: '3', title: 'Cari Rute Optimal', description: 'Algoritma A* menganalisis dan menentukan rute terbaik dengan mempertimbangkan jarak dan waktu.' }
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">

      {/* ── bubble background ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-120px', right:'-100px', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.06) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'-90px', left:'-70px', width:'380px', height:'380px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.05) 0%, transparent 70%)' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(153,27,27,0.03) 0%, transparent 70%)' }} />
        {/* ring accents */}
        <div style={{ position:'absolute', top:'10%', left:'5%', width:'160px', height:'160px', borderRadius:'50%', border:'1.5px solid rgba(153,27,27,0.08)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'6%', width:'100px', height:'100px', borderRadius:'50%', border:'1.5px solid rgba(153,27,27,0.08)' }} />
        <div style={{ position:'absolute', top:'35%', right:'12%', width:'60px', height:'60px', borderRadius:'50%', background:'rgba(153,27,27,0.04)' }} />
        <div style={{ position:'absolute', bottom:'30%', left:'12%', width:'40px', height:'40px', borderRadius:'50%', background:'rgba(153,27,27,0.05)' }} />
        {/* dot grid */}
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle, rgba(153,27,27,0.07) 1px, transparent 1px)',
          backgroundSize:'32px 32px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
        }} />
      </div>

      <style>{`
        @keyframes ctaFadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes numPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(153,27,27,0.3); }
          50%      { box-shadow:0 0 0 10px rgba(153,27,27,0); }
        }
        @keyframes iconFloat {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-3px) scale(1.05); }
        }

        /* ── card: sama persis dengan FeaturesSection ── */
        .cta-card {
          position:relative; overflow:hidden;
          background:#fff;
          border:1.5px solid #e5e7eb;
          border-radius:14px;
          padding:36px 32px 32px 80px;
          transition:border-color 0.35s ease, transform 0.35s cubic-bezier(0.34,1.36,0.64,1), box-shadow 0.35s ease;
          cursor:default;
        }
        .cta-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#991b1b,#dc2626,#f87171);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
          border-radius:14px 14px 0 0;
        }
        .cta-card::after {
          content:'';
          position:absolute; bottom:0; right:0;
          width:120px; height:120px; border-radius:50%;
          background:radial-gradient(circle, rgba(153,27,27,0.06) 0%, transparent 70%);
          transition:transform 0.4s ease, opacity 0.4s ease;
          transform:translate(40px,40px); opacity:0;
        }
        .cta-card:hover { border-color:#991b1b; transform:translateY(-8px); box-shadow:0 24px 48px rgba(153,27,27,0.13); }
        .cta-card:hover::before { transform:scaleX(1); }
        .cta-card:hover::after  { transform:translate(20px,20px); opacity:1; }
        .cta-card:hover .cta-num-badge { animation:iconFloat 1.4s ease-in-out infinite; }

        .cta-num-badge {
          position:absolute; left:24px; top:32px;
          width:44px; height:44px; border-radius:12px;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          color:white; font-weight:900; font-size:20px;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 8px 20px rgba(153,27,27,0.30);
          animation:numPulse 3s ease-in-out infinite;
        }

        /* ── BUTTON: selaras dengan Admin Login di navbar ── */
        .btn-outline-red {
          display:inline-flex; align-items:center; gap:10px;
          padding:14px 36px;
          border:2px solid #991b1b;
          color:#991b1b; font-weight:700; font-size:15px;
          border-radius:6px; text-decoration:none;
          background:transparent;
          position:relative; overflow:hidden;
          transition:color 0.3s ease, border-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        }
        .btn-outline-red::before {
          content:'';
          position:absolute; inset:0;
          background:linear-gradient(135deg,#991b1b,#dc2626);
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1);
          z-index:0;
        }
        .btn-outline-red:hover::before { transform:scaleX(1); }
        .btn-outline-red:hover { color:white; border-color:#991b1b; transform:translateY(-2px); box-shadow:0 10px 28px rgba(153,27,27,0.28); }
        .btn-outline-red span, .btn-outline-red svg { position:relative; z-index:1; }
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
            Cara Menggunakan
          </div>
          <h2 style={{ fontSize:'clamp(26px,4vw,38px)', fontWeight:800, color:'#111827', marginBottom:'12px', letterSpacing:'-0.5px' }}>
            Siap Menjelajahi Ponorogo?
          </h2>
          <p style={{ fontSize:'17px', color:'#6b7280', lineHeight:1.7 }}>
            Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
          </p>
        </div>

        {/* step cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'24px', marginBottom:'52px' }}>
          {steps.map((step, idx) => (
            <div key={idx} className="cta-card" style={{ animationDelay:`${idx * 0.1}s` }}>
              <div className="cta-num-badge" style={{ animationDelay:`${idx * 0.3}s` }}>
                {step.number}
              </div>
              <div style={{ fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', color:'#991b1b', fontWeight:700, marginBottom:'6px', opacity:0.75 }}>
                Langkah {step.number}
              </div>
              <h3 style={{ fontSize:'19px', fontWeight:800, color:'#111827', marginBottom:'10px' }}>{step.title}</h3>
              <p style={{ color:'#6b7280', lineHeight:1.75, fontSize:'15px' }}>{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{ textAlign:'center' }}>
          <Link to="/map" className="btn-outline-red">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ position:'relative', zIndex:1 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
            </svg>
            <span>Buka Peta Interaktif</span>
          </Link>
        </div>

      </div>
    </section>
  )
}