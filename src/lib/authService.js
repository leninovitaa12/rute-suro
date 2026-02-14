import { supabase } from './supabase'

// ================================================================
// AUTHENTICATION SERVICE
// ================================================================

export const checkIsAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data?.role === 'admin'
  } catch (error) {
    console.error('[authService] Error checking admin role:', error.message)
    return false
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('[authService] Error getting current user:', error.message)
    return null
  }
}

export const getCurrentUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('[authService] Error getting user profile:', error.message)
    return null
  }
}

export const adminLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Check if user is admin
    const isAdmin = await checkIsAdmin(data.user.id)
    if (!isAdmin) {
      // Sign out if not admin
      await supabase.auth.signOut()
      throw new Error('User is not an admin')
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error('[authService] Admin login failed:', error.message)
    throw error
  }
}

export const adminLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return true
  } catch (error) {
    console.error('[authService] Logout failed:', error.message)
    throw error
  }
}

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('[authService] Error getting session:', error.message)
    return null
  }
}

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}
