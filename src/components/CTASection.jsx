import { Link } from 'react-router-dom'

export default function CTASection() {
  const steps = [
    { number: '1', title: 'Pilih Lokasi', description: 'Tentukan titik awal dan tujuan Anda di peta interaktif atau pilih dari daftar acara.' },
    { number: '2', title: 'Pilih Metode', description: 'Pilih preferensi transportasi: jalan kaki, motor, mobil, atau transportasi umum.' },
    { number: '3', title: 'Cari Rute Optimal', description: 'Algoritma A* menganalisis dan menentukan rute terbaik dengan mempertimbangkan jarak dan waktu.' }
  ]

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Siap Menjelajahi Ponorogo?</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Gunakan sistem navigasi berbasis algoritma kami untuk pengalaman optimal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg border border-gray-200 hover:border-red-600 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 relative overflow-hidden pl-20">
              <div className="absolute left-6 top-6 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/map" className="inline-flex items-center gap-3 px-10 py-4 bg-red-700 text-white font-bold text-lg rounded hover:bg-red-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
            </svg>
            Buka Peta Interaktif
          </Link>
        </div>
      </div>
    </section>
  )
}
