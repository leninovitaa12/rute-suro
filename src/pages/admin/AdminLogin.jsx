import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  async function login(e) {
    e.preventDefault()
    setMsg('')
    setLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (signInError) {
        console.error('[AdminLogin] Sign in error:', signInError.message)
        setMsg('Email atau password salah!')
        setLoading(false)
        return
      }

      if (!data.user) {
        setMsg('Login gagal')
        setLoading(false)
        return
      }

      // Check if user is admin by checking profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        console.error('[AdminLogin] Profile error:', profileError?.message)
        setMsg('User tidak ditemukan di sistem')
        setLoading(false)
        return
      }

      if (profile.role !== 'admin') {
        console.error('[AdminLogin] User is not admin, role:', profile.role)
        setMsg('Anda bukan admin!')
        setLoading(false)
        return
      }

      // Success - store session and navigate
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', email)
      localStorage.setItem('adminUserId', data.user.id)
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('[AdminLogin] Unexpected error:', err)
      setMsg('Terjadi kesalahan. Silahkan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5'}}>
      <div style={{maxWidth: '500px', width: '100%', padding: '20px'}}>
        <div style={{background: '#fff', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #ddd'}}>
          <h2 style={{fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#333'}}>Admin Login</h2>
          
          <div style={{textAlign: 'center', marginBottom: '30px', fontSize: '14px', color: '#666'}}>
            <p style={{marginBottom: '8px'}}>Gunakan akun Supabase Anda:</p>
            <p style={{color: '#888', fontSize: '12px'}}>Email dan password yang terdaftar di Supabase</p>
          </div>
          
          <form onSubmit={login}>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Email</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)}
                placeholder="admin@rutesuro.com"
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
              />
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333'}}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px'}}
              />
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              style={{width: '100%', padding: '12px', background: loading ? '#ccc' : '#a41e34', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'}}
              onMouseOver={e => !loading && (e.target.style.background = '#8b1729')}
              onMouseOut={e => !loading && (e.target.style.background = '#a41e34')}
            >
              {loading ? 'Sedang login...' : 'Login'}
            </button>
            
            {msg && <p style={{marginTop: '15px', textAlign: 'center', color: '#d32f2f', fontSize: '14px', fontWeight: 'bold'}}>{msg}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
