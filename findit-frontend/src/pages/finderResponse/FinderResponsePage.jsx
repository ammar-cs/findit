import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiCheckCircle, FiXCircle, FiMapPin, FiClock,
  FiMessageCircle, FiUser, FiCalendar,
} from 'react-icons/fi'
import {
  getFinderResponse,
  getFinderResponseByItem,
  acceptFinderResponse,
  declineFinderResponse,
  markAsReturned,
  completeFinderResponse,
} from '../../api/index'
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

function formatDateOnly(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
)

// ── Status banner ─────────────────────────────────────────────────────────────

function StatusBanner({ status, isPoster }) {
  const map = {
    pending: {
      bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800',
      icon: <FiClock size={16} />,
      msg: isPoster ? 'Someone says they found your item — review their message below' : 'Waiting for the owner to respond',
    },
    accepted: {
      bg: 'bg-green-50 border-green-200', text: 'text-green-800',
      icon: <FiCheckCircle size={16} />,
      msg: 'Meetup arranged! Check the details below',
    },
    declined: {
      bg: 'bg-red-50 border-red-200', text: 'text-error',
      icon: <FiXCircle size={16} />,
      msg: isPoster ? 'You declined this message' : 'The owner declined your message',
    },
    pending_confirmation: {
      bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800',
      icon: <FiClock size={16} />,
      msg: isPoster ? 'Confirm you received your item!' : 'Waiting for the owner to confirm receipt',
    },
    completed: {
      bg: 'bg-blue-50 border-blue-200', text: 'text-primary',
      icon: <FiCheckCircle size={16} />,
      msg: 'Item successfully returned!',
    },
  }
  const cfg = map[status] ?? map.pending
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      <span className="text-sm font-medium">{cfg.msg}</span>
    </div>
  )
}

// ── Item summary ──────────────────────────────────────────────────────────────

