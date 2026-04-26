import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiPackage, FiPlus, FiTrendingUp, FiAlertCircle, FiGrid, FiCheckCircle } from 'react-icons/fi'
import { searchItems } from '../../api/index'
import useAuth from '../../store/useAuth'
import { getImageUrl } from '../../utils/helpers'
import SpeedDial from '../../UI/SpeedDial'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Gradient style reused across elements ─────────────────────────────────────

const gradientBg = {
  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
}

const gradientText = {
  background: 'linear-gradient(135deg, #9333ea, #ec4899, #f97316)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  return type === 'lost'
    ? <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-600">Lost</span>
    : <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-600">Found</span>
}

// ── Recent item card ──────────────────────────────────────────────────────────

function RecentCard({ item }) {
  const navigate = useNavigate()
  const itemId = item._id ?? item.id
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {item.imageUrl
        ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-36 object-cover" />
        : <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
      }
      <div className="p-3 space-y-1.5">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
        <div className="flex flex-wrap gap-1.5">
          <TypeBadge type={item.type} />
          {item.claimInProgress && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
              Claim In Progress
            </span>
          )}
          {item.category && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-600">
              {item.category}
            </span>
          )}
        </div>
        {(item.location ?? item.locationFound) && (
          <p className="text-xs text-gray-400 truncate">📍 {item.location ?? item.locationFound}</p>
        )}
        <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
      </div>
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate(`/items/${itemId}`)}
          className="w-full text-center text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors py-1.5 rounded-lg hover:bg-purple-50"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RecentSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
              <div className="h-4 w-16 bg-gray-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── How it works steps ────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '1',
    title: 'Report Item',
    desc: 'Submit details about the lost or found item with a photo and description.',
  },
  {
    num: '2',
    title: 'Admin Approval',
    desc: 'Our team reviews and approves the submission to ensure quality.',
  },
  {
    num: '3',
    title: 'Get Connected',
    desc: 'People can contact you directly through the provided contact information.',
  },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function HomePage() {
  // ── All existing logic preserved ─────────────────────────────────────────
  const { token } = useAuth()
  const isAuthenticated = !!token
  const navigate = useNavigate()

  const [recentItems, setRecentItems] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    searchItems({ limit: 6 })
      .then((res) => setRecentItems(res.data?.items ?? res.data ?? []))
      .catch(() => setRecentItems([]))
      .finally(() => setRecentLoading(false))
  }, [])
  // ─────────────────────────────────────────────────────────────────────────

  // Derive stats from fetched items
  const totalItems  = recentItems.length
  const lostItems   = recentItems.filter((i) => i.type === 'lost').length
  const allItems    = recentItems.length
  const foundItems  = recentItems.filter((i) => i.type === 'found').length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section
        className="w-full py-16 px-4 text-center"
        style={gradientBg}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
          Find What You&apos;ve Lost,
        </h1>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          Return What You&apos;ve Found
        </h1>
        <p className="text-white/80 text-sm max-w-md mx-auto mb-8">
          Join our community-driven platform to reunite lost items with their rightful
          owners. Together, we make finding easier.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? '/items/lost/new' : '/login'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-white text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <FiPlus size={14} />
            Report an Item
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            <FiSearch size={14} />
            Browse Items
          </Link>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">

          {/* Total */}
          <div className="flex flex-col items-center py-3 px-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'linear-gradient(135deg, #e9d5ff, #f3e8ff)' }}>
              <FiTrendingUp size={14} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total Items</p>
          </div>

          {/* Lost */}
          <div className="flex flex-col items-center py-3 px-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-red-50">
              <FiAlertCircle size={14} className="text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{lostItems}</p>
            <p className="text-xs text-gray-400 mt-0.5">Lost Items</p>
          </div>

          {/* All Items */}
          <div className="flex flex-col items-center py-3 px-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-green-50">
              <FiGrid size={14} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{allItems}</p>
            <p className="text-xs text-gray-400 mt-0.5">All Items</p>
          </div>

          {/* Found */}
          <div className="flex flex-col items-center py-3 px-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-blue-50">
              <FiCheckCircle size={14} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{foundItems}</p>
            <p className="text-xs text-gray-400 mt-0.5">Found</p>
          </div>

        </div>
      </section>

      {/* ── Recent Items ── */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Recent Items</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest lost and found items posted by our community.
              </p>
            </div>
            <Link
              to="/search"
              className="text-xs font-medium flex items-center gap-1 mt-1"
              style={gradientText}
            >
              View All →
            </Link>
          </div>

          <div className="mt-5">
            {recentLoading ? (
              <RecentSkeleton />
            ) : recentItems.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-xl border border-gray-100 py-14 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <FiSearch size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600">No items yet</p>
                <p className="text-xs text-gray-400 mt-1 mb-5">
                  Be the first to report a lost or found item.
                </p>
                <button
                  onClick={() => navigate(isAuthenticated ? '/items/lost/new' : '/login')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-xs font-medium"
                  style={gradientBg}
                >
                  <FiPlus size={12} />
                  Report Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentItems.map((item) => (
                  <RecentCard key={item._id ?? item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">How It Works</h2>
          <p className="text-xs text-gray-400 mb-10">
            Our simple 3-step process makes it easy to report and find lost items.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shadow-sm"
                  style={gradientBg}
                >
                  {num}
                </div>
                <p className="text-sm font-semibold text-gray-700">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Empty spacer section (matches Figma gray block) ── */}
      <section className="bg-gray-50 py-12" />

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-6 px-4 text-center">
        <p className="text-white text-sm font-medium">Lost &amp; Found Management System</p>
        <p className="text-gray-500 text-xs mt-1">
          This is for demo purposes only for our community.
        </p>
      </footer>

      {/* ── Floating Speed Dial ── */}
      <SpeedDial isAuthenticated={isAuthenticated} />

    </div>
  )
}
