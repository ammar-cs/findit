# FindIt — Frontend React SPA

## Tech Stack
- React 18 + Vite
- React Router DOM v6
- Axios (API calls)
- React Hook Form (form handling)
- Tailwind CSS v3
- React Icons
- Vercel (deployment)

## Project Structure
- src/api/ — axios instance and API functions
- src/UI/ — reusable UI components (layout, navbar, card, form)
- src/store/ — AuthContext and AuthProvider
- src/pages/ — one folder per service
- src/utils/ — helper functions

## Setup Instructions

1. npm install
2. Create .env with:
```
VITE_API_URL=http://localhost:5000
```
3. npm run dev

## Pages & Routes

### Public
- / → Home page
- /login → Login
- /signup → Sign up
- /search → Search items

### Protected (requires login)
- /dashboard → Personal dashboard
- /items/lost/new → Report lost item
- /items/found/new → Report found item
- /items/:id → Item detail
- /claims/new → Submit claim
- /claims/:id → Claim detail
- /notifications → Notifications
- /history → Activity history
- /evidence/:claimId → Evidence management

### Admin only
- /admin → Admin dashboard
- /admin/reports → Flagged reports
- /admin/categories → Category management

## Deployment
See DEPLOYMENT.md for full Vercel guide.
