import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit2, FiEye, FiArchive, FiClock } from 'react-icons/fi'
import { getActivity, archiveReport, getClaimHistory } from '../../api/index'
import { getImageUrl } from '../../utils/helpers'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

function TypeBadge({ type }) {
  return type === 'lost'
    ? <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Lost</span>
    : <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Found</span>
}

function StatusBadge({ status }) {
  const map = {
    active:   'bg-green-100 text-green-700',
    resolved: 'bg-gray-100 text-gray-600',
    archived: 'bg-amber-100 text-amber-700',
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-error',
    completed:'bg-blue-100 text-primary',
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status ?? '—'}
    </span>
  )
}

// ── Dot color by status ───────────────────────────────────────────────────────

function dotColor(status) {
  if (status === 'active') return 'bg-green-500'
  if (status === 'archived') return 'bg-amber-400'
  return 'bg-gray-400'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TimelineSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-gray-200 mt-1" />
            <div className="w-px flex-1 bg-gray-100 mt-1" />
          </div>
          <div className="flex-1 pb-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-lg" />
      ))}
    </div>
  )
}

// ── Reports tab ───────────────────────────────────────────────────────────────

const REPORT_FILTERS = ['all', 'active', 'resolved', 'archived']

function ReportsTab({ items, setItems, loading }) {
  const [filter, setFilter] = useState('all')
  const [archiving, setArchiving] = useState(null)

  const handleArchive = async (item) => {
    const itemId = item._id ?? item.id
    if (!window.confirm(`Archive "${item.title}"?`)) return
    setArchiving(itemId)
    try {
      await archiveReport(itemId)
      setItems((prev) =>
        prev.map((i) => (i._id ?? i.id) === itemId ? { ...i, status: 'archived' } : i)
      )
    } catch {
      // silently fail
    } finally {
      setArchiving(null)
    }
  }

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter)

  if (loading) return <TimelineSkeleton />

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {REPORT_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FiClock size={36} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No {filter !== 'all' ? filter : ''} reports</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gray-200" />
          <div className="space-y-0">
            {filtered.map((item, idx) => {
              const itemId = item._id ?? item.id
              const isActive = item.status === 'active'
              const isArchiving = archiving === itemId

              return (
                <div key={itemId ?? idx} className="flex gap-4 pb-6">
                  {/* Dot */}
                  <div className="flex flex-col items-center shrink-0 mt-1">
                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${dotColor(item.status)}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    {/* Thumbnail */}
                    {item.imageUrl
                      ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                      : <div className="w-12 h-12 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">—</div>
                    }

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary truncate">{item.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <TypeBadge type={item.type} />
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(item.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/items/${itemId}`}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <FiEye size={12} /> View
                      </Link>
                      {isActive && (
                        <>
                          <Link
                            to={`/items/${itemId}/edit`}
                            className="flex items-center gap-1 text-xs font-medium text-secondary hover:text-primary"
                          >
                            <FiEdit2 size={12} /> Edit
                          </Link>
                          <button
                            onClick={() => handleArchive(item)}
                            disabled={isArchiving}
                            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-secondary disabled:opacity-50"
                          >
                            {isArchiving ? <Spinner /> : <FiArchive size={12} />}
                            Archive
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Claims tab ────────────────────────────────────────────────────────────────

const CLAIM_FILTERS = ['all', 'pending', 'completed']

function ClaimsTab() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (fetched) return
    setLoading(true)
    getClaimHistory()
      .then((res) => { setClaims(res.data?.claims ?? res.data ?? []); setFetched(true) })
      .catch(() => { setClaims([]); setFetched(true) })
      .finally(() => setLoading(false))
  }, [fetched])

  const filtered = filter === 'all'
    ? claims
    : filter === 'completed'
      ? claims.filter((c) => ['approved', 'completed', 'rejected'].includes(c.status))
      : claims.filter((c) => c.status === 'pending')

  if (loading) return <TableSkeleton />

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {CLAIM_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-secondary hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="px-4 py-3 text-left">My Role</th>
                <th className="px-4 py-3 text-left">Date Submitted</th>
                <th className="px-4 py-3 text-left">Outcome</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    No {filter !== 'all' ? filter : ''} claims
                  </td>
                </tr>
              ) : (
                filtered.map((claim) => {
                  const claimId = claim._id ?? claim.id
                  const role = claim.role ?? (claim.isClaimant ? 'Claimant' : 'Finder')
                  return (
                    <tr key={claimId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-secondary max-w-[180px] truncate">
                        {claim.itemTitle ?? claim.item?.title ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{role}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(claim.createdAt)}</td>
                      <td className="px-4 py-3"><StatusBadge status={claim.status} /></td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/claims/${claimId}`}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          View Details
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
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState('reports')
  const [items, setItems] = useState([])
  const [loadingReports, setLoadingReports] = useState(true)

  useEffect(() => {
    getActivity()
      .then((res) => setItems(res.data?.items ?? res.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoadingReports(false))
  }, [])

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-secondary">History</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { key: 'reports', label: 'My Reports' },
            { key: 'claims',  label: 'My Claims'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'reports'
        ? <ReportsTab items={items} setItems={setItems} loading={loadingReports} />
        : <ClaimsTab />
      }
    </div>
  )
}
