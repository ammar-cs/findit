const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')
const { initiateDBConnection } = require('./config/db')

// Routers
const authRouter              = require('./routes/auth')
const itemsRouter             = require('./routes/items')
const searchRouter            = require('./routes/search')
const claimsRouter            = require('./routes/claims')
const notificationsRouter     = require('./routes/notifications')
const adminRouter             = require('./routes/admin')
const historyRouter           = require('./routes/history')
const evidenceRouter          = require('./routes/evidence')
const finderResponseRouter    = require('./routes/finderResponse')

dotenv.config({ path: './config/.env' })

const PORT = process.env.PORT

const app = express()

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(cors({ origin: process.env.CLIENT_URL }))

// Mount routes
app.use('/api/auth',             authRouter)
app.use('/api/items',           searchRouter)   // search/nearby before /:id
app.use('/api/items',           itemsRouter)
app.use('/api/claims',          claimsRouter)
app.use('/api/notifications',   notificationsRouter)
app.use('/api/admin',           adminRouter)
app.use('/api/history',         historyRouter)
app.use('/api/evidence',        evidenceRouter)
app.use('/api/finder-responses',finderResponseRouter)

app.listen(PORT, async () => {
  console.log('Server listening on port ' + PORT)
  await initiateDBConnection()
})
