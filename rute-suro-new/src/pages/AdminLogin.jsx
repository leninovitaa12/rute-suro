import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    
    // Demo login: email any, password 'admin123'
    if (password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true')
      localStorage.setItem('adminEmail', email)
      navigate('/admin/dashboard')
    } else {
      setError('Email atau password salah. Coba password: admin123')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-primary mb-2">
              RUTE SURO
            </h1>
            <p className="text-text-secondary">Admin Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-text-primary">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rutesuro.com"
                className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-semibold text-text-primary">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-300"
              />
              <p className="text-xs text-text-secondary mt-1">
                * Demo password: admin123
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-text-secondary text-sm mt-6">
            Masuk dengan akun administrator Anda
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white/20 backdrop-blur-md rounded-lg p-4 text-white text-sm">
          <p className="font-semibold mb-2">📝 Informasi Demo:</p>
          <p>Email: Anda bisa input apa saja</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </main>
  )
}
