import { useState, useCallback } from 'react'
import { calculateRoute, getActiveClosures } from '../lib/backendApi'

export const useRouteCalculation = () => {
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [closures, setClosures] = useState([])

  const getRoute = useCallback(async (startLat, startLng, endLat, endLng) => {
    try {
      setLoading(true)
      setError(null)

      // Calculate route using backend
      const routeData = await calculateRoute(startLat, startLng, endLat, endLng)
      
      setRoute(routeData)
      
      // Get active closures that affected this route
      if (routeData.closures_active) {
        setClosures(routeData.closures_active)
      }

      return routeData
    } catch (err) {
      console.error('[useRouteCalculation] Error:', err)
      setError(err.message || 'Gagal menghitung rute')
      setRoute(null)
      setClosures([])
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetRoute = useCallback(() => {
    setRoute(null)
    setClosures([])
    setError(null)
  }, [])

  return {
    route,
    loading,
    error,
    closures,
    getRoute,
    resetRoute
  }
}
