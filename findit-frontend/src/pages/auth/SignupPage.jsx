import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiMapPin, FiBell, FiShield, FiSearch, FiPackage } from 'react-icons/fi'
import { signup as apiSignup } from '../../api/authAPI'

// ─── Shared brand panel (same as Login) ──────────────────────────────────────

function BrandPanel() {
  return (
    <div className="hidden md:flex flex-col justify-center px-10 py-12 bg-secondary text-white rounded-l-2xl w-[420px] shrink-0">
      <div className="mb-8">
        <span className="text-4xl font-bold text-white tracking-tight">FindIt</span>
        <p className="mt-3 text-lg text-blue-200 leading-snug">
          Reuniting people with what matters
        </p>
      </div>
      <ul className="space-y-5">
        <li className="flex items-start gap-4">
          <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 text-primary shrink-0">
            <FiMapPin size={18} />
          </span>
          <div>
            <p className="font-semibold text-white">Location-based matching</p>
            <p className="text-sm text-blue-200 mt-0.5">
              Find items reported near you using smart geo-matching.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 text-primary shrink-0">
            <FiBell size={18} />
          </span>
          <div>
            <p className="font-semibold text-white">Instant notifications</p>
            <p className="text-sm text-blue-200 mt-0.5">
              Get alerted the moment a match is found for your item.
            </p>
          </div>
        </li>
        <li className="flex items-start gap-4">
          <span className="mt-0.5 flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 text-primary shrink-0">
            <FiShield size={18} />
          </span>
          <div>
            <p className="font-semibold text-white">Verified claims</p>
            <p className="text-sm text-blue-200 mt-0.5">
              Evidence-based claim system keeps the process safe and fair.
            </p>
          </div>
        </li>
      </ul>
    </div>
  )
}

// ─── SignupPage ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  
  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Full name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'Enter a valid email address.'
    if (!form.password) next.password = 'Password is required.'
    else if (form.password.length < 6)
      next.password = 'Password must be at least 6 characters.'
    if (!form.confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = 'Passwords do not match.'
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
      // Backend requires: name, username, email, password, role
      // Derive username from fullName (lowercase, no spaces)
      const username = form.fullName.trim().toLowerCase().replace(/\s+/g, '_')
      await apiSignup({
        name:     form.fullName.trim(),
        username: username,
        email:    form.email.trim(),
        password: form.password,
        role:     'user',
      })
      navigate('/login', { state: { message: 'Account created! Please sign in.' } })
    } catch (err) {
      setApiError(
        err?.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Shared input class helper
  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm text-secondary placeholder-gray-400 outline-none transition
     focus:ring-2 focus:ring-primary/30 focus:border-primary
     ${errors[field] ? 'border-error bg-red-50' : 'border-gray-300 bg-white'}`

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background px-4 z-10 overflow-y-auto py-8">
      <div className="flex w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto">

        <BrandPanel />

        {/* ── Form panel ── */}
        <div className="flex-1 bg-white px-8 py-10 flex flex-col justify-center">
          <div className="mb-6">
            <p className="md:hidden text-2xl font-bold text-primary mb-1">FindIt</p>
            <h1 className="text-2xl font-bold text-secondary">Create an account</h1>
            <p className="text-sm text-gray-500 mt-1">Join FindIt and start reuniting items</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-secondary mb-1">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={inputClass('fullName')}
              />
              {errors.fullName && <p className="mt-1 text-xs text-error">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={inputClass('password') + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={inputClass('confirmPassword') + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>
              )}
            </div>

            
            {/* API error */}
            {apiError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-error">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
