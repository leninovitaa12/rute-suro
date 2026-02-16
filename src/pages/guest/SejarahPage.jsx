import React from "react"
import { Link } from "react-router-dom"

export default function SejarahPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-red-800 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Sejarah & Tradisi Event</h1>
          <p className="text-xl text-red-100">
            Menyelami lebih dalam tradisi dan warisan budaya Grebeg Suro yang kaya akan makna dan sejarah
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Intro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-lg h-64 flex items-center justify-center text-white shadow-lg">
              <div className="text-center">
                <div className="text-6xl font-bold opacity-30 mb-2">KP</div>
                <p className="font-semibold text-lg">Prosesi Kirab Pusaka</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Apa itu Grebeg Suro?</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Grebeg Suro adalah upacara tradisional yang dilaksanakan setiap bulan Suro (Muharram) di Ponorogo, Jawa Timur. Acara ini merupakan salah satu warisan budaya yang masih dilestarikan hingga saat ini dan menjadi identitas penting masyarakat Ponorogo.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Tradisi ini bermula dari masa Kerajaan Ponorogo dan terus diwariskan turun-temurun sebagai bentuk syukur, doa keselamatan, dan pelestarian nilai-nilai luhur budaya Jawa.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Lini Masa Transformasi</h2>
            <div className="space-y-8">
              {[
                {
                  num: '1',
                  title: 'Asal Usul Spiritual',
                  desc: 'Berawal dari tradisi spiritual kerajaan untuk menghormati leluhur dan memohon berkah di awal tahun Jawa. Upacara ini melibatkan prosesi kirab pusaka dan sesaji sebagai simbol penghormatan.'
                },
                {
                  num: '2',
                  title: 'Transformasi Publik (1980-an)',
                  desc: 'Tradisi mulai membuka diri untuk umum dan menjadi festival budaya yang melibatkan masyarakat luas. Integrasi dengan seni pertunjukan Reog Ponorogo memperkaya acara ini.'
                },
                {
                  num: '3',
                  title: 'Modernisasi & Adaptasi Digital',
                  desc: 'Integrasi teknologi untuk memudahkan akses informasi dan navigasi selama acara berlangsung. Penggunaan aplikasi seperti Rute Suro membantu optimalisasi perjalanan pengunjung.'
                }
              ].map((item) => (
                <div key={item.num} className="flex gap-6 transform transition-transform hover:translate-x-1 duration-300">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-800 text-white font-bold shadow-md">
                      {item.num}
                    </div>
                  </div>
                  <div className="flex-1 pb-8 border-l-2 border-gray-300 last:border-l-0 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cultural Elements */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Elemen Budaya Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Kirab',
                  desc: 'Prosesi kirab pusaka keliling kota yang melibatkan ratusan peserta dengan mengenakan busana adat. Kirab dimulai dari alun-alun dan melewati titik-titik bersejarah di Ponorogo.'
                },
                {
                  title: 'Reog',
                  desc: 'Seni tari tradisional khas Ponorogo yang menampilkan penari dengan topeng barongan besar. Pertunjukan ini menjadi daya tarik utama dan simbol kebanggaan masyarakat Ponorogo.'
                },
                {
                  title: 'Gamelan',
                  desc: 'Iringan musik gamelan tradisional yang mengiringi setiap prosesi. Alunan gamelan menciptakan atmosfer sakral dan khidmat selama acara berlangsung.'
                },
                {
                  title: 'Festival Rakyat',
                  desc: 'Berbagai kegiatan festival seperti bazaar kuliner, pameran kerajinan, dan lomba seni turut meramaikan acara. Momen ini menjadi ajang silaturahmi dan promosi UMKM lokal.'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote */}
          <div className="mt-16 bg-gradient-to-r from-red-800 to-red-700 text-white rounded-lg p-8 sm:p-12 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
            <p className="text-2xl font-semibold mb-4 leading-relaxed">
              "Grebeg Suro bukan sekadar upacara tradisional, tetapi juga simbol persatuan, doa bersama, dan komitmen masyarakat Ponorogo untuk menjaga warisan leluhur sambil melangkah maju ke masa depan."
            </p>
            <p className="text-red-100">— Tokoh Budaya Ponorogo</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-12 sm:py-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ingin Melihat Jadwal Lengkap?</h2>
          <p className="text-gray-600 mb-8 text-lg">Temukan semua jadwal acara Grebeg Suro dan rencanakan kunjungan Anda</p>
          <Link to="/jadwal" className="inline-block px-8 py-3 btn-red rounded-lg">
            Lihat Jadwal Event
          </Link>
        </div>
      </section>
    </div>
  )
}
