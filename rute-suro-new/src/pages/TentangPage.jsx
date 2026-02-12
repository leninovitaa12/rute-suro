import { useState } from 'react'

export default function TentangPage() {
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'Apa itu Grebeg Suro?',
      answer: 'Grebeg Suro adalah perayaan budaya tradisional Ponorogo yang dilaksanakan setiap tahun. Acara ini menampilkan berbagai atraksi budaya, parade, dan aktivitas tradisional yang meriah dan penuh makna.',
    },
    {
      id: 2,
      question: 'Kapan Grebeg Suro biasanya diadakan?',
      answer: 'Grebeg Suro biasanya diadakan pada bulan Muharram (bulan pertama dalam kalender Islam). Waktu yang tepat dapat berbeda setiap tahunnya sesuai dengan kalender Hijriah.',
    },
    {
      id: 3,
      question: 'Apa keuntungan menggunakan Rute Suro?',
      answer: 'Dengan Rute Suro, Anda dapat navigasi mudah, hemat waktu, hindari kemacetan, dan tidak akan tersesat selama event Grebeg Suro berlangsung.',
    },
    {
      id: 4,
      question: 'Apakah aplikasi ini gratis?',
      answer: 'Ya, Rute Suro adalah aplikasi gratis yang dapat diakses oleh siapa saja dan kapan saja tanpa biaya apapun.',
    },
    {
      id: 5,
      question: 'Bagaimana cara menghubungi dukungan pelanggan?',
      answer: 'Anda dapat menghubungi kami melalui halaman admin atau menggunakan formulir kontak yang tersedia di website kami.',
    },
  ]

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <main className="min-h-screen bg-white pt-12">
      <div className="container">
        {/* Header */}
        <section className="mb-16">
          <h1 className="text-5xl font-extrabold text-text-primary mb-6">
            Tentang Rute Suro
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">
            Rute Suro adalah solusi navigasi cerdas yang dirancang khusus untuk membantu pengunjung Grebeg Suro menemukan rute terbaik dan mengoptimalkan pengalaman mereka selama acara berlangsung.
          </p>
        </section>

        {/* Mission Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-text-primary mb-6">
              Misi Kami
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              Kami berkomitmen untuk memberikan pengalaman terbaik bagi setiap pengunjung Grebeg Suro dengan menyediakan sistem navigasi yang akurat, cepat, dan mudah digunakan.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Dengan teknologi terkini, kami membantu Anda menghemat waktu, menghindari kemacetan, dan menikmati setiap momen istimewa Grebeg Suro.
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg p-12 h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-text-primary font-semibold">Misi Kami</p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div className="bg-primary/10 rounded-lg p-12 h-80 flex items-center justify-center order-2 lg:order-1">
            <div className="text-center">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-text-primary font-semibold">Visi Kami</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold text-text-primary mb-6">
              Visi Kami
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              Menjadi platform navigasi terdepan untuk acara budaya di Indonesia yang menawarkan teknologi canggih dan layanan terbaik.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Kami ingin setiap pengunjung dapat menikmati Grebeg Suro tanpa khawatir tentang navigasi dan logistik perjalanan.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
            Tim Kami
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-secondary rounded-lg p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">👨‍💼</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Kepemimpinan
              </h3>
              <p className="text-text-secondary">
                Dipimpin oleh profesional berpengalaman di bidang teknologi dan pariwisata.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">👨‍💻</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Pengembang
              </h3>
              <p className="text-text-secondary">
                Tim developer berbakat yang terus berinovasi untuk memberikan fitur terbaik.
              </p>
            </div>
            <div className="bg-secondary rounded-lg p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-5xl mb-4">👨‍🤝‍👨</div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                Dukungan
              </h3>
              <p className="text-text-secondary">
                Tim support siap membantu Anda 24/7 dengan respons cepat dan profesional.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-text-primary text-center mb-12">
            FAQ (Pertanyaan Umum)
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-secondary hover:bg-gray-100 transition-colors duration-300"
                >
                  <h3 className="text-lg font-semibold text-text-primary text-left">
                    {faq.question}
                  </h3>
                  <span className={`text-xl transition-transform duration-300 ${
                    expandedFAQ === faq.id ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                {expandedFAQ === faq.id && (
                  <div className="px-6 py-4 bg-white border-t border-border">
                    <p className="text-text-secondary leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
