# FindIt Backend — Azure Deployment Guide

## Docker Deployment (Bonus)

### Run with Docker locally:
1. Install Docker Desktop
2. Make sure config/.env exists with all variables
3. Run: `docker-compose up --build`
4. Backend runs at http://localhost:5000
5. MongoDB runs locally inside Docker (no Atlas needed for local)

### Deploy Docker to Azure:
1. Build image: `docker build -t findit-backend .`
2. Push to Docker Hub:
```
docker tag findit-backend yourusername/findit-backend
docker push yourusername/findit-backend
```
3. In Azure App Service → Deployment Center:
   - Select Docker Hub as source
   - Enter image name: `yourusername/findit-backend`
4. Set all environment variables in Azure Configuration

---

## Chosen Service Model: Azure App Service (PaaS)

### Why Azure App Service?
- No server management needed (PaaS model)
- Built-in CI/CD from GitHub
- Auto-scaling support
- Environment variables managed via Azure Portal
- Supports Node.js natively

## Step-by-Step Deployment

### 1. Prepare the repository
- Make sure config/.env is in .gitignore (never push secrets)
- Push findit-backend to a GitHub repository

### 2. Create Azure App Service
- Go to portal.azure.com
- Create Resource → Web App
- Settings:
  * Name: findit-backend
  * Runtime: Node 18 LTS
  * OS: Linux
  * Plan: Free F1 (for student project)
  * Region: East US or West Europe

### 3. Set Environment Variables in Azure
Go to App Service → Configuration → Application Settings
Add these variables:
```
PORT=8080
MONGO_CONNECTION_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
AZ_MAPS_SEARCH_API_KEY=your_azure_maps_key
CLIENT_URL=https://your-vercel-app.vercel.app
WEBSITES_PORT=8080
```

### 4. Connect GitHub for CD
- App Service → Deployment Center
- Source: GitHub
- Select your repo and main branch
- Azure auto-deploys on every push to main

### 5. Verify Deployment
- Visit https://findit-backend.azurewebsites.net/api/items/search
- Should return `{ items: [], count: 0 }`

## MongoDB Atlas Setup
- Go to cloud.mongodb.com
- Create free M0 cluster
- Database Access: create username + password
- Network Access: Allow from anywhere (0.0.0.0/0)
- Get connection string → replace in Azure env vars

## Architecture
- Service Model: PaaS (Platform as a Service)
- Provider: Microsoft Azure App Service
- Database: MongoDB Atlas (DBaaS)
- File Storage: Local uploads/ folder (upgrade to Azure Blob for production)
- Frontend: Vercel (separate deployment)
