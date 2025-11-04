# 🚀 Demo Account Instructions for Interviewers

Welcome! This document provides quick access information for testing the StreetCred application.

---

## 🎯 Quick Start (2 Options)

### Option 1: One-Click Demo Login ⚡ (Recommended)

1. Visit the app: **https://streetcred-eta.vercel.app**
2. Click **"🚀 Try Demo (No Signup Required)"**
3. Click the green **"🚀 Demo Login (For Interviewers)"** button
4. You're in! ✅

### Option 2: Manual Login

1. Visit: **https://streetcred-eta.vercel.app/login**
2. Credentials are pre-filled:
   - **Email**: `demo@streetcred.app`
   - **Password**: `Demo123!`
3. Click **"Log In"**

---

## 👤 Demo Account Features

The demo account comes pre-configured with:

- ✅ **Username**: Demo User
- ✅ **Points**: 150 (earned from activity)
- ✅ **Badges Earned**: 3-4 badges from different NYC locations
- ✅ **Full Access**: All features available (map, profile, reporting, leaderboard)

---

## 🗺️ What You Can Test

### 1. **Profile Page** (`/profile`)
- View earned badges
- See badge progress
- Check user stats (points, contributions)

### 2. **Map Page** (`/map`)
- Interactive Leaflet map of NYC
- View infrastructure locations (hydrants, etc.)
- See markers and popups

### 3. **Report Infrastructure** (`/verify-infrastructure`)
- Submit new infrastructure reports
- Upload photos (via Supabase Storage)
- GPS location capture
- AI-powered neighborhood detection

### 4. **Leaderboard** (`/leaderboard`)
- See top contributors
- Rankings based on points

---

## 🏆 Demo Account Badges

The demo account has earned badges for:
- 🐀 **NYC Rat** - Times Square location
- 🐦 **NYC Pigeon** - Central Park location
- 🐿️ **NYC Squirrel** - Greenwich Village location
- (And possibly more!)

Each badge:
- Is **AI-generated** using Google Gemini
- Stored in **Supabase Storage**
- Associated with specific NYC neighborhoods

---

## 🔧 Technical Features to Explore

### Frontend (React + Vite)
```
✅ React Router for navigation
✅ Supabase Auth integration
✅ Context API for global state
✅ Leaflet maps (react-leaflet)
✅ Axios for API calls
✅ Service layer architecture
```

### Backend (Django + Django Ninja)
```
✅ RESTful API with auto-documentation
✅ PostgreSQL database (Supabase)
✅ Geohashing for spatial queries
✅ Google Gemini AI integration
✅ Badge reward system
✅ File upload to Supabase Storage
```

### DevOps
```
✅ Frontend: Vercel (auto-deploy from GitHub)
✅ Backend: Render (uv package manager)
✅ Database: Supabase PostgreSQL
✅ CI/CD: Git-based deployments
```

---

## 📊 Key Endpoints (API)

### Backend API Documentation
- **Swagger UI**: https://streetcred-backend.onrender.com/api/docs
- **Badge API**: https://streetcred-backend.onrender.com/api/badges/docs

### Test API Directly
```bash
# Get all locations
curl https://streetcred-backend.onrender.com/api/locations

# Get demo user's badges (replace USER_ID)
curl https://streetcred-backend.onrender.com/api/badges/user-badges/USER_ID
```

---

## 🌟 Unique Features

### 1. **Geohashing for Performance**
- Converts GPS coordinates to strings for fast spatial queries
- Precision 7 (~153m) for area searches
- No PostGIS required - works with standard PostgreSQL

### 2. **AI-Powered Features**
- **Neighborhood Detection**: Identifies NYC neighborhoods from GPS
- **Badge Generation**: Creates unique badge artwork
- Google Gemini AI integration

### 3. **Gamification**
- Earn points for contributions
- Unlock badges based on locations visited
- Progress tracking system

### 4. **Hybrid Architecture**
- Django ORM for app-specific data (Location, Report models)
- Supabase direct access for shared data (badges, hydrants)
- Best of both worlds!

---

## 🔐 Security Features Implemented

```
✅ Environment variables for secrets
✅ CORS configuration (frontend ↔ backend)
✅ CSRF protection
✅ Supabase Row Level Security (RLS)
✅ JWT authentication
✅ Secure file uploads
```

---

## 📱 Responsive Design

The app works on:
- 💻 Desktop (primary target)
- 📱 Mobile (responsive design)
- 🖥️ Tablet

---

## 🐛 Known Limitations (For Demo)

- **Demo data**: Pre-populated for NYC only
- **Badge generation**: Already completed (one-time setup)
- **Free tier limits**: Supabase/Gemini AI free tiers
- **Demo account**: Shared credentials (not for production use)

---

## 📚 Documentation Files

For deeper technical understanding:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Complete project overview |
| `backend.md` | Django backend development guide |
| `frontend.md` | React frontend development guide |
| `streetcred_refinements.md` | Deployment improvements |
| `render-deploy-fix.md` | Render deployment troubleshooting |

---

## 💡 Interview Talking Points

### Architecture Decisions
- Why Django Ninja over Django REST Framework
- Why geohashing for spatial queries
- Hybrid database strategy (Django + Supabase)
- Service layer pattern in frontend

### Performance Optimizations
- Connection pooling (conn_max_age)
- Geohash indexing for fast spatial lookups
- Static file compression (WhiteNoise)
- Lazy loading and code splitting

### Scalability Considerations
- How to handle 10,000+ users
- Database optimization strategies
- Caching implementation ideas
- Cost optimization for AI APIs

---

## 🎥 Quick Demo Flow (2-3 minutes)

1. **Landing Page** → Click "Try Demo"
2. **Login** → One-click demo login
3. **Profile** → Show earned badges, points
4. **Map** → Interactive NYC infrastructure map
5. **Report** → Submit new infrastructure (optional)
6. **Leaderboard** → Show rankings

---

## 🆘 Troubleshooting

### "Demo login not working"
- Check Supabase Auth is working
- Verify user exists in Supabase dashboard
- Check browser console for errors

### "No badges showing"
- Verify badges were assigned in `user_badges` table
- Check Supabase connection
- Open browser Network tab to see API calls

### "Map not loading"
- Check Leaflet CSS is loaded
- Verify hydrants data in Supabase
- Console errors for details

---

## 📞 Contact

**Developer**: Brandon Lau
**GitHub**: https://github.com/BrandonLau8/streetcred
**Demo URL**: https://streetcred-eta.vercel.app

---

## ✨ Summary

**StreetCred** is a full-stack civic engagement platform that gamifies infrastructure reporting through:
- 🗺️ Interactive maps
- 🏆 Badge reward system
- 🤖 AI-powered features
- 📊 Progress tracking

**Tech Stack**: React + Django + Supabase + Google Gemini AI

**Demo Account**: `demo@streetcred.app` / `Demo123!`

**One-Click Demo**: Just visit the app and click the green button! 🚀

---

*Last Updated: November 2025*
