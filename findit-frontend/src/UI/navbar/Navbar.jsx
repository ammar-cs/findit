import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiBell, FiChevronDown, FiUser, FiLogOut, FiGrid, FiPlus } from 'react-icons/fi'
import useAuth from '../../store/useAuth'
import { getNotifications } from '../../api/index'

const gradientBg = {
  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
}

export default function Navbar() {
  // ── All existing logic preserved exactly ──────────────────────────────────
  const { token, user, logout, isAdmin } = useAuth()
  const isAuthenticated = !!token
  const navigate = useNavigate()

  const [postOpen, setPostOpen]   = useState(false)
  const [userOpen, setUserOpen]   = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const postRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return }
    let cancelled = false
    getNotifications()
      .then((res) => {
        if (cancelled) return
        const notifications = res.data?.notifications ?? res.data ?? []
        setUnreadCount(notifications.filter((n) => !n.read).length)
      })
      .catch(() => { if (!cancelled) setUnreadCount(0) })
    return () => { cancelled = true }
  }, [isAuthenticated])

  useEffect(() => {
    function handleClick(e) {
      if (postRef.current && !postRef.current.contains(e.target)) setPostOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">

          {/* ── Brand ── */}
          <Link to="/home" className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={gradientBg}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
                <circle cx="7" cy="7" r="2" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-800">Lost &amp; Found</span>
          </Link>

          {/* ── Center links ── */}
          <div className="hidden md:flex items-center gap-5">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `text-xs font-medium transition-colors ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-800'}`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `text-xs font-medium transition-colors ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-800'}`
              }
            >
              Browse Items
            </NavLink>

            {/* Report Item button */}
            <Link
              to={isAuthenticated ? '/items/lost/new' : '/login'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium"
              style={gradientBg}
            >
              <FiPlus size={11} />
              Report Item
            </Link>

            {/* Admin link - only for admin users */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-xs font-medium transition-colors ${isActive ? 'text-purple-600' : 'text-gray-500 hover:text-gray-800'}`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Bell */}
                <Link
                  to="/notifications"
                  className="relative p-1.5 text-gray-500 hover:text-purple-600 transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <FiBell size={16} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full text-white text-[9px] font-bold leading-none"
                      style={gradientBg}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar dropdown */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen((o) => !o)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold select-none"
                      style={gradientBg}
                    >
                      {user?.name?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? <FiUser size={12} />}
                    </div>
                    <FiChevronDown
                      className={`text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`}
                      size={12}
                    />
                  </button>

                  {userOpen && (
                    <div className="absolute top-full right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-2 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {user?.name || user?.username || 'User'}
                        </p>
                        {user?.email && (
                          <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                        )}
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      >
                        <FiGrid size={12} /> Dashboard
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                      >
                        History
                      </Link>
                      <div className="border-t border-gray-50 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                        >
                          <FiLogOut size={12} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                  style={gradientBg}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
