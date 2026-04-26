const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const historyController = require('../controllers/history')

// GET /api/history/activity
router.get('/activity', authorize, historyController.getActivity)

// GET /api/history/claims
router.get('/claims', authorize, historyController.getClaimHistory)

// PUT /api/history/:id/archive
router.put('/:id/archive', authorize, historyController.archiveItem)

module.exports = router
