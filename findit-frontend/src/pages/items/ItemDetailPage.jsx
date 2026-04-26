import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiEdit2, FiCheckCircle, FiTrash2, FiFlag, FiEye, FiMessageCircle, FiX } from 'react-icons/fi'
import { getItem, resolveItem } from '../../api/index'
import { getMatches } from '../../api/index'
import { removeReport } from '../../api/index'
import { sendFinderMessage } from '../../api/index'
import useAuth from '../../store/useAuth'
import { getImageUrl } from '../../utils/helpers'
import Card from '../../UI/card/Card'
import CardBody from '../../UI/card/CardBody'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// ── Map Component ──────────────────────────────────────────────────────────────

function ItemMap({ coordinates }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  useEffect(() => {
    if (!coordinates || !coordinates.lat || !coordinates.lng || !mapContainer.current) {
      return
    }

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [coordinates.lng, coordinates.lat],
      zoom: 14,
    })

    // Add marker
    new mapboxgl.Marker()
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(map.current)

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [coordinates])

  if (!coordinates || !coordinates.lat || !coordinates.lng) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-500">Location not available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="h-96 w-full" />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

function TypeBadge({ type }) {
  return type === 'lost'
    ? <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Lost</span>
    : <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Found</span>
}

function StatusBadge({ status, claimInProgress }) {
  if (claimInProgress)
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Claim In Progress</span>
  if (status === 'resolved')
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">Resolved</span>
  if (status === 'pending')
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Pending</span>
  return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>
}

function CategoryBadge({ category }) {
  return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-primary">{category}</span>
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
      <div className="lg:w-3/5 space-y-4">
        <div className="w-full h-72 bg-gray-200 rounded-2xl" />
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 w-40 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
      <div className="lg:w-2/5 space-y-4">
        <div className="h-8 w-3/4 bg-gray-200 rounded" />
        <div className="flex gap-2">{[...Array(3)].map((_, i) => <div key={i} className="h-6 w-20 bg-gray-100 rounded-full" />)}</div>
        <div className="h-px bg-gray-200" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded w-full" />)}
      </div>
    </div>
  )
}

// ── Match card ────────────────────────────────────────────────────────────────

function MatchCard({ match }) {
  return (
    <div className="shrink-0 w-40 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {match.imageUrl
        ? <img src={getImageUrl(match.imageUrl)} alt={match.title} className="w-full h-24 object-cover" />
        : <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No image</div>
      }
      <div className="p-2">
        <p className="text-xs font-medium text-secondary truncate">{match.title}</p>
        <TypeBadge type={match.type} />
        <Link
          to={`/items/${match._id ?? match.id}`}
          className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <FiEye size={12} /> View
        </Link>
      </div>
    </div>
  )
}

// ── "I Found It" Modal ────────────────────────────────────────────────────────

