const mongoose = require('mongoose')

async function initiateDBConnection() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = { initiateDBConnection }
