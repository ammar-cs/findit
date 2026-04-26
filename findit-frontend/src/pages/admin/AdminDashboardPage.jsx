import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiFlag, FiTag, FiList } from 'react-icons/fi'
import { getAnalytics, promoteToAdmin } from '../../api/index'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function TypeBadge({ type }) {
  return type === 'lost'
    ? <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Lost</span>
    : <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Found</span>
}

function StatusBadge({ status }) {
  const map = {
    active:   'bg-green-100 text-green-700',
    resolved: 'bg-gray-100 text-gray-600',
    pending:  'bg-amber-100 text-amber-700',
    flagged:  'bg-red-100 text-error',
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status ?? 'unknown'}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, borderColor }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${borderColor}`}>
      <p className="text-4xl font-bold text-secondary">{value ?? 0}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// ── Quick action card ─────────────────────────────────────────────────────────

function QuickCard({ icon, title, badge, btnLabel, to }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-secondary font-semibold">
          {icon}
          {title}
        </div>
        {badge != null && badge > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-error">{badge}</span>
        )}
      </div>
      <button
        onClick={() => navigate(to)}
        className="mt-auto w-full py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {btnLabel}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

// ── User Management Component ─────────────────────────────────────────────

function UserManagement() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handlePromote = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage('Please enter an email address')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      await promoteToAdmin(email.trim())
      setMessage(`Success! ${email.trim()} promoted to admin`)
      setEmail('')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to promote user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-semibold text-secondary mb-4">User Management</h2>
      <form onSubmit={handlePromote} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : null}
            Promote to Admin
          </button>
        </div>
        {message && (
          <div className={`rounded-lg px-3 py-2 text-sm ${
            message.includes('Success') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAnalytics()
      .then((res) => {
        console.log('Admin analytics response:', res)
        const analyticsData = res.data?.analytics ?? res.data ?? {}
        setAnalytics(analyticsData)
      })
      .catch((error) => {
        console.error('Error fetching admin analytics:', error)
        setAnalytics({})
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  const stats = analytics?.stats ?? {}
  const recentActivity = analytics?.recentActivity ?? []
  const flaggedCount = analytics?.flaggedCount ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-secondary">Admin Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports"    value={stats.totalReports}    borderColor="border-l-primary" />
        <StatCard label="Resolved Cases"   value={stats.resolvedCases}   borderColor="border-l-green-500" />
        <StatCard label="Pending Claims"   value={stats.pendingClaims}   borderColor="border-l-accent" />
        <StatCard label="Flagged Listings" value={stats.flaggedListings ?? flaggedCount} borderColor="border-l-error" />
      </div>

      {/* Recent activity table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-secondary">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Item Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    No recent activity
                  </td>
                </tr>
              ) : (
                recentActivity.slice(0, 10).map((item, idx) => {
                  const itemId = item._id ?? item.id
                  return (
                    <tr key={itemId ?? idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-secondary max-w-[200px] truncate">
                        {item.title ?? '—'}
                      </td>
                      <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/items/${itemId}`}
                          className="text-primary text-xs font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management */}
      <div className="space-y-6">
        <UserManagement />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          icon={<FiFlag size={16} className="text-error" />}
          title="Flagged Reports"
          badge={flaggedCount}
          btnLabel="Review Now"
          to="/admin/reports"
        />
        <QuickCard
          icon={<FiTag size={16} className="text-primary" />}
          title="Manage Categories"
          btnLabel="Manage"
          to="/admin/categories"
        />
        <QuickCard
          icon={<FiList size={16} className="text-secondary" />}
          title="All Items"
          btnLabel="Browse"
          to="/search"
        />
      </div>
    </div>
  )
}