function FoundItModal({ onClose, onSend, loading }) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSend(message.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-secondary">I Found This Item!</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Send a message to the person who lost this item. They'll receive a notification with your message.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. I found a wallet matching your description near the library. Contact me to arrange pickup."
            rows={4}
            maxLength={500}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-gray-400 text-right">{message.length}/500</p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-100 text-secondary rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {loading ? <Spinner /> : <FiMessageCircle size={14} />}
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const userId = user?.id ?? user?._id ?? ''
  const isAuthenticated = !!token

  const [item, setItem] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolving, setResolving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [showFoundModal, setShowFoundModal] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError('')
    Promise.all([getItem(id), getMatches(id)])
      .then(([itemRes, matchRes]) => {
        setItem(itemRes.data?.item ?? itemRes.data ?? null)
        setMatches(matchRes.data?.matches ?? matchRes.data ?? [])
      })
      .catch(() => setError('Failed to load item details.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleResolve = async () => {
    setResolving(true)
    try {
      await resolveItem(id)
      fetchData()
    } catch {
      // silently refetch — error visible via item state
    } finally {
      setResolving(false)
    }
  }

  const handleRemove = async () => {
    if (!window.confirm('Are you sure you want to remove this listing? This cannot be undone.')) return
    setRemoving(true)
    try {
      await removeReport(id)
      navigate('/admin/reports')
    } catch {
      setRemoving(false)
    }
  }

  const handleContact = async (message) => {
    setContactLoading(true)
    try {
      await sendFinderMessage(id, message)
      setContactSuccess(true)
      setShowFoundModal(false)
    } catch {
      // silently fail — user can retry
    } finally {
      setContactLoading(false)
    }
  }

  if (loading) return <div className="py-16"><Skeleton /></div>

  if (error) return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 max-w-lg mx-auto mt-8">
      <p className="text-sm text-error">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-2 text-sm text-primary hover:underline">Go back</button>
    </div>
  )

  if (!item) return null

  const itemId = item._id ?? item.id
  // item.userId is populated as an object { _id, name, username } from the backend
  const itemOwnerId = String(item.userId?._id ?? item.userId?.id ?? item.userId ?? '')
  const isOwner = !!userId && itemOwnerId === String(userId)
  const isAdmin = user?.role === 'admin'
  const canClaim = item.type === 'found' && isAuthenticated && !isOwner
  const canContact = item.type === 'lost' && isAuthenticated && !isOwner && item.status !== 'resolved'
  const dateLabel = item.type === 'lost' ? 'Date Lost' : 'Date Found'
  const dateValue = item.date ?? item.dateLost ?? item.dateFound
  const locationLabel = item.type === 'lost' ? 'Last Seen Location' : 'Found Location'
  const locationValue = item.location ?? item.locationFound

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── "I Found It" modal ── */}
      {showFoundModal && (
        <FoundItModal
          onClose={() => setShowFoundModal(false)}
          onSend={handleContact}
          loading={contactLoading}
        />
      )}

      {/* ── Left column (60%) ── */}
      <div className="lg:w-3/5 space-y-6">

        {/* Main image */}
        {item.imageUrl
          ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-full max-h-96 object-cover rounded-2xl border border-gray-100 shadow-sm" />
          : <div className="w-full h-72 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">No image available</div>
        }

        {/* Suggested matches */}
        {matches.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-secondary mb-3">Suggested Matches</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {matches.slice(0, 4).map((m) => (
                <MatchCard key={m._id ?? m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right column (40%) ── */}
      <div className="lg:w-2/5">
        <Card>
          <CardBody className="space-y-4">

            {/* Title */}
            <h1 className="text-2xl font-bold text-secondary">{item.title}</h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={item.type} />
              {item.category && <CategoryBadge category={item.category} />}
              <StatusBadge status={item.status} claimInProgress={item.claimInProgress} />
            </div>

            <hr className="border-gray-100" />

            {/* Details grid */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Description</dt>
                <dd className="text-secondary leading-relaxed">{item.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{dateLabel}</dt>
                <dd className="text-secondary">{formatDate(dateValue)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{locationLabel}</dt>
                <dd className="text-secondary">{locationValue ?? '—'}</dd>
              </div>

            {/* Map */}
            {item.coordinates && (
              <div className="col-span-2">
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Location Map</dt>
                <dd>
                  <ItemMap coordinates={item.coordinates} />
                </dd>
              </div>
            )}
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Posted by</dt>
                <dd className="text-secondary">{item.user?.username ?? item.userId?.username ?? item.username ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Posted on</dt>
                <dd className="text-secondary">{formatDate(item.createdAt)}</dd>
              </div>
            </dl>

            <hr className="border-gray-100" />

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              {isOwner && (
                <>
                  <Link
                    to={`/items/${itemId}/edit`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiEdit2 size={14} /> Edit
                  </Link>
                  {item.status !== 'resolved' && (
                    <button
                      onClick={handleResolve}
                      disabled={resolving}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-gray-100 text-secondary rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors"
                    >
                      {resolving ? <Spinner /> : <FiCheckCircle size={14} />}
                      Mark Resolved
                    </button>
                  )}
                </>
              )}

              {canClaim && (
                <button
                  onClick={() => navigate(`/claims/new?itemId=${itemId}`)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit a Claim
                </button>
              )}

              {canContact && (
                contactSuccess ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <FiCheckCircle size={14} /> Message sent!
                  </div>
                ) : (
                  <button
                    onClick={() => setShowFoundModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FiMessageCircle size={14} /> I Found This Item!
                  </button>
                )
              )}

              {isAdmin && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-error text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                >
                  {removing ? <Spinner /> : <FiTrash2 size={14} />}
                  Remove Listing
                </button>
              )}
            </div>

            {/* Flag link — non-owners only */}
            {!isOwner && isAuthenticated && (
              <div className="pt-1">
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-error transition-colors">
                  <FiFlag size={12} /> Report this listing
                </button>
              </div>
            )}

          </CardBody>
        </Card>
      </div>

    </div>
  )
}
