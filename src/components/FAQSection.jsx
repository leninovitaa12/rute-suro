const faqs = [
  {
    q: 'Apa kelebihan algoritma A* dibanding navigasi biasa?',
    a: 'Algoritma A* menggunakan fungsi heuristik untuk memperkirakan biaya tersisa menuju tujuan, sehingga proses pencarian jalur jauh lebih efisien dan akurat dibandingkan algoritma Dijkstra standar atau navigasi umum yang tidak mempertimbangkan spesifik rute kultural.',
  },
  {
    q: 'Apakah aplikasi ini dapat digunakan offline?',
    a: 'Ya, rute yang telah dioptimasi dapat diunduh untuk penggunaan offline, memastikan kamu tetap bisa bernavigasi di area pegunungan yang minim sinyal seluler.',
  },
  {
    q: 'Apakah data kemacetan diupdate real-time?',
    a: 'Ya, kami bekerja sama dengan dinas perhubungan setempat untuk memberikan data kepadatan jalan, terutama selama event Grebeg Suro berlangsung.',
  },
]

const ChevronDown = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

export default function FAQSection() {
  return (
    <section style={{ padding: '96px 0', background: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 48px' }}>

        <h2 style={{ fontSize: '40px', fontWeight: 800, textAlign: 'center', color: '#0f172a', marginBottom: '48px', letterSpacing: '-0.5px' }}>
          Tanya Jawab (FAQ)
        </h2>

        <div>
          {faqs.map((f, i) => (
            <details key={i} className="group" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <summary style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px 0',
                cursor: 'pointer',
                listStyle: 'none',
                fontWeight: 700,
                fontSize: '18px',
                color: '#0f172a',
                gap: '16px',
              }}>
                <span>{f.q}</span>
                <span style={{ color: '#64748b', flexShrink: 0 }} className="transition-transform duration-300 group-open:rotate-180">
                  <ChevronDown />
                </span>
              </summary>
              <p style={{
                paddingBottom: '24px',
                color: '#64748b',
                lineHeight: 1.75,
                fontSize: '16px',
              }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>

      </div>
    </section>
  )
}