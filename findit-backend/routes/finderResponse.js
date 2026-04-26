const express    = require('express')
const router     = express.Router()
const authorize  = require('../middlewares/authorization')
const ctrl       = require('../controllers/finderResponse')

// POST /api/finder-responses          — Account B sends "I found it"
router.post('/',                authorize, ctrl.createFinderResponse)

// GET  /api/finder-responses/by-item/:itemId  — find response for current user by item
router.get('/by-item/:itemId',  authorize, ctrl.getFinderResponseByItem)

// GET  /api/finder-responses/:id      — view the response detail
router.get('/:id',              authorize, ctrl.getFinderResponse)

// PUT  /api/finder-responses/:id/accept   — Account A accepts + sets meetup
router.put('/:id/accept',       authorize, ctrl.acceptResponse)

// PUT  /api/finder-responses/:id/decline  — Account A declines
router.put('/:id/decline',      authorize, ctrl.declineResponse)

// PUT  /api/finder-responses/:id/returned — finder marks item as returned
router.put('/:id/returned',     authorize, ctrl.markAsReturned)

// PUT  /api/finder-responses/:id/complete — owner confirms receipt
router.put('/:id/complete',     authorize, ctrl.completeResponse)

module.exports = router
