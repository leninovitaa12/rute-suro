const destinations = [
  {
    img: '/images/grebeg-suro-1.jpg',
    badge: 'PUSAT BUDAYA',
    badgeColor: 'bg-green-700',
    title: 'Alun-alun Ponorogo',
    desc: 'Jantung kota dan arena utama pagelaran Reog Ponorogo setiap malam satu Suro.',
    large: true,
  },
  {
    img: '/images/grebeg-suro-2.jpg',
    title: 'Makam Betoro Katong',
    large: false,
  },
  {
    img: '/images/grebeg-suro-3.jpg',
    title: 'Telaga Ngebel',
    large: false,
  },
]

export default function DestinationSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-1.5 bg-green-700 rounded-full" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#922626]">Spiritual Landmarks</span>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Destinasi Sakral</h2>
          </div>
          <p className="text-gray-400 max-w-xs text-sm italic">
            Menjelajahi titik-titik energi dan sejarah yang membentuk identitas kultural Ponorogo.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: '20px', height: '480px' }}>
          {/* Large card */}
          <div style={{ gridRow: '1 / 3', position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#1a1a2e' }} className="group shadow-md">
            <img src={destinations[0].img} alt={destinations[0].title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-700" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px' }}>
              <span style={{ background: '#15803d', color: 'white', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', width: 'fit-content', marginBottom: '10px' }}>PUSAT BUDAYA</span>
              <h4 style={{ color: 'white', fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{destinations[0].title}</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '360px' }}>{destinations[0].desc}</p>
            </div>
          </div>

          {/* Small card 1 */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#2d1b1b' }} className="group shadow-md">
            <img src={destinations[1].img} alt={destinations[1].title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-700" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }}>
              <h4 style={{ color: 'white', fontSize: '17px', fontWeight: 700 }}>{destinations[1].title}</h4>
            </div>
          </div>

          {/* Small card 2 */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#1b2d2d' }} className="group shadow-md">
            <img src={destinations[2].img} alt={destinations[2].title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              className="group-hover:scale-105 transition-transform duration-700" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px' }}>
              <h4 style={{ color: 'white', fontSize: '17px', fontWeight: 700 }}>{destinations[2].title}</h4>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}