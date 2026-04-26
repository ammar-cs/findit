import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiPackage, FiSearch, FiX, FiEdit2, FiCheckCircle } from 'react-icons/fi'
import { getMyItems, resolveItem } from '../../api/index'
import { getClaimHistory } from '../../api/index'
import { getImageUrl } from '../../utils/helpers'
import Card from '../../UI/card/Card'
import CardBody from '../../UI/card/CardBody'
import CardActions from '../../UI/card/CardActions'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

function StatusBadge({ status }) {
  if (status === 'resolved')
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Resolved</span>
  if (status === 'pending')
    return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending</span>
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>
}

function CategoryBadge({ category }) {
  return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-primary">{category}</span>
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, borderColor }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${borderColor}`}>
      <p className="text-3xl font-bold text-secondary">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-24 bg-gray-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FiPackage size={40} className="text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium mb-4">No reports yet</p>
      <div className="flex gap-3">
        <Link
          to="/items/lost/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiSearch size={14} /> Post Lost Item
        </Link>
        <Link
          to="/items/found/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiPackage size={14} /> Post Found Item
        </Link>
      </div>
    </div>
  )
}

// ── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({ item, onResolved }) {
  const [resolving, setResolving] = useState(false)
  const itemId = item._id ?? item.id

  const handleResolve = async () => {
    setResolving(true)
    try {
      await resolveItem(itemId)
      onResolved('Item marked as resolved.')
    } catch {
      // ignore — parent will refetch
    } finally {
      setResolving(false)
    }
  }

  return (
    <Card>
      {item.imageUrl
        ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-24 object-cover" />
        : <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
      }
      <CardBody className="space-y-2">
        <p className="text-sm font-semibold text-secondary truncate">{item.title}</p>
        <div className="flex flex-wrap gap-1">
          {item.category && <CategoryBadge category={item.category} />}
          <StatusBadge status={item.status} />
        </div>
        <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
      </CardBody>
      <CardActions className="flex-wrap gap-2">
        <Link
          to={`/items/${itemId}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          View
        </Link>
        <Link
          to={`/items/${itemId}/edit`}
          className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary"
        >
          <FiEdit2 size={11} /> Edit
        </Link>
        {item.status !== 'resolved' && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-secondary disabled:opacity-50"
          >
            {resolving ? <Spinner /> : <FiCheckCircle size={11} />}
            Resolve
          </button>
        )}
      </CardActions>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PersonalDashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [banner, setBanner] = useState(location.state?.message ?? '')
  const [activeTab, setActiveTab] = useState('lost')

  const fetchItems = useCallback(() => {
    setLoading(true)
    Promise.all([getMyItems(), getClaimHistory()])
      .then(([itemsRes, claimsRes]) => {
        setItems(itemsRes.data?.items ?? itemsRes.data ?? [])
        setClaims(claimsRes.data?.claims ?? claimsRes.data ?? [])
      })
      .catch(() => {
        setItems([])
        setClaims([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  // Clear router state message after reading so it doesn't reappear on refresh
  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolved = (msg) => {
    setBanner(msg)
    fetchItems()
  }

  // ── Stats
  const total = items.length
  const active = items.filter((i) => i.status === 'active').length
  const resolved = items.filter((i) => i.status === 'resolved').length
  const pending = claims.filter((c) => c.status === 'pending' && c.role === 'Finder').length

  // ── Filtered items for active tab
  const tabItems = items.filter((i) => i.type === activeTab)

  return (
    <div className="space-y-6">

      {/* Success banner */}
      {banner && (
        <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm text-green-700">{banner}</p>
          <button onClick={() => setBanner('')} aria-label="Dismiss" className="text-green-500 hover:text-green-700">
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">My Dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/items/lost/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiSearch size={13} /> Lost Item
          </Link>
          <Link
            to="/items/found/new"
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-300 text-secondary rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiPackage size={13} /> Found Item
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reports" value={total} borderColor="border-l-primary" />
        <StatCard label="Active" value={active} borderColor="border-l-green-500" />
        <StatCard label="Resolved" value={resolved} borderColor="border-l-gray-400" />
        <StatCard label="Pending Claims" value={pending} borderColor="border-l-accent" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6" aria-label="Item tabs">
          {['lost', 'found'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-secondary'
              }`}
            >
              My {tab === 'lost' ? 'Lost' : 'Found'} Items
            </button>
          ))}
        </nav>
      </div>

      {/* Items grid */}
      {loading ? (
        <GridSkeleton />
      ) : tabItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tabItems.map((item) => (
            <ItemCard key={item._id ?? item.id} item={item} onResolved={handleResolved} />
          ))}
        </div>
      )}

    </div>
  )
}
