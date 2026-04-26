const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const notificationsController = require('../controllers/notifications')

// GET /api/notifications
router.get('/', authorize, notificationsController.getNotifications)

// PUT /api/notifications/read-all
router.put('/read-all', authorize, notificationsController.markAllRead)

// PUT /api/notifications/:id/read
router.put('/:id/read', authorize, notificationsController.markRead)

module.exports = router
