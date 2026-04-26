const { validationResult } = require('express-validator')
const itemsService = require('../services/items')

async function postLostItem(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }

  try {
    const imageUrl = req.file ? '/uploads/' + req.file.filename : null
    
    // Parse coordinates if provided
    let coordinates = null
    if (req.body.coordinates) {
      try {
        coordinates = JSON.parse(req.body.coordinates)
      } catch (e) {
        console.error('Error parsing coordinates:', e)
      }
    }
    
    const item = await itemsService.createItem(
      { ...req.body, type: 'lost', imageUrl, coordinates },
      req.user.id
    )
    return res.status(201).json({ message: 'Lost item reported', item })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function postFoundItem(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: errors.array()[0].msg })
  }

  try {
    const imageUrl = req.file ? '/uploads/' + req.file.filename : null
    
    // Parse coordinates if provided
    let coordinates = null
    if (req.body.coordinates) {
      try {
        coordinates = JSON.parse(req.body.coordinates)
      } catch (e) {
        console.error('Error parsing coordinates:', e)
      }
    }
    
    const item = await itemsService.createItem(
      { ...req.body, type: 'found', imageUrl, coordinates },
      req.user.id
    )
    return res.status(201).json({ message: 'Found item reported', item })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function getItem(req, res) {
  try {
    const item = await itemsService.getItemById(req.params.id)
    return res.status(200).json({ item })
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(404).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function putItem(req, res) {
  try {
    const imageUrl = req.file ? '/uploads/' + req.file.filename : undefined
    const updateData = { ...req.body, ...(imageUrl && { imageUrl }) }
    const item = await itemsService.updateItem(req.params.id, req.user.id, updateData)
    return res.status(200).json({ message: 'Item updated', item })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ message: error.message })
    }
    if (error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function putResolveItem(req, res) {
  try {
    await itemsService.resolveItem(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item marked as resolved' })
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function getMyItems(req, res) {
  try {
    const items = await itemsService.getMyItems(req.user.id)
    return res.status(200).json({ items })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { postLostItem, postFoundItem, getItem, putItem, putResolveItem, getMyItems }
