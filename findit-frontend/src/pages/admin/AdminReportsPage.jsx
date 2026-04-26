import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import { getReports, removeReport } from '../../api/index'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function StatusBadge({ status }) {
  return status === 'resolved'
    ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Resolved</span>
    : <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Pending</span>
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }) {
  return (
    <tr>
      <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
        No {tab !== 'all' ? tab : 'flagged'} reports found
      </td>
    </tr>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const TABS = ['all', 'pending', 'resolved']

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    getReports()
      .then((res) => {
        console.log('Admin reports response:', res)
        const reportsData = res.data?.reports ?? res.data ?? []
        setReports(reportsData)
      })
      .catch((error) => {
        console.error('Error fetching admin reports:', error)
        setReports([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (report) => {
    const reportId = report._id ?? report.id
    if (!window.confirm('Remove this listing? This cannot be undone.')) return
    setRemoving(reportId)
    try {
      await removeReport(reportId)
      setReports((prev) =>
        prev.map((r) =>
          (r._id ?? r.id) === reportId ? { ...r, status: 'resolved' } : r
        )
      )
    } catch {
      // silently fail — state unchanged
    } finally {
      setRemoving(null)
    }
  }

  const filtered = activeTab === 'all'
    ? reports
    : reports.filter((r) => r.status === activeTab)

  if (loading) return <Skeleton />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-secondary">Flagged Reports</h1>
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-error">
          {reports.length}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Item Title</th>
                <th className="px-4 py-3 text-left">Reported By</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Date Flagged</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                filtered.map((report) => {
                  const reportId = report._id ?? report.id
                  const itemId = report.itemId ?? report.item?._id ?? report.item?.id
                  const isPending = report.status !== 'resolved'
                  const isRemoving = removing === reportId

                  return (
                    <tr key={reportId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-secondary max-w-[180px] truncate">
                        {report.itemTitle ?? report.item?.title ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {report.reportedBy ?? report.reporter?.username ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                        {report.reason ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(report.createdAt ?? report.flaggedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report.status ?? 'pending'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {isPending && (
                            <button
                              onClick={() => handleRemove(report)}
                              disabled={isRemoving}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-error text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                            >
                              {isRemoving ? (
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                              ) : (
                                <FiTrash2 size={11} />
                              )}
                              Remove
                            </button>
                          )}
                          {itemId && (
                            <Link
                              to={`/items/${itemId}`}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              View Item
                            </Link>
                          )}
                        </div>
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
