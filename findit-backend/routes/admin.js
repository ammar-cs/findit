const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const adminController = require('../controllers/admin')

// Inline admin-only guard
const isAdmin = (req, res, next) =>
  req.user.role === 'admin'
    ? next()
    : res.status(403).json({ message: 'Admin only' })

// GET /api/admin/reports
router.get('/reports', authorize, isAdmin, adminController.getReports)

// PUT /api/admin/reports/:id/remove
router.put('/reports/:id/remove', authorize, isAdmin, adminController.removeReport)

// GET /api/admin/analytics
router.get('/analytics', authorize, isAdmin, adminController.getAnalytics)

// POST /api/admin/flag/:id  — any authenticated user can flag
router.post('/flag/:id', authorize, adminController.flagItem)

// PUT /api/admin/promote  — admin only
router.put('/promote', authorize, isAdmin, adminController.promoteToAdmin)

module.exports = router
