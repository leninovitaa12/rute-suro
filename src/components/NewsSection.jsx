const news = [
  {
    tag: 'FESTIVAL',
    tagColor: '#922626',
    img: '/images/grebeg-suro-1.jpg',
    title: 'Persiapan Grebeg Suro 2024: Jalur Khusus Prosesi Ditetapkan',
    desc: 'Pemerintah daerah bersama tim Rute Suro menetapkan 5 jalur utama untuk prosesi kirab pusaka.',
  },
  {
    tag: 'SYSTEM',
    tagColor: '#2d5a27',
    img: '/images/grebeg-suro-2.jpg',
    title: 'Update v2.1: Optimasi Heuristik Lebih Cepat 30%',
    desc: 'Pembaruan mesin kalkulasi rute memberikan hasil lebih instan bahkan di area dengan sinyal lemah.',
  },
  {
    tag: 'DESTINASI',
    tagColor: '#922626',
    img: '/images/grebeg-suro-3.jpg',
    title: 'Penambahan 15 Titik Situs Sejarah Baru di Area Ngebel',
    desc: 'Eksplorasi lebih dalam di kawasan pegunungan dengan rute trekking yang terverifikasi aman.',
  },
]

export default function NewsSection() {
  return (
    <section style={{ paddingTop: '96px', paddingBottom: '96px', background: '#f3efef' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>Berita Terkini</h2>
          <a href="#" style={{ color: '#922626', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Lihat Semua Berita →</a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '28px' }}>
          {news.map((n, i) => (
            <article key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition: 'box-shadow 0.3s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.08)'}>
              <div style={{ height: '200px', overflow: 'hidden', background: '#1a1a2e' }}>
                <img src={n.img} alt={n.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                  onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                  onMouseLeave={e => e.target.style.transform='scale(1)'} />
              </div>
              <div style={{ padding: '20px 24px 24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: n.tagColor, marginBottom: '10px' }}>{n.tag}</div>
                <h4 style={{ fontWeight: 700, fontSize: '15px', color: '#111827', lineHeight: 1.4, marginBottom: '10px' }}>{n.title}</h4>
                <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}