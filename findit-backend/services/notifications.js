const Notification = require('../models/Notification')

async function createNotification(data) {
  const notification = new Notification(data)
  return notification.save()
}

async function getNotifications(userId) {
  return Notification
    .find({ userId })
    .sort({ createdAt: -1 })
}

async function markRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, userId })
  if (!notification) throw new Error('Not found')
  notification.isRead = true
  return notification.save()
}

async function markAllRead(userId) {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true })
}

module.exports = { createNotification, getNotifications, markRead, markAllRead }
