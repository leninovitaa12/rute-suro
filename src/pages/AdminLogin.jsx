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
    <div className="container min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h3 className="text-3xl font-bold mt-0 mb-6 text-center">Admin Login</h3>
        <p className="text-center text-text-secondary text-sm mb-6">
          Demo Credentials:<br/>
          <strong>Email:</strong> admin@rutesuro.com<br/>
          <strong>Password:</strong> admin123
        </p>
        
        <form onSubmit={login}>
          <label className="label">Email</label>
          <input 
            className="input mb-4" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)}
            placeholder="admin@rutesuro.com"
            required
          />
          
          <label className="label">Password</label>
          <input 
            className="input mb-4" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
            placeholder="Masukkan password"
            required
          />
          
          <button className="btn w-full" type="submit">
            Login
          </button>
          
          {msg && <p className="text-sm text-error mt-3 text-center">{msg}</p>}
        </form>
      </div>
    </div>
  )
}
