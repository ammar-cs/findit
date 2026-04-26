const historyService = require('../services/history')

async function getActivity(req, res) {
  try {
    const { items } = await historyService.getActivity(req.user.id)
    return res.status(200).json({ items })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function archiveItem(req, res) {
  try {
    const item = await historyService.archiveItem(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item archived', item })
  } catch (error) {
    const msg = error.message
    if (msg.toLowerCase().includes('not found'))  return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized')                   return res.status(403).json({ message: msg })
    if (msg.includes('Cannot archive'))           return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function getClaimHistory(req, res) {
  try {
    const claims = await historyService.getClaimHistory(req.user.id)
    return res.status(200).json({ claims })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { getActivity, archiveItem, getClaimHistory }
