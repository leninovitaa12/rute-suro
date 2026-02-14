import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const navigate = useNavigate()

  const ADMIN_CREDENTIALS = {
    email: 'admin@rutesuro.com',
    password: 'admin123'
  }

  function login(e) {
    e.preventDefault()
    setMsg('')

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', email)
      navigate('/admin/dashboard')
    } else {
      setMsg('Email atau password salah!')
    }
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5'}}>
      <div style={{maxWidth: '500px', width: '100%', padding: '20px'}}>
        <div style={{background: '#fff', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #ddd'}}>
          <h2 style={{fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', color: '#333'}}>Admin Login</h2>
          
          <div style={{textAlign: 'center', marginBottom: '30px', fontSize: '14px', color: '#666'}}>
            <p style={{marginBottom: '8px'}}>Demo Credentials:</p>
            <p><strong>Email:</strong> admin@rutesuro.com</p>
            <p><strong>Password:</strong> admin123</p>
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
              style={{width: '100%', padding: '12px', background: '#a41e34', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}
              onMouseOver={e => e.target.style.background = '#8b1729'}
              onMouseOut={e => e.target.style.background = '#a41e34'}
            >
              Login
            </button>
            
            {msg && <p style={{marginTop: '15px', textAlign: 'center', color: '#d32f2f', fontSize: '14px', fontWeight: 'bold'}}>{msg}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
