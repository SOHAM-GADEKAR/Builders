import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import MeetingList from './pages/MeetingList'
import MeetingDetail from './pages/MeetingDetail'
import PersonalFeed from './pages/PersonalFeed'
import WeeklyDigest from './pages/WeeklyDigest'
import Login from './pages/Login'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'))
      setUser(JSON.parse(localStorage.getItem('user') || 'null'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/meetings" className="text-2xl font-bold">
              📋 Meeting Tracker
            </Link>
            <div className="flex gap-6 items-center">
              <Link to="/meetings" className="hover:bg-blue-700 px-3 py-2 rounded">Meetings</Link>
              <Link to="/feed" className="hover:bg-blue-700 px-3 py-2 rounded">My Items</Link>
              <Link to="/digest" className="hover:bg-blue-700 px-3 py-2 rounded">Weekly Digest</Link>
              <div className="flex items-center gap-3">
                {user && <span className="text-sm">{user.name}</span>}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="/feed" element={<PersonalFeed />} />
          <Route path="/digest" element={<WeeklyDigest />} />
          <Route path="/" element={<Navigate to="/meetings" />} />
          <Route path="*" element={<Navigate to="/meetings" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
