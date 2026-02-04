import { Routes, Route, Link } from 'react-router-dom'
import UserMapPage from './UserMapPage.jsx'
import AdminDashboard from './AdminDashboard.jsx'

export default function App() {
  return (
    <>
      <div className="nav">
        <div className="left">
          <div className="brand">Route Ponorogo</div>
          <Link to="/">User</Link>
          <Link to="/admin">Admin</Link>
        </div>
        <div className="right">
          <span className="small">Admin Mode (Demo)</span>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<UserMapPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}
