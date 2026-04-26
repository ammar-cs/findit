const express = require('express')
const router = express.Router()
const searchController = require('../controllers/search')

// GET /api/items/search  — must be before /:id
router.get('/search', searchController.getItems)

// GET /api/items/nearby  — must be before /:id
router.get('/nearby', searchController.getNearby)

// GET /api/items/:id/matches
router.get('/:id/matches', searchController.getMatches)

module.exports = router
