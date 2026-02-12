export default function SejarahPage() {
  const timeline = [
    {
      year: 'Abad ke-14',
      title: 'Asal Mula Grebeg Suro',
      description: 'Grebeg Suro bermula dari tradisi menjamuiNabi Muhammad pada bulan Muharram. Tradisi ini diwujudkan dalam bentuk grebeg (perayaan meriah) di berbagai kerajaan di Jawa.',
      icon: '📜',
    },
    {
      year: '1800-an',
      title: 'Perkembangan Tradisi',
      description: 'Di era modern, Grebeg Suro berkembang menjadi perayaan budaya yang melibatkan seluruh masyarakat dengan atraksi seni, parade, dan kegiatan keagamaan.',
      icon: '🎭',
    },
    {
      year: '2000-an',
      title: 'Era Digital',
      description: 'Grebeg Suro mulai memanfaatkan teknologi modern untuk mempromosikan acara dan memudahkan pengunjung. Infrastruktur pariwisata terus ditingkatkan.',
      icon: '💻',
    },
    {
      year: 'Sekarang',
      title: 'Inovasi Rute Suro',
      description: 'Dengan peluncuran Rute Suro, pengunjung dapat menikmati Grebeg Suro dengan navigasi cerdas dan pengalaman yang lebih menyenangkan.',
      icon: '🚀',
    },
  ]

  return (
    <main className="min-h-screen bg-white pt-12">
      <div className="container">
        {/* Header */}
        <section className="mb-16">
          <h1 className="text-5xl font-extrabold text-text-primary mb-6">
            Sejarah Grebeg Suro
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">
            Grebeg Suro adalah perayaan budaya tradisional yang kaya makna dan memiliki sejarah panjang dalam budaya Jawa, khususnya di Ponorogo.
          </p>
        </section>

        {/* Introduction */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-6">
              Apa itu Grebeg Suro?
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              Grebeg Suro adalah tradisi syukuran yang dilakukan untuk menyambut Tahun Baru Islam (Awal Muharram). Kata "Grebeg" berarti perayaan atau keramaian, sedangkan "Suro" adalah nama lain untuk bulan Muharram.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Dalam perayaan ini, masyarakat berkumpul untuk melakukan berbagai kegiatan seperti berzikir, berdoa, dan menampilkan atraksi seni budaya tradisional Jawa.
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg p-12 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏛️</div>
              <p className="text-text-primary font-semibold">Tradisi Bersejarah</p>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
            Linimasa Perkembangan
          </h2>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className={`flex gap-8 items-start ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                <div className="hidden md:flex flex-col items-center flex-1">
                  <div className="text-4xl mb-4">{item.icon}</div>
                </div>
                <div className="flex-1">
                  <div className="bg-secondary rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="text-primary font-bold text-lg mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary mb-3">
                      {item.title}
                    </h3>
                    <p className="text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cultural Significance */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Makna Budaya
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-secondary rounded-lg p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                Nilai Spiritual
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Grebeg Suro memiliki makna spiritual yang mendalam sebagai bentuk syukur atas datangnya tahun baru Islam dan permohonan berkah untuk tahun yang akan datang.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8">
              <h3 className="text-2xl font-bold text-text-primary mb-4">
                Nilai Sosial
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Acara ini mempererat ikatan sosial antar masyarakat, mempromosikan toleransi, dan menjaga kelestarian budaya tradisional Jawa yang kaya.
              </p>
            </div>
          </div>
        </section>

        {/* Attractions */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-text-primary mb-8">
            Atraksi Utama Grebeg Suro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🐎', title: 'Parade Kuda', desc: 'Parade meriah dengan kuda-kuda yang dihias dengan perhiasan istimewa' },
              { icon: '🎪', title: 'Atraksi Seni', desc: 'Pertunjukan seni tradisional seperti tari topeng, wayang kulit, dan gambyus' },
              { icon: '🏮', title: 'Lampion Budaya', desc: 'Dekorasi berupa lampion yang menceritakan kisah-kisah budaya lokal' },
              { icon: '🎶', title: 'Musik Tradisional', desc: 'Orkestra dengan alat musik tradisional Jawa yang memukau' },
              { icon: '🍜', title: 'Kuliner Khas', desc: 'Berbagai makanan tradisional Ponorogo yang lezat dan autentik' },
              { icon: '🎭', title: 'Teater Rakyat', desc: 'Pertunjukan teater rakyat yang menghibur seluruh keluarga' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-border rounded-lg p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
