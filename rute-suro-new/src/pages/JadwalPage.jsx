import { useState } from 'react'

export default function JadwalPage() {
  const [selectedDay, setSelectedDay] = useState(1)

  const schedule = {
    1: [
      { time: '06:00 - 08:00', event: 'Pembukaan Resmi', location: 'Alun-alun Ponorogo', category: 'Upacara' },
      { time: '08:30 - 11:00', event: 'Parade Kuda Hias', location: 'Jalan Utama', category: 'Parade' },
      { time: '12:00 - 13:00', event: 'Istirahat & Makan Siang', location: 'Area Kuliner', category: 'Kuliner' },
      { time: '13:30 - 16:00', event: 'Pertunjukan Seni Tradisional', location: 'Pendopo Ponorogo', category: 'Seni' },
      { time: '17:00 - 19:00', event: 'Hiburan Malam', location: 'Alun-alun Ponorogo', category: 'Hiburan' },
      { time: '19:30 - 21:30', event: 'Bazar Kuliner & Kerajinan', location: 'Area Depan Pendopo', category: 'Kuliner' },
    ],
    2: [
      { time: '07:00 - 09:00', event: 'Senam Pagi Tradisional', location: 'Alun-alun Ponorogo', category: 'Olahraga' },
      { time: '09:30 - 12:00', event: 'Workshop Seni & Budaya', location: 'Rumah Budaya', category: 'Workshop' },
      { time: '12:00 - 13:30', event: 'Makan Siang Bersama', location: 'Area Kuliner', category: 'Kuliner' },
      { time: '14:00 - 17:00', event: 'Pertunjukan Wayang Kulit', location: 'Pendopo Ponorogo', category: 'Seni' },
      { time: '18:00 - 20:00', event: 'Konser Musik Tradisional', location: 'Panggung Utama', category: 'Musik' },
      { time: '20:30 - 23:00', event: 'Penutupan dengan Kembang Api', location: 'Alun-alun Ponorogo', category: 'Penutupan' },
    ],
    3: [
      { time: '08:00 - 10:00', event: 'Pameran Budaya & Kerajinan', location: 'Gedung Pameran', category: 'Pameran' },
      { time: '10:30 - 13:00', event: 'Pertunjukan Teater Rakyat', location: 'Pendopo Ponorogo', category: 'Seni' },
      { time: '13:00 - 14:30', event: 'Makan Siang', location: 'Area Kuliner', category: 'Kuliner' },
      { time: '15:00 - 17:00', event: 'Kompetisi Seni & Budaya', location: 'Alun-alun Ponorogo', category: 'Kompetisi' },
      { time: '17:30 - 19:00', event: 'Photo Session Tradisional', location: 'Spot Foto Ikonik', category: 'Foto' },
      { time: '19:30 - 21:00', event: 'Penutupan Akhir Acara', location: 'Pendopo Ponorogo', category: 'Penutupan' },
    ],
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Upacara': 'bg-red-100 text-red-800 border-red-300',
      'Parade': 'bg-blue-100 text-blue-800 border-blue-300',
      'Seni': 'bg-purple-100 text-purple-800 border-purple-300',
      'Hiburan': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Kuliner': 'bg-orange-100 text-orange-800 border-orange-300',
      'Musik': 'bg-pink-100 text-pink-800 border-pink-300',
      'Olahraga': 'bg-green-100 text-green-800 border-green-300',
      'Workshop': 'bg-teal-100 text-teal-800 border-teal-300',
      'Pameran': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Kompetisi': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'Foto': 'bg-lime-100 text-lime-800 border-lime-300',
      'Penutupan': 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <main className="min-h-screen bg-white pt-12">
      <div className="container">
        {/* Header */}
        <section className="mb-12">
          <h1 className="text-5xl font-extrabold text-text-primary mb-6">
            Jadwal Acara Grebeg Suro
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">
            Berikut adalah jadwal lengkap acara Grebeg Suro 2024. Pilih hari yang ingin Anda lihat untuk mengetahui detail event yang tersedia.
          </p>
        </section>

        {/* Day Selection */}
        <div className="flex flex-wrap gap-4 mb-12">
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                selectedDay === day
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-secondary text-text-primary border border-border hover:border-primary'
              }`}
            >
              Hari {day}
            </button>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="space-y-4 mb-16">
          {schedule[selectedDay].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border-2 border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-text-secondary uppercase font-bold">Waktu</p>
                  <p className="text-xl font-bold text-primary">{item.time}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-text-secondary uppercase font-bold">Acara</p>
                  <p className="text-lg font-semibold text-text-primary">{item.event}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-text-secondary uppercase font-bold">Lokasi</p>
                  <p className="text-lg text-text-secondary">{item.location}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-text-secondary uppercase font-bold">Kategori</p>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold border inline-block w-fit ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Kategori Acara
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { cat: 'Upacara', color: 'bg-red-100 text-red-800' },
              { cat: 'Parade', color: 'bg-blue-100 text-blue-800' },
              { cat: 'Seni', color: 'bg-purple-100 text-purple-800' },
              { cat: 'Hiburan', color: 'bg-yellow-100 text-yellow-800' },
              { cat: 'Kuliner', color: 'bg-orange-100 text-orange-800' },
              { cat: 'Musik', color: 'bg-pink-100 text-pink-800' },
              { cat: 'Olahraga', color: 'bg-green-100 text-green-800' },
              { cat: 'Workshop', color: 'bg-teal-100 text-teal-800' },
            ].map((item, idx) => (
              <div key={idx} className={`px-4 py-2 rounded text-center font-semibold ${item.color}`}>
                {item.cat}
              </div>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-secondary rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Tips Menghadiri Grebeg Suro
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold text-text-primary">Datang Lebih Awal</p>
                <p className="text-text-secondary">Tiba 30 menit sebelum acara dimulai untuk mendapatkan tempat terbaik.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold text-text-primary">Gunakan Rute Suro</p>
                <p className="text-text-secondary">Manfaatkan aplikasi Rute Suro untuk navigasi dan menghindari kemacetan.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold text-text-primary">Bawa Perlengkapan</p>
                <p className="text-text-secondary">Bawa botol minum, topi, dan sunscreen untuk kenyamanan Anda.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-bold text-text-primary">Patuhi Protokol</p>
                <p className="text-text-secondary">Ikuti petunjuk petugas dan patuhi protokol kesehatan yang berlaku.</p>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
