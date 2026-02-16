// src/lib/backendApi.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export const backendApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ================================================================
// EVENTS API
// ================================================================

export const getEvents = async () => {
  try {
    const response = await backendApi.get('/events')
    return response.data || []
  } catch (error) {
    console.error('[backendApi] Error fetching events:', error.message)
    throw error
  }
}

// ================================================================
// CLOSURES API
// ================================================================

export const getClosures = async (active = false) => {
  try {
    const response = await backendApi.get('/closures', {
      params: { active: active ? 'true' : 'false' }
    })
    return response.data || []
  } catch (error) {
    console.error('[backendApi] Error fetching closures:', error.message)
    throw error
  }
}

export const getActiveClosures = async () => {
  return getClosures(true)
}

// ================================================================
// ROUTE CALCULATION API
// ================================================================

export const calculateRoute = async (startLat, startLng, endLat, endLng) => {
  try {
    const response = await backendApi.post('/route', {
      start: { lat: startLat, lng: startLng },
      end: { lat: endLat, lng: endLng }
    })
    return response.data
  } catch (error) {
    console.error('[backendApi] Error calculating route:', error.message)
    throw error
  }
}

// ================================================================
// ADMIN API (Edge Derivation)
// ================================================================

export const deriveEdges = async (pointALat, pointALng, pointBLat, pointBLng) => {
  try {
    const response = await backendApi.post('/admin/derive_edges', {
      a: { lat: pointALat, lng: pointALng },
      b: { lat: pointBLat, lng: pointBLng }
    })
    return response.data || []
  } catch (error) {
    console.error('[backendApi] Error deriving edges:', error.message)
    throw error
  }
}

// ================================================================
// SUPABASE CLOSURES API (CRUD Operations)
// ================================================================

import { supabase } from './supabase'

export const createClosure = async (closureData) => {
  try {
    const { data, error } = await supabase
      .from('closures')
      .insert([closureData])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error creating closure:', error.message)
    throw error
  }
}

export const updateClosure = async (closureId, closureData) => {
  try {
    const { data, error } = await supabase
      .from('closures')
      .update(closureData)
      .eq('id', closureId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error updating closure:', error.message)
    throw error
  }
}

export const deleteClosure = async (closureId) => {
  try {
    const { error } = await supabase
      .from('closures')
      .delete()
      .eq('id', closureId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('[backendApi] Error deleting closure:', error.message)
    throw error
  }
}

// ================================================================
// SUPABASE EVENTS API (CRUD Operations)
// ================================================================

export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error creating event:', error.message)
    throw error
  }
}

export const updateEvent = async (eventId, eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', eventId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error updating event:', error.message)
    throw error
  }
}

export const deleteEvent = async (eventId) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('[backendApi] Error deleting event:', error.message)
    throw error
  }
}

// ================================================================
// SUPABASE SEJARAH API (CRUD Operations)
// ================================================================

export const getSejarah = async () => {
  try {
    const { data, error } = await supabase
      .from('sejarah')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[backendApi] Error fetching sejarah:', error.message)
    throw error
  }
}

export const createSejarah = async (sejarahData) => {
  try {
    const { data, error } = await supabase
      .from('sejarah')
      .insert([sejarahData])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error creating sejarah:', error.message)
    throw error
  }
}

export const updateSejarah = async (sejarahId, sejarahData) => {
  try {
    const { data, error } = await supabase
      .from('sejarah')
      .update(sejarahData)
      .eq('id', sejarahId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error updating sejarah:', error.message)
    throw error
  }
}

export const deleteSejarah = async (sejarahId) => {
  try {
    const { error } = await supabase
      .from('sejarah')
      .delete()
      .eq('id', sejarahId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('[backendApi] Error deleting sejarah:', error.message)
    throw error
  }
}

// ================================================================
// SUPABASE TENTANG API (CRUD Operations)
// ================================================================

export const getTentang = async () => {
  try {
    const { data, error } = await supabase
      .from('tentang')
      .select('*')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('[backendApi] Error fetching tentang:', error.message)
    throw error
  }
}

export const createTentang = async (tentangData) => {
  try {
    const { data, error } = await supabase
      .from('tentang')
      .insert([tentangData])
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error creating tentang:', error.message)
    throw error
  }
}

export const updateTentang = async (tentangId, tentangData) => {
  try {
    const { data, error } = await supabase
      .from('tentang')
      .update(tentangData)
      .eq('id', tentangId)
      .select()

    if (error) throw error
    return data?.[0]
  } catch (error) {
    console.error('[backendApi] Error updating tentang:', error.message)
    throw error
  }
}

export const deleteTentang = async (tentangId) => {
  try {
    const { error } = await supabase
      .from('tentang')
      .delete()
      .eq('id', tentangId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('[backendApi] Error deleting tentang:', error.message)
    throw error
  }
}
