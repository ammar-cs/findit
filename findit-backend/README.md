# FindIt — Backend REST API

## Tech Stack
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- Azure Maps API (geocoding)
- Multer (file uploads)
- PM2 (production process manager)
- Azure App Service (deployment)

## Project Structure
- config/ — environment and database config
- controllers/ — request handlers
- middlewares/ — auth and upload middleware
- models/ — Mongoose schemas
- routes/ — Express routers
- services/ — business logic layer
- validators/ — express-validator rules
- HTTP-TESTS/ — VS Code REST Client test files

## Setup Instructions

1. npm install
2. Create config/.env with:
```
PORT=5000
MONGO_CONNECTION_URI=your_mongodb_uri
JWT_SECRET=your_secret
AZ_MAPS_SEARCH_API_KEY=your_key
CLIENT_URL=http://localhost:5173
```
3. npm run dev

## API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/signin

### Items
- POST /api/items/lost (protected)
- POST /api/items/found (protected)
- GET  /api/items/search
- GET  /api/items/nearby
- GET  /api/items/:id
- GET  /api/items/my (protected)
- PUT  /api/items/:id (protected)
- PUT  /api/items/:id/resolve (protected)

### Claims
- POST /api/claims (protected)
- GET  /api/claims/:id (protected)
- PUT  /api/claims/:id/approve (protected)
- PUT  /api/claims/:id/reject (protected)
- PUT  /api/claims/:id/complete (protected)

### Notifications
- GET /api/notifications (protected)
- PUT /api/notifications/:id/read (protected)

### History
- GET /api/history/activity (protected)
- GET /api/history/claims (protected)
- PUT /api/history/:id/archive (protected)

### Evidence
- POST /api/evidence/:claimId (protected)
- GET  /api/evidence/:claimId (protected)

### Admin (admin role required)
- GET  /api/admin/analytics
- GET  /api/admin/reports
- PUT  /api/admin/reports/:id/remove
- POST /api/admin/flag/:id

## Deployment
See DEPLOYMENT.md for full Azure App Service guide.
