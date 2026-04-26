const Evidence = require('../models/Evidence')
const Claim = require('../models/Claim')

async function uploadEvidence(claimId, claimantId, files) {
  const claim = await Claim.findById(claimId)
  if (!claim) throw new Error('Claim not found')
  if (claim.claimantId.toString() !== claimantId) throw new Error('Unauthorized')
  if (claim.status !== 'pending') throw new Error('Claim already processed')

  let evidence = await Evidence.findOne({ claimId })
  if (!evidence) {
    evidence = new Evidence({ claimId, claimantId, files: [] })
  }

  const mapped = files.map((f) => ({
    filename:   f.filename,
    url:        '/uploads/' + f.filename,
  }))
  evidence.files.push(...mapped)

  return evidence.save()
}

async function getEvidence(claimId, userId) {
  const claim = await Claim
    .findById(claimId)
    .populate('claimantId', '_id')
    .populate('finderId',   '_id')

  if (!claim) throw new Error('Claim not found')

  const isClaimant = claim.claimantId._id.toString() === userId
  const isFinder   = claim.finderId._id.toString()   === userId
  if (!isClaimant && !isFinder) throw new Error('Unauthorized')

  const evidence = await Evidence.findOne({ claimId })

  if (!evidence) {
    return {
      claimId,
      files:       [],
      reviewed:    false,
      claimStatus: claim.status,
      claimantId:  claim.claimantId._id,
      finderId:    claim.finderId._id,
    }
  }

  return {
    ...evidence._doc,
    claimStatus: claim.status,
    claimantId:  claim.claimantId._id,
    finderId:    claim.finderId._id,
  }
}

module.exports = { uploadEvidence, getEvidence }
