import { useState } from 'react'
import L from 'leaflet'
import { useEffect } from 'react'

export default function UserMapPage() {
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const mapContainer = document.getElementById('map')
      if (mapContainer && !mapReady) {
        const map = L.map('map').setView([-7.5, 111.45], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add markers for popular locations
        const locations = [
          { name: 'Alun-alun Ponorogo', lat: -7.5, lng: 111.45, icon: '🏛️' },
          { name: 'Pendopo Ponorogo', lat: -7.4995, lng: 111.4495, icon: '🏢' },
          { name: 'Taman Rekreasi', lat: -7.5005, lng: 111.4505, icon: '🎡' },
        ]

        locations.forEach(loc => {
          const marker = L.marker([loc.lat, loc.lng])
            .bindPopup(`<b>${loc.name}</b>`)
            .addTo(map)
        })

        setMapReady(true)
      }
    }, 100)
  }, [mapReady])

  const handleSearch = (e) => {
    e.preventDefault()
    alert(`Mencari rute dari ${searchFrom} ke ${searchTo}`)
  }

  return (
    <main className="min-h-screen bg-white pt-8">
      <div className="container">
        <h1 className="text-4xl font-extrabold text-text-primary mb-8">
          Peta & Route Finder
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary">Dari:</label>
              <input
                type="text"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                placeholder="Masukkan lokasi awal"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-text-primary">Ke:</label>
              <input
                type="text"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                placeholder="Masukkan lokasi tujuan"
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full">
                Cari Rute
              </button>
            </div>
          </form>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
          <div id="map" className="w-full h-96 md:h-screen max-h-screen"></div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-secondary rounded-lg p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Cara Menggunakan
            </h2>
            <ol className="space-y-3 text-text-secondary">
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-fit">1.</span>
                <span>Masukkan lokasi awal di kolom "Dari"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-fit">2.</span>
                <span>Masukkan lokasi tujuan di kolom "Ke"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-fit">3.</span>
                <span>Klik tombol "Cari Rute"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-primary min-w-fit">4.</span>
                <span>Ikuti petunjuk arah di peta</span>
              </li>
            </ol>
          </div>

          <div className="bg-secondary rounded-lg p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Lokasi Penting
            </h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex gap-2">
                <span>🏛️</span>
                <span>Alun-alun Ponorogo</span>
              </li>
              <li className="flex gap-2">
                <span>🏢</span>
                <span>Pendopo Ponorogo</span>
              </li>
              <li className="flex gap-2">
                <span>🎡</span>
                <span>Taman Rekreasi</span>
              </li>
              <li className="flex gap-2">
                <span>🍽️</span>
                <span>Area Kuliner</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
