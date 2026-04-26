const searchService = require('../services/search')

async function getItems(req, res) {
  try {
    const items = await searchService.searchItems(req.query)
    return res.status(200).json({ items, count: items.length })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function getMatches(req, res) {
  try {
    const matches = await searchService.getMatches(req.params.id)
    return res.status(200).json({ matches })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function getNearby(req, res) {
  const { lat, lng, radius } = req.query
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required' })
  }

  try {
    const items = await searchService.getNearby(lat, lng, radius || 10)
    return res.status(200).json({ items })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { getItems, getMatches, getNearby }
