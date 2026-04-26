const finderResponseService = require('../services/finderResponse')

async function createFinderResponse(req, res) {
  try {
    const { itemId, message } = req.body
    if (!itemId) return res.status(400).json({ message: 'itemId is required' })
    if (!message || !message.trim()) return res.status(400).json({ message: 'message is required' })

    const senderUsername = req.user.username || req.user.name || 'Someone'
    const response = await finderResponseService.createFinderResponse(
      itemId,
      req.user.id,
      senderUsername,
      message.trim(),
    )
    return res.status(201).json({ message: 'Message sent to poster', response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Item not found')          return res.status(404).json({ message: msg })
    if (msg === 'Cannot contact yourself') return res.status(400).json({ message: msg })
    if (msg === 'Item is already resolved')return res.status(400).json({ message: msg })
    if (msg === 'You already sent a message for this item') return res.status(409).json({ message: msg })
    if (msg.includes('lost items'))        return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function getFinderResponse(req, res) {
  try {
    const response = await finderResponseService.getFinderResponse(req.params.id, req.user.id)
    return res.status(200).json({ response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found')    return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function getFinderResponseByItem(req, res) {
  try {
    const response = await finderResponseService.getFinderResponseByItem(req.params.itemId, req.user.id)
    return res.status(200).json({ response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found') return res.status(404).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function acceptResponse(req, res) {
  try {
    const { meetupLocation, meetupTime, meetupNotes } = req.body
    const response = await finderResponseService.acceptResponse(
      req.params.id,
      req.user.id,
      meetupLocation,
      meetupTime,
      meetupNotes,
    )
    return res.status(200).json({ message: 'Meetup arranged', response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found')    return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    if (msg === 'Already processed') return res.status(400).json({ message: msg })
    if (msg.includes('required'))    return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function declineResponse(req, res) {
  try {
    const response = await finderResponseService.declineResponse(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Response declined', response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found')    return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    if (msg === 'Already processed') return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function markAsReturned(req, res) {
  try {
    const response = await finderResponseService.markAsReturned(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item marked as returned - awaiting owner confirmation', response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found')    return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    if (msg === 'Already processed') return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

async function completeResponse(req, res) {
  try {
    const response = await finderResponseService.completeResponse(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item return confirmed - transaction completed', response })
  } catch (error) {
    const msg = error.message
    if (msg === 'Not found')    return res.status(404).json({ message: msg })
    if (msg === 'Unauthorized') return res.status(403).json({ message: msg })
    if (msg === 'Cannot confirm') return res.status(400).json({ message: msg })
    return res.status(500).json({ message: msg })
  }
}

module.exports = { createFinderResponse, getFinderResponse, getFinderResponseByItem, acceptResponse, declineResponse, markAsReturned, completeResponse }
