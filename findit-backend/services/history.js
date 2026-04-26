const Item = require('../models/Item')
const Claim = require('../models/Claim')

async function getActivity(userId) {
  const items = await Item.find({ userId }).sort({ createdAt: -1 })
  return { items }
}

async function archiveItem(itemId, userId) {
  const item = await Item.findById(itemId)
  if (!item) throw new Error('Item not found')
  if (item.userId.toString() !== userId) throw new Error('Unauthorized')
  if (item.status === 'resolved') throw new Error('Cannot archive resolved item')

  item.status = 'archived'
  return item.save()
}

async function getClaimHistory(userId) {
  const claims = await Claim
    .find({
      $or: [{ claimantId: userId }, { finderId: userId }],
    })
    .populate('itemId', 'title type imageUrl')
    .sort({ createdAt: -1 })

  return claims.map((claim) => ({
    ...claim.toObject(),
    role: claim.claimantId.toString() === userId ? 'Claimant' : 'Finder',
  }))
}

module.exports = { getActivity, archiveItem, getClaimHistory }
