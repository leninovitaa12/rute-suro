import React from 'react'
import { supabase } from '../lib/supabase.js'

export default function AdminLogin() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [msg, setMsg] = React.useState('')

  async function login(e) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
  }

  async function register(e) {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Registrasi berhasil. Silakan login.')
  }

  return (
    <div className="container" style={{maxWidth: 520}}>
      <div className="card">
        <h3 style={{marginTop:0}}>Admin Login</h3>
        <form onSubmit={login}>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
          <div style={{height:10}} />
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{height:12}} />
          <div className="row">
            <button className="btn" type="submit">Login</button>
            <button className="btn secondary" onClick={register}>Register</button>
          </div>
          {msg && <p className="small" style={{color:'#991b1b'}}>{msg}</p>}
        </form>
      </div>
    </div>
  )
}
