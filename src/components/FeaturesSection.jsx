export default function FeaturesSection() {
  const features = [
    {
      title: 'Optimasi A*',
      description: 'Memanfaatkan data real-time dan algoritma A* untuk menentukan rute terpendek, tercepat, dan paling efisien menuju lokasi Grebeg Suro dengan akurasi tinggi.'
    },
    {
      title: 'Trafik Real-time',
      description: 'Integrasi data lalu lintas langsung dan pembaruan kondisi jalan secara real-time. Monitor kemacetan dan jalur alternatif untuk menghindari penundaan perjalanan.'
    },
    {
      title: 'Acara Budaya',
      description: 'Informasi jadwal dan lokasi lengkap acara Grebeg Suro, kirab pusaka, dan penampilan Reog. Tetap update dengan notifikasi acara terbaru.'
    }
  ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Fitur Utama Dashboard</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Solusi teknologi canggih untuk mendukung kelancaran tradisi budaya di Ponorogo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-gray-50 p-8 rounded-lg border border-gray-200 hover:border-red-600 hover:-translate-y-2 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
