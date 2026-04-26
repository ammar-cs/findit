import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch, FiCheckCircle, FiXCircle, FiClock, FiShield, FiCheck, FiMessageCircle,
} from 'react-icons/fi'
import { getNotifications, markRead, markAllRead } from '../../api/index'
import { getFinderResponseByItem } from '../../api/index'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Icon by type ──────────────────────────────────────────────────────────────

function NotifIcon({ type }) {
  const base = 'w-9 h-9 rounded-full flex items-center justify-center shrink-0'
  switch (type) {
    case 'match_found':
      return <span className={`${base} bg-blue-100 text-primary`}><FiSearch size={16} /></span>
    case 'claim_approved':
      return <span className={`${base} bg-green-100 text-green-600`}><FiCheckCircle size={16} /></span>
    case 'claim_rejected':
      return <span className={`${base} bg-red-100 text-error`}><FiXCircle size={16} /></span>
    case 'reminder':
      return <span className={`${base} bg-amber-100 text-accent`}><FiClock size={16} /></span>
    case 'admin_alert':
      return <span className={`${base} bg-purple-100 text-purple-600`}><FiShield size={16} /></span>
    case 'found_your_item':
      return <span className={`${base} bg-green-100 text-green-600`}><FiMessageCircle size={16} /></span>
    case 'meetup_accepted':
      return <span className={`${base} bg-green-100 text-green-600`}><FiCheckCircle size={16} /></span>
    case 'meetup_declined':
      return <span className={`${base} bg-red-100 text-error`}><FiXCircle size={16} /></span>
    case 'meetup_confirmed':
      return <span className={`${base} bg-blue-100 text-primary`}><FiCheckCircle size={16} /></span>
    default:
      return <span className={`${base} bg-gray-100 text-gray-500`}><FiCheck size={16} /></span>
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
        <FiCheck size={28} className="text-green-500" />
      </span>
      <p className="text-base font-medium text-gray-500">You&apos;re all caught up!</p>
      <p className="text-sm text-gray-400 mt-1">No notifications right now</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data?.notifications ?? res.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await markAllRead()
    } catch {
      // best-effort
    }
  }

  const handleClick = async (notif) => {
    // Mark as read locally immediately
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) => n._id === notif._id || n.id === notif.id ? { ...n, isRead: true } : n)
      )
      try {
        await markRead(notif._id ?? notif.id)
      } catch {
        // best-effort
      }
    }
    // Navigate to related resource
    if (notif.relatedId) {
      if (
        notif.type === 'match_found' ||
        notif.type === 'claim_approved' ||
        notif.type === 'claim_rejected'
      ) {
        navigate(`/claims/${notif.relatedId}`)
      } else if (
        notif.type === 'found_your_item' ||
        notif.type === 'meetup_accepted' ||
        notif.type === 'meetup_declined' ||
        notif.type === 'meetup_confirmed'
      ) {
        navigate(`/finder-responses/${notif.relatedId}`)
      } else if (notif.type === 'found_your_item') {
        // relatedId might be a FinderResponse ID (new flow) or an Item ID (old notification)
        // Try by-item lookup first; if it returns a response, use that ID
        try {
          const res = await getFinderResponseByItem(notif.relatedId)
          const responseId = res.data?.response?._id ?? res.data?.response?.id
          navigate(`/finder-responses/${responseId ?? notif.relatedId}`)
        } catch {
          // relatedId is already a FinderResponse ID
          navigate(`/finder-responses/${notif.relatedId}`)
        }
      } else {
        navigate(`/items/${notif.relatedId}`)
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-1.5">
          {notifications.map((notif) => {
            const nId = notif._id ?? notif.id
            const isUnread = !notif.isRead
            return (
              <button
                key={nId}
                onClick={() => handleClick(notif)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-colors
                  ${isUnread
                    ? 'border-l-4 border-l-primary border-gray-100 bg-blue-50 hover:bg-blue-100'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
              >
                <NotifIcon type={notif.type} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${isUnread ? 'font-semibold text-secondary' : 'font-medium text-secondary'}`}>
                    {notif.title ?? notif.type?.replace(/_/g, ' ')}
                  </p>
                  {notif.message && (
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{notif.message}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {timeAgo(notif.createdAt)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
