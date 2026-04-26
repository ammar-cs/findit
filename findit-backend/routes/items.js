const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const { uploadSingle } = require('../middlewares/upload')
const { validateCreateItem } = require('../validators/items')
const itemsController = require('../controllers/items')

// POST /api/items/lost
router.post('/lost', authorize, uploadSingle, validateCreateItem, itemsController.postLostItem)

// POST /api/items/found
router.post('/found', authorize, uploadSingle, validateCreateItem, itemsController.postFoundItem)

// GET /api/items/my
router.get('/my', authorize, itemsController.getMyItems)

// GET /api/items/:id
router.get('/:id', itemsController.getItem)

// PUT /api/items/:id
router.put('/:id', authorize, uploadSingle, itemsController.putItem)

// PUT /api/items/:id/resolve
router.put('/:id/resolve', authorize, itemsController.putResolveItem)

module.exports = router
