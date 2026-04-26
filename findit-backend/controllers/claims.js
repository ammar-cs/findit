const { validationResult } = require('express-validator')
const claimsService = require('../services/claims')

async function postClaim(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }

  try {
    const evidenceFiles = req.files
      ? req.files.map((f) => '/uploads/' + f.filename)
      : []

    const claim = await claimsService.submitClaim(
      { ...req.body, evidenceFiles },
      req.user.id
    )
    return res.status(201).json({ message: 'Claim submitted', claim })
  } catch (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('not found'))    return res.status(404).json({ message: msg })
    if (msg.includes('Cannot claim'))               return res.status(400).json({ message: msg })
    if (msg.includes('Already'))                    return res.status(409).json({ message: msg })
    if (msg === 'Unauthorized')                     return res.status(403).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function getClaim(req, res) {
  try {
    const claim = await claimsService.getClaim(req.params.id, req.user.id)
    return res.status(200).json({ claim })
  } catch (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('not found')) return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized')                  return res.status(403).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function approveClaim(req, res) {
  try {
    const claim = await claimsService.approveClaim(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Claim approved', claim })
  } catch (error) {
    const msg = error.message
    if (msg === 'Unauthorized')                       return res.status(403).json({ message: msg })
    if (msg.toLowerCase().includes('already processed')) return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function rejectClaim(req, res) {
  try {
    const claim = await claimsService.rejectClaim(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Claim rejected', claim })
  } catch (error) {
    const msg = error.message
    if (msg === 'Unauthorized')                          return res.status(403).json({ message: msg })
    if (msg.toLowerCase().includes('already processed')) return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function completeClaim(req, res) {
  try {
    const claim = await claimsService.completeClaim(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item returned successfully', claim })
  } catch (error) {
    const msg = error.message
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

module.exports = { postClaim, getClaim, approveClaim, rejectClaim, completeClaim }