function ItemSummary({ item }) {
  if (!item) return null
  return (
    <Card>
      <CardBody>
        <div className="flex gap-4">
          {item.imageUrl
            ? <img src={getImageUrl(item.imageUrl)} alt={item.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
            : <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs">No img</div>
          }
          <div className="space-y-1.5">
            <p className="font-semibold text-secondary">{item.title}</p>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Lost</span>
            {item.location && <p className="text-xs text-gray-500">📍 {item.location}</p>}
            {item.date && <p className="text-xs text-gray-400">Lost on {formatDateOnly(item.date)}</p>}
          </div>
        </div>
      </CardBody>
    </Card>
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
            <p className="text-sm font-medium text-secondary">{ev.event}</p>
            <p className="text-xs text-gray-400">{formatDate(ev.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Meetup details (shown after accepted) ────────────────────────────────────

function MeetupDetails({ response }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-green-700 flex items-center gap-2">
          <FiCheckCircle size={14} /> Meetup Details
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="flex items-start gap-3">
          <FiMapPin size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
            <p className="text-sm text-secondary">{response.meetupLocation}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FiCalendar size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Date & Time</p>
            <p className="text-sm text-secondary">{formatDate(response.meetupTime)}</p>
          </div>
        </div>
        {response.meetupNotes && (
          <div className="flex items-start gap-3">
            <FiMessageCircle size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Notes</p>
              <p className="text-sm text-secondary">{response.meetupNotes}</p>
            </div>
          </div>
        )}
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-primary font-medium mb-1">Reminder</p>
          <ul className="space-y-1">
            {['Meet in a public place', 'Bring a valid ID', 'Confirm the item before signing off'].map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-xs text-secondary">
                <FiCheckCircle size={11} className="text-green-500 shrink-0" /> {tip}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  )
}

// ── Accept form (poster fills in meetup details) ──────────────────────────────

function AcceptForm({ onAccept, onDecline, loading }) {
  const [location, setLocation] = useState('')
  const [time, setTime]         = useState('')
  const [notes, setNotes]       = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!location.trim()) { setError('Please enter a meetup location'); return }
    if (!time)            { setError('Please select a date and time');   return }
    setError('')
    onAccept({ meetupLocation: location.trim(), meetupTime: time, meetupNotes: notes.trim() })
  }

  // min datetime = now (local)
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-secondary">Arrange a Meetup</h2>
        <p className="text-xs text-gray-400 mt-0.5">Set a time and place to collect your item</p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-4">

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Meetup Location <span className="text-error">*</span>
            </label>
            <div className="relative">
              <FiMapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main library entrance, Gate 3"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Date & Time <span className="text-error">*</span>
            </label>
            <div className="relative">
              <FiCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={time}
                min={minDateTime}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I'll be wearing a red jacket. Call me when you arrive."
              rows={3}
              maxLength={300}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-secondary resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

        </CardBody>
        <CardActions>
          <button
            type="button"
            onClick={onDecline}
            disabled={!!loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-error text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {loading === 'decline' ? <Spinner /> : <FiXCircle size={14} />}
            Decline
          </button>
          <button
            type="submit"
            disabled={!!loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {loading === 'accept' ? <Spinner /> : <FiCheckCircle size={14} />}
            Accept & Set Meetup
          </button>
        </CardActions>
      </form>
    </Card>
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

export default function FinderResponsePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id ?? user?._id ?? ''

  const [response, setResponse] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [actionLoading, setActionLoading] = useState('')

  const fetchResponse = useCallback(() => {
    setLoading(true)
    getFinderResponse(id)
      .then((res) => setResponse(res.data?.response ?? res.data ?? null))
      .catch(async () => {
        // The ID might be an item ID (old notification) — try by-item lookup
        try {
          const res = await getFinderResponseByItem(id)
          const data = res.data?.response ?? res.data ?? null
          if (data) {
            // Redirect to the correct finder response URL
            const responseId = data._id ?? data.id
            navigate(`/finder-responses/${responseId}`, { replace: true })
          } else {
            setError('Failed to load details.')
          }
        } catch {
          setError('Failed to load details.')
        }
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  useEffect(() => { fetchResponse() }, [fetchResponse])

  const handleAccept = async (meetupData) => {
    setActionLoading('accept')
    try {
      await acceptFinderResponse(id, meetupData)
      fetchResponse()
    } catch {
      // refetch to show current state
    } finally {
      setActionLoading('')
    }
  }

  const handleDecline = async () => {
    if (!window.confirm('Decline this message?')) return
    setActionLoading('decline')
    try {
      await declineFinderResponse(id)
      fetchResponse()
    } catch {
      // ignore
    } finally {
      setActionLoading('')
    }
  }

  const handleMarkAsReturned = async () => {
    if (!window.confirm('Mark this item as returned? The owner will need to confirm receipt.')) return
    setActionLoading('returned')
    try {
      await markAsReturned(id)
      fetchResponse()
    } catch {
      // ignore
    } finally {
      setActionLoading('')
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Confirm you received this item?')) return
    setActionLoading('complete')
    try {
      await completeFinderResponse(id)
      fetchResponse()
    } catch {
      // ignore
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

  if (!response) return null

  const posterId = response.posterId?._id ?? response.posterId?.id ?? response.posterId
  const finderId = response.finderId?._id ?? response.finderId?.id ?? response.finderId
  const isPoster = userId && String(posterId) === String(userId)
  const isFinder = userId && String(finderId) === String(userId)
  const status   = response.status ?? 'pending'
  const item     = response.itemId ?? null
  const finderUser  = response.finderId
  const finderName  = finderUser?.username ?? finderUser?.name ?? 'Someone'

  // ── POSTER VIEW ────────────────────────────────────────────────────────────
  if (isPoster) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-secondary">Someone Found Your Item</h1>

        <StatusBanner status={status} isPoster />

        <ItemSummary item={item} />

        {/* Finder's message */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <FiUser size={14} /> Message from {finderName}
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-secondary leading-relaxed">{response.finderMessage}</p>
          </CardBody>
        </Card>

        {/* Pending — show accept form */}
        {status === 'pending' && (
          <AcceptForm
            onAccept={handleAccept}
            onDecline={handleDecline}
            loading={actionLoading}
          />
        )}

        {/* Accepted — show meetup details + confirm return */}
        {status === 'accepted' && (
          <>
            <MeetupDetails response={response} />
            <Card>
              <CardActions>
                <button
                  onClick={handleComplete}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {actionLoading === 'complete' ? <Spinner /> : <FiCheckCircle size={14} />}
                  Confirm Item Received
                </button>
              </CardActions>
            </Card>
          </>
        )}

        {/* Pending confirmation — waiting for owner to confirm */}
        {status === 'pending_confirmation' && (
          <Card>
            <CardActions>
              <button
                onClick={handleComplete}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {actionLoading === 'complete' ? <Spinner /> : <FiCheckCircle size={14} />}
                Confirm I Received This Item
              </button>
            </CardActions>
          </Card>
        )}

        {/* Timeline */}
        {response.timeline?.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-secondary">Timeline</h2></CardHeader>
            <CardBody><Timeline events={response.timeline} /></CardBody>
          </Card>
        )}
      </div>
    )
  }

  // ── FINDER VIEW ────────────────────────────────────────────────────────────
  if (isFinder) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold text-secondary">Your Message</h1>

        <StatusBanner status={status} isPoster={false} />

        <ItemSummary item={item} />

        {/* Your message */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-secondary flex items-center gap-2">
              <FiMessageCircle size={14} /> Your Message
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-secondary leading-relaxed">{response.finderMessage}</p>
          </CardBody>
        </Card>

        {/* Accepted — show meetup details + mark as returned */}
        {status === 'accepted' && (
          <>
            <MeetupDetails response={response} />
            <Card>
              <CardActions>
                <button
                  onClick={handleMarkAsReturned}
                  disabled={!!actionLoading}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-colors"
                >
                  {actionLoading === 'returned' ? <Spinner /> : <FiCheckCircle size={14} />}
                  Mark Item as Returned
                </button>
              </CardActions>
            </Card>
          </>
        )}

        {/* Pending confirmation — waiting for owner to confirm */}
        {status === 'pending_confirmation' && (
          <Card>
            <CardBody className="text-center py-6">
              <FiClock size={24} className="text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-secondary">Waiting for owner confirmation</p>
              <p className="text-xs text-gray-400 mt-1">You marked this item as returned. The owner needs to confirm receipt.</p>
            </CardBody>
          </Card>
        )}

        {/* Timeline */}
        {response.timeline?.length > 0 && (
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-secondary">Timeline</h2></CardHeader>
            <CardBody><Timeline events={response.timeline} /></CardBody>
          </Card>
        )}
      </div>
    )
  }

  return null
}
