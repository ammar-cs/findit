const notificationsService = require('../services/notifications')

async function getNotifications(req, res) {
  try {
    const notifications = await notificationsService.getNotifications(req.user.id)
    return res.status(200).json({ notifications })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function markRead(req, res) {
  try {
    await notificationsService.markRead(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Marked as read' })
  } catch (error) {
    if (error.message === 'Not found') {
      return res.status(404).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function markAllRead(req, res) {
  try {
    await notificationsService.markAllRead(req.user.id)
    return res.status(200).json({ message: 'All marked as read' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { getNotifications, markRead, markAllRead }
