const Item = require('../models/Item')
const Claim = require('../models/Claim')
const Notification = require('../models/Notification')
const User = require('../models/User')
const notificationsService = require('./notifications')

async function getReports() {
  const flaggedItems = await Item
    .find({ flagged: true })
    .populate('userId', 'name username')

  return flaggedItems.map((item) => ({
    id:          item._id,
    itemId:      item._id,
    itemTitle:   item.title,
    reportedBy:  item.userId?.name ?? 'Unknown',
    reason:      'Flagged by user',
    createdAt:   item.createdAt,
    status:      item.status === 'resolved' ? 'resolved' : 'pending',
  }))
}

async function removeReport(itemId) {
  const item = await Item.findById(itemId)
  if (!item) throw new Error('Item not found')
  item.status  = 'resolved'
  item.flagged = false
  return item.save()
}

async function getAnalytics() {
  const [totalReports, resolved, pendingClaims, flagged, recentActivity] = await Promise.all([
    Item.countDocuments(),
    Item.countDocuments({ status: 'resolved' }),
    Claim.countDocuments({ status: 'pending' }),
    Item.countDocuments({ flagged: true }),
    Item.find()
      .populate('userId', 'name username')
      .sort({ createdAt: -1 })
      .limit(10),
  ])

  return {
    stats: {
      totalReports,
      resolvedCases:   resolved,
      pendingClaims,
      flaggedListings: flagged,
    },
    flaggedCount:   flagged,
    recentActivity,
  }
}

async function flagItem(itemId, userId) {
  const item = await Item.findById(itemId)
  if (!item) throw new Error('Item not found')
  if (item.userId.toString() === userId) throw new Error('Cannot flag own item')

  item.flagged = true
  await item.save()

  // Notify all admins
  const admins = await User.find({ role: 'admin' })
  const notifications = admins.map((admin) =>
    notificationsService.createNotification({
      userId:    admin._id,
      type:      'admin_alert',
      title:     'Item flagged for review',
      message:   'An item has been flagged: ' + item.title,
      relatedId: item._id,
    }).catch(() => {})
  )
  await Promise.all(notifications)

  return item
}

async function promoteToAdmin(email) {
  const user = await User.findOne({ email: email.trim().toLowerCase() })
  if (!user) throw new Error('User not found with this email')
  
  user.role = 'admin'
  await user.save()
  
  return user
}

module.exports = { getReports, removeReport, getAnalytics, flagItem, promoteToAdmin }
