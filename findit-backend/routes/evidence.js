const express = require('express')
const router = express.Router()
const authorize = require('../middlewares/authorization')
const { uploadMultiple } = require('../middlewares/upload')
const evidenceController = require('../controllers/evidence')

// POST /api/evidence/:claimId
router.post('/:claimId', authorize, uploadMultiple, evidenceController.uploadEvidence)

// GET /api/evidence/:claimId
router.get('/:claimId', authorize, evidenceController.getEvidence)

module.exports = router
