/**
 * EXAMPLE COMPONENT: Route Calculator
 * 
 * This component demonstrates how to use the backend API services
 * to calculate routes and display closure information.
 * 
 * You can use this as a reference for integrating similar functionality
 * into other components.
 */

import React, { useState } from 'react'
import { useRouteCalculation } from '../hooks/useRouteCalculation'
import { getActiveClosures } from '../lib/backendApi'

export default function RouteCalculatorExample() {
  const { route, loading, error, closures, getRoute, resetRoute } = useRouteCalculation()
  const [activeClosures, setActiveClosures] = useState([])
  
  // Start point (user's location)
  const [startPoint, setStartPoint] = useState({
    lat: -7.871,
    lng: 111.462
  })
  
  // End point (destination)
  const [endPoint, setEndPoint] = useState({
    lat: -7.880,
    lng: 111.480
  })

  // Load all active closures on component mount
  React.useEffect(() => {
    const loadClosures = async () => {
      try {
        const data = await getActiveClosures()
        setActiveClosures(data || [])
      } catch (err) {
        console.error('Error loading closures:', err)
      }
    }
    loadClosures()
  }, [])

  const handleCalculateRoute = async () => {
    try {
      await getRoute(
        startPoint.lat,
        startPoint.lng,
        endPoint.lat,
        endPoint.lng
      )
    } catch (err) {
      console.error('Error calculating route:', err)
    }
  }

  const handleReset = () => {
    resetRoute()
    setStartPoint({ lat: -7.871, lng: 111.462 })
    setEndPoint({ lat: -7.880, lng: 111.480 })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Kalkulator Rute</h1>
      
      {/* Active Closures Section */}
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-900 mb-3">Penutupan Jalan Aktif</h2>
        {activeClosures.length === 0 ? (
          <p className="text-yellow-800">Tidak ada penutupan jalan aktif</p>
        ) : (
          <ul className="space-y-2">
            {activeClosures.map(closure => (
              <li key={closure.id} className="text-yellow-800">
                <strong>{closure.type}</strong> - {closure.reason}
                {closure.event_id && ` (Event ID: ${closure.event_id})`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Start Point */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Lokasi Awal</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={startPoint.lat}
                onChange={(e) => setStartPoint({ ...startPoint, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={startPoint.lng}
                onChange={(e) => setStartPoint({ ...startPoint, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* End Point */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Lokasi Tujuan</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-gray-600">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={endPoint.lat}
                onChange={(e) => setEndPoint({ ...endPoint, lat: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={endPoint.lng}
                onChange={(e) => setEndPoint({ ...endPoint, lng: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Button Section */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleCalculateRoute}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          {loading ? 'Menghitung...' : 'Hitung Rute'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-all"
        >
          Reset
        </button>
      </div>

      {/* Error Section */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {route && !error && (
        <div className="space-y-6">
          {/* Route Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-600">Jarak Total</p>
              <p className="text-2xl font-bold text-green-600">
                {(route.total_length_m / 1000).toFixed(2)} km
              </p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">Waktu Tempuh</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(route.total_time_sec / 60)} menit
              </p>
            </div>
          </div>

          {/* Active Closures on Route */}
          {closures.length > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3">
                Penutupan Jalan pada Rute ({closures.length})
              </h3>
              <ul className="space-y-2">
                {closures.map(closure => (
                  <li key={closure.id} className="text-orange-800 p-2 bg-orange-100 rounded">
                    <strong>{closure.type}</strong>
                    {closure.reason && ` - ${closure.reason}`}
                    {closure.event_id && ` (Event: ${closure.event_id})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Route Coordinates */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Koordinat Rute ({route.polyline.length} titik)</h3>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">No</th>
                    <th className="px-3 py-2 text-left">Latitude</th>
                    <th className="px-3 py-2 text-left">Longitude</th>
                  </tr>
                </thead>
                <tbody>
                  {route.polyline.map((point, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-100">
                      <td className="px-3 py-2">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{point.lat.toFixed(6)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{point.lng.toFixed(6)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Menghitung rute...</p>
        </div>
      )}

      {/* Empty State */}
      {!route && !loading && !error && (
        <div className="p-8 text-center text-gray-500">
          <p>Atur lokasi awal dan tujuan, lalu klik "Hitung Rute"</p>
        </div>
      )}
    </div>
  )
}
