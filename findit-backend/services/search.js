const itemsService = require('./items')

async function searchItems(filters) {
  const items = await itemsService.getItems(filters)
  return items
}

async function getMatches(itemId) {
  const matches = await itemsService.getMatchesForItem(itemId)
  return matches
}

async function getNearby(lat, lng, radius) {
  const items = await itemsService.getNearbyItems(lat, lng, radius)
  return items
}

module.exports = { searchItems, getMatches, getNearby }
