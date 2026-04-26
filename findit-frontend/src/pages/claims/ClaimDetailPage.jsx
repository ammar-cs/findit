import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiXCircle, FiClock, FiDownload, FiAlertCircle } from 'react-icons/fi'
import { getClaim, approveClaim, rejectClaim, completeClaim } from '../../api/index'
import useAuth from '../../store/useAuth'
import { getImageUrl } from '../../utils/helpers'
import Card from '../../UI/card/Card'
import CardHeader from '../../UI/card/CardHeader'
import CardBody from '../../UI/card/CardBody'
import CardActions from '../../UI/card/CardActions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ── Status banner (claimant view) ─────────────────────────────────────────────

function StatusBanner({ status }) {
  const map = {
    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon: <FiClock size={16} />, msg: 'Your claim is under review' },
    approved: { bg: 'bg-green-50 border-green-200', text: 'text-green-800', icon: <FiCheckCircle size={16} />, msg: 'Your claim was approved!' },
    rejected: { bg: 'bg-red-50 border-red-200', text: 'text-error', icon: <FiXCircle size={16} />, msg: 'Your claim was rejected' },
    completed: { bg: 'bg-blue-50 border-blue-200', text: 'text-primary', icon: <FiCheckCircle size={16} />, msg: 'Item successfully returned' },
  }
  const cfg = map[status] ?? map.pending
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      <span className="text-sm font-medium">{cfg.msg}</span>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-error',
    completed: 'bg-blue-100 text-primary',
  }
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Item summary card ─────────────────────────────────────────────────────────

function ItemSummary({ item }) {
  if (!item) return null
  const location = item.location ?? item.locationFound
  return (
    <Card>
      <CardBody>
        <div className="flex gap-4">
          {item.imageUrl
            ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
            : <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">No img</div>
          }
          <div className="space-y-1">
            <p className="font-semibold text-secondary">{item.title}</p>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {item.type}
            </span>
            {location && <p className="text-xs text-gray-500">📍 {location}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ── Evidence file list ────────────────────────────────────────────────────────

function EvidenceList({ files = [] }) {
  if (!files.length) return <p className="text-sm text-gray-400 italic">No evidence files uploaded</p>
  return (
    <ul className="space-y-2">
      {files.map((f, i) => (
        <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-sm text-secondary truncate">{f.filename ?? f.name ?? `File ${i + 1}`}</span>
          {f.url && (
            <a href={f.url} download className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 ml-2">
              <FiDownload size={12} /> Download
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function Timeline({ events = [] }) {
  if (!events.length) return null
  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0" />
            {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
          </div>
          <div className="pb-3">
            <p className="text-sm font-medium text-secondary">{ev.label ?? ev.event}</p>
            <p className="text-xs text-gray-400">{formatDate(ev.timestamp ?? ev.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-28 bg-gray-100 rounded-2xl" />
      <div className="h-40 bg-gray-100 rounded-2xl" />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ClaimDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id ?? user?._id ?? ''

  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const fetchClaim = useCallback(() => {
    setLoading(true)
    getClaim(id)
      .then((res) => setClaim(res.data?.claim ?? res.data ?? null))
      .catch(() => setError('Failed to load claim details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchClaim() }, [fetchClaim])

  const handleAction = async (action, confirmMsg, apiFn) => {
    if (!window.confirm(confirmMsg)) return
    setActionLoading(action)
    try {
      await apiFn(id)
      fetchClaim()
    } catch {
      // silently refetch
    } finally {
      setActionLoading('')
    }
  }

  if (loading) return <Skeleton />

  if (error) return (
    <div className="max-w-2xl mx-auto rounded-lg bg-red-50 border border-red-200 px-4 py-4">
      <p className="text-sm text-error">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-2 text-sm text-primary hover:underline">Go back</button>
    </div>
  )

  if (!claim) return null

  const claimId = claim._id ?? claim.id
  const claimantId = claim.claimantId?._id ?? claim.claimantId?.id ?? claim.claimantId
  const finderId = claim.finderId?._id ?? claim.finderId?.id ?? claim.finderId
  const isClaimant = userId && String(claimantId) === String(userId)
  const isFinder = userId && String(finderId) === String(userId)
  const status = claim.status ?? 'pending'
  const item = claim.item ?? claim.itemId ?? null
  const evidenceFiles = claim.evidence ?? claim.evidenceFiles ?? []
  const timeline = claim.timeline ?? claim.events ?? []

  // ── CLAIMANT VIEW ──────────────────────────────────────────────────────────
  if (isClaimant) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-secondary">My Claim</h1>

        <StatusBanner status={status} />

        <ItemSummary item={item} />

        {/* Submission details */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-secondary">Your Submission</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-secondary">{claim.description ?? '—'}</p>
            </div>
            {claim.uniqueDetails && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Unique Details</p>
                <p className="text-sm text-secondary">{claim.uniqueDetails}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Evidence Files</p>
              <EvidenceList files={evidenceFiles} />
            </div>
          </CardBody>
        </Card>

        {/* Handover instructions — only when approved */}
        {(status === 'approved' || status === 'completed') && (
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                <FiCheckCircle size={14} /> Handover Instructions
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {['Meet in a public place', 'Bring a valid ID', 'Confirm item condition before signing off'].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-secondary">
                    <FiCheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-secondary">Timeline</h2>
            </CardHeader>
            <CardBody>
              <Timeline events={timeline} />
            </CardBody>
          </Card>
        )}
      </div>
    )
  }

  // ── FINDER VIEW ────────────────────────────────────────────────────────────
  if (isFinder) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary">Claim Request</h1>
          <StatusBadge status={status} />
        </div>

        <ItemSummary item={item} />

        {/* Claimant evidence */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-secondary">Claimant&apos;s Evidence</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-secondary">{claim.description ?? '—'}</p>
            </div>
            {claim.uniqueDetails && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Unique Details</p>
                <p className="text-sm text-secondary">{claim.uniqueDetails}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Uploaded Files</p>
              <EvidenceList files={evidenceFiles} />
            </div>
          </CardBody>

          {/* Pending actions */}
          {status === 'pending' && (
            <CardActions>
              <button
                onClick={() => handleAction('approve', 'Approve this claim?', approveClaim)}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {actionLoading === 'approve' ? <Spinner /> : <FiCheckCircle size={14} />}
                Approve Claim
              </button>
              <button
                onClick={() => handleAction('reject', 'Reject this claim?', rejectClaim)}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-error text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {actionLoading === 'reject' ? <Spinner /> : <FiXCircle size={14} />}
                Reject Claim
              </button>
            </CardActions>
          )}

          {/* Approved — confirm return */}
          {status === 'approved' && (
            <CardActions>
              <button
                onClick={() => handleAction('complete', 'Confirm the item has been returned?', completeClaim)}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {actionLoading === 'complete' ? <Spinner /> : <FiCheckCircle size={14} />}
                Confirm Item Returned
              </button>
            </CardActions>
          )}
        </Card>
      </div>
    )
  }

  // ── Fallback (admin or unknown viewer) ─────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary">Claim #{claimId}</h1>
        <StatusBadge status={status} />
      </div>
      <ItemSummary item={item} />
      <Card>
        <CardBody>
          <p className="text-sm text-gray-500">You do not have a specific role in this claim.</p>
        </CardBody>
      </Card>
    </div>
  )
}
