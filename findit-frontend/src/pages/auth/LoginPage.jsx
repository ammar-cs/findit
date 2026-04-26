import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiEye, FiEyeOff, FiUser, FiLock, FiArrowLeft } from 'react-icons/fi'
import useAuth from '../../store/useAuth'
import { login as apiLogin } from '../../api/authAPI'

// ─── App icon ─────────────────────────────────────────────────────────────────

function AppIcon() {
  return (
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
    >
      {/* Simple rounded square icon matching the Figma purple icon */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="20" height="20" rx="6" stroke="white" strokeWidth="2.5" fill="none" />
        <circle cx="14" cy="14" r="4" fill="white" />
      </svg>
    </div>
  )
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  // ── All existing logic preserved exactly ──────────────────────────────────
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message ?? ''

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) next.email = 'Email is required.'
    if (!form.password) next.password = 'Password is required.'
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    try {
      const response = await apiLogin({ email: form.email.trim(), password: form.password })
      const { token, user } = response.data
      login(token, user)
      navigate('/home')
    } catch (err) {
      setApiError(
        err?.response?.data?.message || 'Invalid email or password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    // Full-screen gradient background: purple → pink → orange
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-4 z-10"
      style={{
        background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
      }}
    >
      {/* ← Back to Home link */}
      <div className="w-full max-w-sm mb-3">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs transition-colors"
        >
          <FiArrowLeft size={12} />
          Back to Home
        </Link>
      </div>

      {/* White card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl px-8 py-8">

        {/* App icon + heading */}
        <div className="text-center mb-6">
          <AppIcon />
          <h1 className="text-lg font-bold text-gray-800">Sign In</h1>
          <p className="text-xs text-gray-400 mt-1">Welcome back to FindIt</p>
        </div>

        {/* Success banner */}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
            <p className="text-xs text-green-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Username / Email field */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">
              Username
            </label>
            <div className="relative">
              <FiUser
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your username"
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-xs text-gray-700
                  placeholder-gray-300 outline-none transition
                  focus:ring-2 focus:ring-purple-300 focus:border-purple-400
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-xs text-gray-700
                  placeholder-gray-300 outline-none transition
                  focus:ring-2 focus:ring-purple-300 focus:border-purple-400
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500">{errors.password}</p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-xs text-red-600">{apiError}</p>
            </div>
          )}

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold
              disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            style={{
              background: loading
                ? '#a855f7'
                : 'linear-gradient(90deg, #a855f7, #ec4899)',
            }}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Sign up link */}
        <p className="mt-4 text-center text-[10px] text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-purple-500 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="mt-5 text-white/50 text-[10px]">
        © FindIt All Rights Reserved
      </p>
    </div>
  )
}
