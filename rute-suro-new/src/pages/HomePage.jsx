import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                Navigasi Cerdas Grebeg Suro
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                Temukan rute tercepat dan terpendek menuju destinasi Grebeg Suro di Ponorogo dengan sistem navigasi terintegrasi kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/map" className="btn-primary text-center">
                  Mulai Navigasi
                </Link>
                <Link to="/tentang" className="btn-secondary text-center">
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center bg-white/10 rounded-lg p-12 h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-white/80">Peta Interaktif Grebeg Suro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-4xl font-extrabold text-center text-text-primary mb-16">
            Fitur Unggulan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Navigasi Real-time</h3>
              <p className="text-text-secondary leading-relaxed">
                Dapatkan petunjuk arah real-time dengan rute yang selalu diperbarui sesuai kondisi lalu lintas.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Optimasi Waktu</h3>
              <p className="text-text-secondary leading-relaxed">
                Hemat waktu perjalanan Anda dengan algoritma pencarian rute tercepat dan terpendek.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-text-primary mb-4">Responsive Design</h3>
              <p className="text-text-secondary leading-relaxed">
                Akses dari perangkat apa pun dengan desain yang responsif dan mudah digunakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Info Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-primary/10 rounded-lg p-12 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-text-primary font-semibold">Grebeg Suro Event</p>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="text-4xl font-extrabold text-text-primary">
                Tentang Grebeg Suro
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                Grebeg Suro adalah perayaan budaya tradisional Ponorogo yang meriah dan penuh makna. Setiap tahunnya, ribuan pengunjung datang untuk menyaksikan keindahan tradisi ini.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                Dengan aplikasi Rute Suro, Anda dapat menavigasi seluruh acara dengan mudah dan tidak akan ketinggalan momen-momen penting.
              </p>
              <Link to="/tentang" className="btn-primary w-fit">
                Selengkapnya tentang Grebeg Suro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container text-center">
          <h2 className="text-4xl font-extrabold mb-6">
            Siap Mulai Menjelajahi?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan emas untuk mengalami Grebeg Suro dengan cara yang baru dan lebih mudah.
          </p>
          <Link to="/map" className="btn-primary inline-block">
            Buka Peta Navigasi Sekarang
          </Link>
        </div>
      </section>
    </main>
  )
}
