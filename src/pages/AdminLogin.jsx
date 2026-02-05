import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [msg, setMsg] = React.useState('')
  const navigate = useNavigate()

  // Kredensial dummy untuk admin
  const ADMIN_CREDENTIALS = {
    email: 'admin@rutesuro.com',
    password: 'admin123'
  }

  async function login(e) {
    e.preventDefault()
    setMsg('')

    // Validasi kredensial dummy
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Simpan status login di localStorage
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', email)
      
      // Redirect ke dashboard
      navigate('/admin/dashboard')
    } else {
      setMsg('Email atau password salah!')
    }
  }

  return (
    <div className="container" style={{maxWidth: 520, marginTop: '80px'}}>
      <div className="card">
        <h3 style={{marginTop:0, textAlign: 'center'}}>Admin Login</h3>
        <p style={{textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '20px'}}>
          Demo Credentials:<br/>
          <strong>Email:</strong> admin@rutesuro.com<br/>
          <strong>Password:</strong> admin123
        </p>
        
        <form onSubmit={login}>
          <label className="label">Email</label>
          <input 
            className="input" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            placeholder="admin@rutesuro.com"
            required
          />
          <div style={{height:10}} />
          
          <label className="label">Password</label>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            placeholder="Masukkan password"
            required
          />
          <div style={{height:12}} />
          
          <button className="btn" type="submit" style={{width: '100%'}}>
            Login
          </button>
          
          {msg && <p className="small" style={{color:'#991b1b', marginTop: '12px', textAlign: 'center'}}>{msg}</p>}
        </form>
      </div>
    </div>
  )
}