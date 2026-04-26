const evidenceService = require('../services/evidence')

async function uploadEvidence(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' })
  }

  try {
    const evidence = await evidenceService.uploadEvidence(
      req.params.claimId,
      req.user.id,
      req.files
    )
    return res.status(201).json({ message: 'Evidence uploaded', evidence })
  } catch (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('not found'))       return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized')                        return res.status(403).json({ message: msg })
    if (msg.toLowerCase().includes('already processed')) return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function getEvidence(req, res) {
  try {
    const evidence = await evidenceService.getEvidence(req.params.claimId, req.user.id)
    return res.status(200).json({ evidence })
  } catch (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('not found')) return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized')                  return res.status(403).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

module.exports = { uploadEvidence, getEvidence }
