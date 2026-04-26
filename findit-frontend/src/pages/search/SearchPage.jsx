import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FiSearch, FiPlus, FiX } from 'react-icons/fi'
import { searchItems } from '../../api/index'
import { getImageUrl } from '../../utils/helpers'
import SpeedDial from '../../UI/SpeedDial'

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All Categories', value: 'All Categories' },
  { label: 'Electronics', value: 'Electronics' },
  { label: 'Wallet/Bag', value: 'Wallet/Bag' },
  { label: 'Keys', value: 'Keys' },
  { label: 'Documents', value: 'Documents' },
  { label: 'Clothing', value: 'Clothing' },
  { label: 'Pets', value: 'Pets' },
  { label: 'Other', value: 'Other' },
]

const TYPE_TABS = [
  { key: 'all',   label: 'All Items'   },
  { key: 'lost',  label: 'Lost Items'  },
  { key: 'found', label: 'Found Items' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const gradientPurple = {
  background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 50%, #f97316 100%)',
}

// ── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  return type === 'lost'
    ? <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-600">Lost</span>
    : <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-600">Found</span>
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4" />
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

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FiSearch size={24} className="text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-600">No Items Found</p>
      <p className="text-xs text-gray-400 mt-1 mb-5">
        Try adjusting your search or filters to find what you&apos;re looking for.
      </p>
      <button
        onClick={onClear}
        className="px-5 py-2 rounded-lg border-2 border-purple-500 text-purple-600 text-xs font-semibold hover:bg-purple-50 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({ item }) {
  const navigate = useNavigate()
  const itemId = item._id ?? item.id
  const dateVal = item.date ?? item.dateLost ?? item.dateFound ?? item.createdAt

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {item.imageUrl
        ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full h-36 object-cover" />
        : <div className="w-full h-36 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
      }
      <div className="p-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
        <div className="flex flex-wrap gap-1">
          <TypeBadge type={item.type} />
          {item.claimInProgress && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700">
              Claim In Progress
            </span>
          )}
          {item.category && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-600">
              {item.category}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400">{formatDate(dateVal)}</p>
        {(item.location ?? item.locationFound) && (
          <p className="text-[10px] text-gray-500 truncate">
            📍 {item.location ?? item.locationFound}
          </p>
        )}
      </div>
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate(`/items/${itemId}`)}
          className="w-full text-center text-[10px] font-medium text-purple-600 hover:text-purple-800 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchPage() {
  // ── All existing logic preserved exactly ──────────────────────────────────
  const [searchParams] = useSearchParams()
  const urlCategory = searchParams.get('category') ?? ''

  const [query, setQuery]               = useState('')
  const [typeFilter, setTypeFilter]     = useState('all')
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All Categories')
  const [results, setResults]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [searched, setSearched]         = useState(false)

  const buildParams = useCallback((q = query) => {
    const params = {}
    if (q.trim()) params.keyword = q.trim()
    if (typeFilter !== 'all') params.type = typeFilter
    if (activeCategory && activeCategory !== 'All Categories') params.category = activeCategory
    return params
  }, [query, typeFilter, activeCategory])

  const runSearch = useCallback((params) => {
    setLoading(true)
    setSearched(true)
    searchItems(params)
      .then((res) => setResults(res.data?.items ?? res.data ?? []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    runSearch(buildParams(''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    runSearch(buildParams())
  }

  const handleClearFilters = () => {
    setTypeFilter('all')
    setActiveCategory('All Categories')
    setQuery('')
    runSearch({})
  }

  const handleTypeChange = (type) => {
    setTypeFilter(type)
    const params = buildParams()
    if (type !== 'all') params.type = type
    else delete params.type
    runSearch(params)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    const params = buildParams()
    if (cat !== 'All Categories') params.category = cat
    else delete params.category
    runSearch(params)
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Page header ── */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Browse Items</h1>
          <p className="text-xs text-gray-400 mt-0.5">Search through lost and found items.</p>
        </div>

        {/* ── Pink promo banner (only when no items match) ── */}
        {!loading && searched && results.length === 0 && (
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">🔔</span>
              <p className="text-xs text-red-600 font-medium">
                Nothing here yet. Be the first to report an item.
              </p>
            </div>
            <Link
              to="/items/lost/new"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[10px] font-semibold shrink-0 ml-3"
              style={gradientPurple}
            >
              <FiPlus size={10} />
              Report Item
            </Link>
          </div>
        )}

        {/* ── Search bar ── */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by item name, description, location..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-700 placeholder-gray-300 outline-none bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); runSearch(buildParams('')) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <FiX size={13} />
              </button>
            )}
          </div>
        </form>

        {/* ── Type filter tabs ── */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px] text-gray-400 mr-1">Item Status</span>
          {TYPE_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTypeChange(key)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                typeFilter === key
                  ? 'text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'
              }`}
              style={typeFilter === key ? gradientPurple : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Category pills ── */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          <span className="text-[10px] text-gray-400 mr-0.5">Category</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
                activeCategory === cat.value
                  ? 'text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'
              }`}
              style={activeCategory === cat.value ? gradientPurple : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Results card ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Results count */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">{results.length}</span>{' '}
              items
            </p>
          </div>

          <div className="p-4">
            {loading ? (
              <SkeletonGrid />
            ) : results.length === 0 ? (
              <EmptyState onClear={handleClearFilters} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.map((item) => (
                  <ResultCard key={item._id ?? item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Speed Dial */}
      <SpeedDial isAuthenticated={true} />
    </div>
  )
}
