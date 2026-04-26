const Item = require('../models/Item')
const { geocodeAddress } = require('./azMaps')

// ── Haversine distance (km) ───────────────────────────────────────────────────

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── createItem ────────────────────────────────────────────────────────────────

async function createItem(itemData, userId) {
  const { title, type, category, description, date, location, imageUrl, coordinates } = itemData

  // Use provided coordinates, otherwise geocode the location
  let coords = coordinates
  if (!coords && location) {
    coords = await geocodeAddress(location)
  }

  const item = new Item({
    title,
    type,
    category,
    description,
    date,
    location,
    imageUrl,
    userId,
    coordinates: coords || {},
  })

  return item.save()
}

// ── getItems ──────────────────────────────────────────────────────────────────

async function getItems(filters) {
  const { type, category, dateFrom, dateTo, keyword, limit } = filters
  const query = {}

  if (type)     query.type     = type
  if (category) query.category = category

  if (dateFrom || dateTo) {
    query.date = {}
    if (dateFrom) query.date.$gte = new Date(dateFrom)
    if (dateTo)   query.date.$lte = new Date(dateTo)
  }

  if (keyword) {
    query.$or = [
      { title:       { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } },
      { category:    { $regex: keyword, $options: 'i' } },
      { location:    { $regex: keyword, $options: 'i' } },
    ]
  }

  query.status = 'active'

  return Item
    .find(query)
    .populate('userId', 'name username')
    .sort({ createdAt: -1 })
    .limit(limit ? parseInt(limit) : 50)
}

// ── getItemById ───────────────────────────────────────────────────────────────

async function getItemById(id) {
  const item = await Item.findById(id).populate('userId', 'name username')
  if (!item) throw new Error('Item not found')
  return item
}

// ── getMyItems ────────────────────────────────────────────────────────────────

async function getMyItems(userId) {
  return Item.find({ userId }).sort({ createdAt: -1 })
}

// ── updateItem ────────────────────────────────────────────────────────────────

async function updateItem(id, userId, updateData) {
  const item = await Item.findById(id)
  if (!item) throw new Error('Item not found')
  if (item.userId.toString() !== userId) throw new Error('Unauthorized')

  // Re-geocode if location changed
  if (updateData.location && updateData.location !== item.location) {
    const coords = await geocodeAddress(updateData.location)
    if (coords) item.coordinates = coords
  }

  // Apply updates
  const allowed = ['title', 'category', 'description', 'date', 'location', 'imageUrl']
  allowed.forEach((field) => {
    if (updateData[field] !== undefined) item[field] = updateData[field]
  })

  return item.save()
}

// ── resolveItem ───────────────────────────────────────────────────────────────

async function resolveItem(id, userId) {
  const item = await Item.findById(id)
  if (!item) throw new Error('Item not found')
  if (item.userId.toString() !== userId) throw new Error('Unauthorized')

  item.status = 'resolved'
  return item.save()
}

// ── getNearbyItems ────────────────────────────────────────────────────────────

async function getNearbyItems(lat, lng, radiusKm) {
  const parsedLat = parseFloat(lat)
  const parsedLng = parseFloat(lng)
  const parsedRadius = parseFloat(radiusKm)

  const items = await Item.find({
    status: 'active',
    'coordinates.lat': { $exists: true },
    'coordinates.lng': { $exists: true },
  })

  return items.filter((item) => {
    const { lat: iLat, lng: iLng } = item.coordinates
    if (iLat == null || iLng == null) return false
    return haversine(parsedLat, parsedLng, iLat, iLng) <= parsedRadius
  })
}

// ── getMatchesForItem ─────────────────────────────────────────────────────────

async function getMatchesForItem(id) {
  const item = await Item.findById(id)
  if (!item) throw new Error('Item not found')

  const oppositeType = item.type === 'lost' ? 'found' : 'lost'
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  const candidates = await Item.find({
    status:   'active',
    type:     oppositeType,
    category: item.category,
  })

  return candidates
    .filter((candidate) => {
      const diff = Math.abs(new Date(candidate.date) - new Date(item.date))
      return diff <= thirtyDays
    })
    .slice(0, 5)
}

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  resolveItem,
  getNearbyItems,
  getMatchesForItem,
}
