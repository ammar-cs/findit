const Claim = require('../models/Claim')
const Item = require('../models/Item')
const notificationsService = require('./notifications')

async function refreshClaimInProgress(itemId) {
  const hasOpenClaims = await Claim.exists({
    itemId,
    status: { $in: ['pending', 'approved'] },
  })
  await Item.findByIdAndUpdate(itemId, { claimInProgress: !!hasOpenClaims })
}

async function submitClaim(claimData, claimantId) {
  const { itemId, description, uniqueDetails, evidenceFiles } = claimData

  const item = await Item.findById(itemId)
  if (!item) throw new Error('Item not found')

  if (item.type !== 'found') throw new Error('Can only claim found items')

  if (item.userId.toString() === claimantId) {
    throw new Error('Cannot claim your own item')
  }

  const existing = await Claim.findOne({ itemId, claimantId })
  if (existing) throw new Error('Already submitted a claim for this item')

  const claim = new Claim({
    itemId,
    claimantId,
    finderId:      item.userId,
    description,
    uniqueDetails,
    evidenceFiles: evidenceFiles || [],
    timeline:      [{ event: 'Claim submitted' }],
  })

  await claim.save()
  await Item.findByIdAndUpdate(itemId, { claimInProgress: true })

  // Notify the finder
  notificationsService.createNotification({
    userId:    item.userId,
    type:      'match_found',
    title:     'New claim on your item',
    message:   claimantId + ' submitted a claim on ' + item.title,
    relatedId: claim._id,
  }).catch(() => {}) // fire-and-forget — don't fail the request if notification errors

  return claim
}

async function getClaim(claimId, userId) {
  const claim = await Claim
    .findById(claimId)
    .populate('itemId')
    .populate('claimantId', 'name username email')
    .populate('finderId',   'name username email')

  if (!claim) throw new Error('Claim not found')

  const isClaimant = claim.claimantId._id.toString() === userId
  const isFinder   = claim.finderId._id.toString()   === userId

  if (!isClaimant && !isFinder) throw new Error('Unauthorized')

  return claim
}

async function approveClaim(claimId, userId) {
  const claim = await Claim.findById(claimId)
  if (!claim) throw new Error('Claim not found')

  if (claim.finderId.toString() !== userId) throw new Error('Unauthorized')
  if (claim.status !== 'pending') throw new Error('Claim already processed')

  claim.status = 'approved'
  claim.timeline.push({ event: 'Claim approved' })
  await claim.save()
  await refreshClaimInProgress(claim.itemId)

  notificationsService.createNotification({
    userId:    claim.claimantId,
    type:      'claim_approved',
    title:     'Your claim was approved!',
    message:   'The finder approved your claim. Arrange handover.',
    relatedId: claim._id,
  }).catch(() => {})

  return claim
}

async function rejectClaim(claimId, userId) {
  const claim = await Claim.findById(claimId)
  if (!claim) throw new Error('Claim not found')

  if (claim.finderId.toString() !== userId) throw new Error('Unauthorized')
  if (claim.status !== 'pending') throw new Error('Claim already processed')

  claim.status = 'rejected'
  claim.timeline.push({ event: 'Claim rejected' })
  await claim.save()
  await refreshClaimInProgress(claim.itemId)

  notificationsService.createNotification({
    userId:    claim.claimantId,
    type:      'claim_rejected',
    title:     'Your claim was rejected',
    message:   'The finder rejected your claim.',
    relatedId: claim._id,
  }).catch(() => {})

  return claim
}

async function completeClaim(claimId, userId) {
  const claim = await Claim.findById(claimId)
  if (!claim) throw new Error('Claim not found')

  const isFinder   = claim.finderId.toString()   === userId
  const isClaimant = claim.claimantId.toString() === userId

  if (!isFinder && !isClaimant) throw new Error('Unauthorized')

  claim.status = 'completed'
  claim.timeline.push({ event: 'Item successfully returned' })
  await claim.save()

  await Item.findByIdAndUpdate(claim.itemId, { status: 'resolved', claimInProgress: false })

  return claim
}

module.exports = { submitClaim, getClaim, approveClaim, rejectClaim, completeClaim }
