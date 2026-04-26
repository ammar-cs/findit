# FindIt Frontend — Vercel Deployment Guide

## Chosen Service: Vercel (Frontend Cloud)

### Why Vercel?
- Zero configuration deployment for React/Vite
- Automatic HTTPS and global CDN
- CI/CD from GitHub (auto-deploy on every push)
- Free tier sufficient for student project

## Step-by-Step Deployment

### 1. Prepare
- Confirm .env and .env.production are in .gitignore
- Push findit-frontend to its own GitHub repository

### 2. Deploy on Vercel
- Go to vercel.com → Sign in with GitHub
- Click "Add New Project" → Import findit-frontend repo
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Click Deploy

### 3. Set Environment Variables in Vercel
- Project Settings → Environment Variables
- Add: VITE_API_URL = https://findit-backend.azurewebsites.net

### 4. Update CORS in Backend
After getting your Vercel URL, go to Azure App Service →
Configuration → update CLIENT_URL to your Vercel URL

### 5. Verify
- Visit your Vercel URL
- Sign up → Login → Create a lost item report
- Confirm data saves and displays correctly

## Architecture
- Service: Vercel (PaaS / Frontend CDN)
- Build Tool: Vite
- Routing: vercel.json rewrites for React Router
- API: Azure App Service backend
- Auth: JWT stored in localStorage
