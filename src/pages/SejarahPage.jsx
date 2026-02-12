import React from "react"
import { Link } from 'react-router-dom'
import { FaMusic, FaLandmark, FaShoppingBag, FaHeart } from "react-icons/fa"

export default function SejarahPage() {
  return (
    <div className="page">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Sejarah & Tradisi Event</h1>
          <p className="text-lg text-white/95 leading-7">
            Menyelami lebih dalam tradisi dan warisan budaya Grebeg Suro yang kaya akan makna dan sejarah
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container">
          {/* Intro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-8 flex items-center justify-center min-h-64 border border-primary/20">
              <div className="text-center">
                <div className="text-6xl mb-4 opacity-50">
                  <FaMusic />
                </div>
                <p className="text-text-primary font-semibold">Prosesi Kirab Pusaka</p>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Apa itu Grebeg Suro?</h2>
              <p className="text-text-secondary leading-7 mb-4">
                Grebeg Suro adalah upacara tradisional yang dilaksanakan setiap bulan Suro
                (Muharram) di Ponorogo, Jawa Timur. Acara ini merupakan salah satu warisan
                budaya yang masih dilestarikan hingga saat ini dan menjadi identitas penting
                masyarakat Ponorogo.
              </p>
              <p className="text-text-secondary leading-7">
                Tradisi ini bermula dari masa Kerajaan Ponorogo dan terus diwariskan
                turun-temurun sebagai bentuk syukur, doa keselamatan, dan pelestarian
                nilai-nilai luhur budaya Jawa.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">Lini Masa Transformasi</h2>

            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <div className="w-1 h-20 bg-border mt-2"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Asal Usul Spiritual</h3>
                  <p className="text-text-secondary leading-6">
                    Berawal dari tradisi spiritual kerajaan untuk menghormati leluhur
                    dan memohon berkah di awal tahun Jawa. Upacara ini melibatkan
                    prosesi kirab pusaka dan sesaji sebagai simbol penghormatan.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <div className="w-1 h-20 bg-border mt-2"></div>
                </div>
                <div className="pb-8">
                  <h3 className="text-xl font-bold text-text-primary mb-2">Transformasi Publik (1980-an)</h3>
                  <p className="text-text-secondary leading-6">
                    Tradisi mulai membuka diri untuk umum dan menjadi festival budaya
                    yang melibatkan masyarakat luas. Integrasi dengan seni pertunjukan
                    Reog Ponorogo memperkaya acara ini.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Modernisasi & Adaptasi Digital</h3>
                  <p className="text-text-secondary leading-6">
                    Integrasi teknologi untuk memudahkan akses informasi dan navigasi
                    selama acara berlangsung. Penggunaan aplikasi seperti Rute Suro
                    membantu optimalisasi perjalanan pengunjung.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Budaya Grid */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 text-center">Elemen Budaya Utama</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-secondary p-6 rounded-2xl border border-border text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-5xl mb-4 text-primary">
                  <FaLandmark />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Kirab</h3>
                <p className="text-text-secondary text-sm leading-6">
                  Prosesi kirab pusaka keliling kota yang melibatkan ratusan peserta
                  dengan mengenakan busana adat.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-5xl mb-4 text-primary">
                  <FaMusic />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Reog</h3>
                <p className="text-text-secondary text-sm leading-6">
                  Seni tari tradisional khas Ponorogo yang menampilkan penari dengan
                  topeng barongan besar.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-5xl mb-4 text-primary">
                  <FaMusic />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Gamelan</h3>
                <p className="text-text-secondary text-sm leading-6">
                  Iringan musik gamelan tradisional yang mengiringi setiap prosesi.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-2xl border border-border text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                <div className="text-5xl mb-4 text-primary">
                  <FaShoppingBag />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-3">Festival Rakyat</h3>
                <p className="text-text-secondary text-sm leading-6">
                  Berbagai kegiatan festival seperti bazaar kuliner dan pameran kerajinan.
                </p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 text-center mb-12">
            <div className="text-5xl mb-4">
              <FaHeart />
            </div>
            <blockquote className="text-xl leading-8 font-semibold mb-4">
              "Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol
              persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk
              menjaga warisan leluhur sambil melangkah maju ke masa depan."
            </blockquote>
            <p className="text-white/80">— Tokoh Budaya Ponorogo</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-secondary">
        <div className="container">
          <div className="bg-white border-2 border-primary rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Ingin Melihat Jadwal Lengkap?</h2>
            <p className="text-text-secondary mb-8 leading-7">
              Temukan semua jadwal acara Grebeg Suro dan rencanakan kunjungan Anda
            </p>
            <Link
              to="/jadwal"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white rounded-lg font-bold transition-all duration-300 hover:-translate-y-0.75 hover:shadow-2xl"
            >
              <FaMusic />
              Lihat Jadwal Event
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
