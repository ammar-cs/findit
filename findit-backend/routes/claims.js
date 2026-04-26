const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const { uploadMultiple } = require('../middlewares/upload')
const { validateSubmitClaim } = require('../validators/claims')
const claimsController = require('../controllers/claims')

// POST /api/claims
router.post('/', authorize, uploadMultiple, validateSubmitClaim, claimsController.postClaim)

// GET /api/claims/:id
router.get('/:id', authorize, claimsController.getClaim)

// PUT /api/claims/:id/approve
router.put('/:id/approve', authorize, claimsController.approveClaim)

// PUT /api/claims/:id/reject
router.put('/:id/reject', authorize, claimsController.rejectClaim)

// PUT /api/claims/:id/complete
router.put('/:id/complete', authorize, claimsController.completeClaim)

module.exports = router
