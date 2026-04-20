const steps = [
  { num: '01', title: 'Input Destinasi', desc: 'Pilih satu atau beberapa titik sakral yang ingin kamu kunjungi di Ponorogo.' },
  { num: '02', title: 'Proses Heuristik', desc: 'Algoritma A* menghitung jarak Euclidean dan biaya real-time untuk jalur tercepat.' },
  { num: '03', title: 'Navigasi Budaya', desc: 'Dapatkan peta interaktif lengkap dengan panduan sejarah di setiap perhentian.' },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#f8f6f6]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Cara Kerja Sistem</h2>
          <p className="text-gray-500 mt-3">Proses algoritma yang mengubah input lokasi menjadi jalur efisien.</p>
        </div>
        <div className="relative flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-[2px] bg-red-800/20" />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center flex-1">
              <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-[#922626]">
                <span className="text-xl font-black text-[#922626]">{s.num}</span>
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">{s.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}