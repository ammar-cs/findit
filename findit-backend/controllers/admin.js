const adminService = require('../services/admin')

async function getReports(req, res) {
  try {
    const reports = await adminService.getReports()
    return res.status(200).json({ reports })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function removeReport(req, res) {
  try {
    await adminService.removeReport(req.params.id)
    return res.status(200).json({ message: 'Listing removed' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function getAnalytics(req, res) {
  try {
    const analytics = await adminService.getAnalytics()
    return res.status(200).json({ analytics })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

async function flagItem(req, res) {
  try {
    await adminService.flagItem(req.params.id, req.user.id)
    return res.status(200).json({ message: 'Item flagged for review' })
  } catch (error) {
    if (error.message.includes('Cannot flag')) {
      return res.status(400).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

async function promoteToAdmin(req, res) {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })
    
    const user = await adminService.promoteToAdmin(email)
    return res.status(200).json({ message: `User ${user.name || user.username} promoted to admin successfully`, user })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message })
    }
    return res.status(500).json({ message: error.message })
  }
}

module.exports = { getReports, removeReport, getAnalytics, flagItem, promoteToAdmin }
