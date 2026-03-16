import React from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Swal from 'sweetalert2'

export default function AdminLogin() {
  const [email,    setEmail]    = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading,  setLoading]  = React.useState(false)
  const navigate = useNavigate()

  async function login(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError || !data.user) {
        await Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: 'Email atau password salah!',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Coba Lagi',
        })
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('role').eq('id', data.user.id).single()

      if (profileError || !profile) {
        await Swal.fire({
          icon: 'error',
          title: 'Akun Tidak Ditemukan',
          text: 'User tidak ditemukan di sistem.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Tutup',
        })
        return
      }

      if (profile.role !== 'admin') {
        await Swal.fire({
          icon: 'warning',
          title: 'Akses Ditolak',
          text: 'Anda bukan admin!',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Tutup',
        })
        return
      }

      // Success
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', email)
      localStorage.setItem('adminUserId', data.user.id)

      await Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang, ${email}`,
        confirmButtonColor: '#16a34a',
        confirmButtonText: 'Masuk Dashboard',
        timer: 2000,
        timerProgressBar: true,
      })

      navigate('/admin/dashboard')
    } catch (err) {
      console.error('[AdminLogin] Unexpected error:', err)
      await Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Silahkan coba lagi.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'Tutup',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#333' }}>Admin Login</h2>
          <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '14px', color: '#666' }}>
            <p>Gunakan akun yang sudah terdaftar:</p>
          </div>

          <form onSubmit={login}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@rutesuro.com" required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password" required
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: loading ? '#ccc' : '#a41e34', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseOver={e => !loading && (e.target.style.background = '#8b1729')}
              onMouseOut={e  => !loading && (e.target.style.background = '#a41e34')}
            >
              {loading ? 'Sedang login...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}