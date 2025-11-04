# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StreetCred is a full-stack location-based infrastructure verification platform that gamifies urban infrastructure reporting. The project consists of:

- **Frontend**: React + Vite application with Leaflet maps and Supabase authentication
- **Backend**: Django + Django Ninja API with AI-powered neighborhood detection and badge rewards system
- **Database**: Supabase (PostgreSQL with PostGIS) for data storage and authentication
- **AI Integration**: Google Gemini AI for neighborhood identification and badge image generation

The application allows users to report and verify infrastructure (fire hydrants, streetlights, etc.) on an interactive map, earning badges as rewards for contributions.

## Commands

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Backend Development
```bash
cd streetcred_backend/backend/streetcred

# Start Django development server (http://localhost:8000)
python manage.py runserver

# Or with uv
uv run python manage.py runserver
```

### Database Management
```bash
cd streetcred_backend/backend/streetcred

# Run migrations
python manage.py migrate

# Create migrations after model changes
python manage.py makemigrations

# Create superuser for admin panel
python manage.py createsuperuser
```

### Testing
```bash
# Backend tests
cd streetcred_backend/backend/streetcred
python manage.py test

# Run tests for specific app
python manage.py test myapp

# Run with verbose output
python manage.py test --verbosity=2

# Frontend tests
cd frontend
npm test
```

### Django Shell
```bash
cd streetcred_backend/backend/streetcred

# Interactive Python shell with Django context
python manage.py shell
```

## Architecture

### Core Technology Stack

#### Frontend
- **Framework**: React 19 with Vite for build tooling
- **Routing**: React Router DOM for client-side navigation
- **Mapping**: Leaflet + React Leaflet for interactive maps
- **Authentication**: Supabase JS client for auth and storage
- **HTTP Client**: Axios for API requests
- **Styling**: Custom CSS (Tailwind CSS mentioned in README)
- **Development**: Vite dev server with hot module replacement

#### Backend
- **Framework**: Django 5.2.7 with standard Django apps
- **API Layer**: Django Ninja for RESTful API endpoints
- **Database**: Supabase (PostgreSQL with PostGIS extensions)
- **Geospatial**: pygeohash/python-geohash for location-based queries
- **Map Visualization**: Folium for server-side map rendering
- **AI Integration**: Google Gemini AI for neighborhood detection and badge image generation
- **Storage**: Supabase Storage for badge images and user uploads
- **Package Manager**: uv (Python package manager)
- **CORS**: django-cors-headers for frontend/backend communication

#### Infrastructure
- **Database**: Supabase PostgreSQL with PostGIS for spatial queries
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage (public bucket for badges)
- **AI Services**: Google Gemini AI API

### Project Structure

```
streetcred/
├── frontend/                           # React frontend application
│   ├── src/
│   │   ├── pages/                     # Page components
│   │   │   ├── LandingPage.jsx        # Homepage
│   │   │   ├── LoginPage.jsx          # User login
│   │   │   ├── SignUp.jsx             # User registration
│   │   │   ├── MapPage.jsx            # Interactive map with Leaflet
│   │   │   ├── ProfilePage.jsx        # User profile with badges
│   │   │   ├── VerifyInfrastructurePage.jsx    # Report infrastructure
│   │   │   ├── VerifyUserInfrastructure.jsx    # Verify user reports
│   │   │   ├── Leaderboard.jsx        # User rankings
│   │   │   ├── BadgeEarned.jsx        # Badge notification screen
│   │   │   ├── ReportSubmittedPage.jsx         # Submission confirmation
│   │   │   └── About.jsx              # About page
│   │   ├── components/                # Reusable components
│   │   │   ├── navbar.jsx             # Navigation bar
│   │   │   ├── ProtectedRoute.jsx     # Auth route wrapper
│   │   │   ├── UserBadges.jsx         # Badge display component
│   │   │   └── BadgeProgress.jsx      # Badge progress tracker
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        # Authentication context provider
│   │   ├── services/                  # API service layers
│   │   │   ├── hydrantsAPI.js         # Hydrant data fetching
│   │   │   ├── badgesAPI.js           # Badge system API calls
│   │   │   └── locationService.js     # Location/neighborhood services
│   │   ├── Supabase/
│   │   │   └── client.js              # Supabase client configuration
│   │   ├── App.jsx                    # Main app component with routing
│   │   ├── main.jsx                   # React entry point
│   │   └── config.js                  # Frontend configuration
│   ├── package.json                   # npm dependencies
│   └── vite.config.js                 # Vite build configuration
│
├── streetcred_backend/
│   └── backend/streetcred/            # Django backend
│       ├── myapp/                     # Main Django app
│       │   ├── models.py              # Location model with geohash
│       │   ├── views.py               # Django function-based views
│       │   ├── api.py                 # Django Ninja API endpoints
│       │   ├── badge_api.py           # Badge rewards API
│       │   ├── badge_rewards.py       # Badge logic and assignment
│       │   ├── auth.py                # Supabase authentication
│       │   ├── locater.py             # AI neighborhood detection
│       │   ├── google_imggen.py       # AI badge image generation
│       │   └── upload_image.py        # Supabase Storage upload
│       ├── streetcred/                # Django project config
│       │   ├── settings.py            # Django settings + Supabase config
│       │   ├── urls.py                # URL routing
│       │   └── wsgi.py                # WSGI application
│       ├── manage.py                  # Django management CLI
│       ├── pyproject.toml             # uv dependencies
│       └── .env                       # Environment variables
│
├── CLAUDE.md                          # This file
└── README.md                          # Project documentation
```

### Geohashing Implementation
The application uses geohashes for efficient location-based queries:
- **Precision 7**: ~153m radius, used for area searches (300m radius queries)
- **Precision 9**: ~4.8m radius, used for exact locations and duplicate detection
- All Location models auto-generate geohash on save via the model's `save()` method
- Geohash field is indexed for fast prefix-based spatial queries

#### Why Geohashing?
Geohashing solves the "find nearby locations" problem efficiently by converting 2D proximity queries into fast string prefix lookups:

**Without Geohashing** (slow):
```python
# Calculates distance for EVERY location in database
for location in all_locations:
    if distance(user_lat, user_lng, location.lat, location.lng) < 300m:
        results.append(location)
```

**With Geohashing** (fast):
```python
# Uses indexed prefix search - one query instead of thousands of calculations
area_hash = pgh.encode(lat, lng, precision=7)  # "dr5regw"
nearby = Location.objects.filter(geohash__startswith=area_hash)
```

**Key Benefits**:
- **Spatial locality**: Nearby locations share geohash prefixes
- **Database indexing**: Standard B-tree index on string prefix (no PostGIS required)
- **SQLite compatible**: Works without spatial extensions
- **Scalable**: Precision 7 (~300m grid) enables single query for area searches

Example query pattern (from api.py):
```python
# Get nearby facilities using geohash prefix
area_hash = pgh.encode(lat, lng, precision=7)
facilities = db.query("SELECT * FROM facilities WHERE geohash LIKE $1", f"{area_hash}%")
```

### Supabase Integration
- Authentication is handled via `streetcred_backend/backend/streetcred/myapp/auth.py` using Supabase client
- Credentials loaded from `.env` file (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Client initialized via `get_supabase_client()` helper function
- User data queries in `views.py` also use Supabase tables
- **Storage Buckets**:
  - `badges`: Stores generated badge images (public bucket)
- **Tables**:
  - `badges`: Stores badge metadata (id, animal, location_name, image_url)
  - RLS policies configured for public read/write access

### Frontend Architecture

#### Application Flow
The frontend is a single-page application (SPA) with the following architecture:

1. **Entry Point** (`main.jsx`): Renders the root React app
2. **App Component** (`App.jsx`): Configures routing and wraps app in AuthProvider
3. **Routing**: React Router DOM handles client-side navigation
4. **Authentication**: AuthContext provides global auth state using Supabase Auth
5. **Protected Routes**: ProtectedRoute component guards authenticated pages

#### Key Features
- **Interactive Map**: Leaflet-based map showing infrastructure locations
- **Infrastructure Reporting**: Users can report and verify infrastructure with photos
- **Badge System**: Gamification with badges earned through contributions
- **Profile Management**: User profiles showing stats and earned badges
- **Leaderboard**: Ranking system for top contributors

#### API Integration
Frontend communicates with backend via service layers:
- `hydrantsAPI.js`: Fetches hydrant/infrastructure data from Django API
- `badgesAPI.js`: Manages badge assignments and progress
- `locationService.js`: Neighborhood detection and location services

All API calls use Axios with base URL configured in `config.js`.

### Backend API Architecture

The project uses Django Ninja for RESTful API endpoints:

#### API Endpoints
- **Main API** (`/api/`) - `myapp/api.py`:
  - `GET /locations` - Get all locations
  - `POST /location/add` - Add new location
  - `GET /locations/nearby` - Get nearby locations using geohash
  - `POST /report/create` - Create infrastructure report
  - `GET /supabase/hydrants` - Get hydrants from Supabase
  - `GET /identify-neighborhood/` - AI neighborhood detection

- **Badge API** (`/api/badges/`) - `myapp/badge_api.py`:
  - `GET /user-badges/{user_id}` - Get user's earned badges
  - `GET /badge-progress/{user_id}` - Get badge completion progress
  - `POST /assign-badge` - Assign badge to user
  - `POST /check-badge-eligibility` - Check if user earned new badges

- **Traditional Views** - `myapp/views.py`:
  - Map rendering with Folium
  - Some API routes (being migrated to Django Ninja)

All APIs are wired in `streetcred_backend/backend/streetcred/urls.py` with CORS enabled for frontend communication.

### Environment Configuration

#### Backend Environment Variables
The backend uses python-dotenv to load configuration from `streetcred_backend/backend/streetcred/.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration
GOOGLE_API_KEY=your_google_gemini_api_key

# Django Configuration
SECRET_KEY=your_django_secret_key
DEBUG=True
```

#### Frontend Environment Variables
The frontend may use environment variables in `.env` file at `frontend/.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

Note: Vite exposes environment variables prefixed with `VITE_` to the client.

### Database Schema

#### Django Models (SQLite/Local)
- **Location**: Stores location data with automatic geohash generation
  - `name`: Location name
  - `lat`, `lng`: Coordinates
  - `geohash`: Auto-generated geohash (precision 7 and 9)
  - `created_at`: Timestamp
  - Indexes: `geohash`, `created_at`

#### Supabase Tables (PostgreSQL)
- **profiles**: User profile information
- **hydrants**: Fire hydrant locations with PostGIS geometry
  - Includes spatial data for location-based queries
- **reports**: Infrastructure verification reports
  - Links to users and infrastructure locations
  - Includes photo URLs from Supabase Storage
- **badges**: Available badge definitions
  - `id`: Badge identifier
  - `animal`: Badge character (rat, pigeon, squirrel, etc.)
  - `location_name`: Associated NYC neighborhood
  - `image_url`: Badge image from Supabase Storage
- **user_badges**: User badge assignments
  - Links users to earned badges
- **badge_progress**: Badge completion tracking
  - Tracks progress toward badge requirements

## Development Workflow

### Full-Stack Development Setup

1. **Start Backend Server**:
   ```bash
   cd streetcred_backend/backend/streetcred
   python manage.py runserver  # Runs on http://localhost:8000
   ```

2. **Start Frontend Server** (in a separate terminal):
   ```bash
   cd frontend
   npm run dev  # Runs on http://localhost:5173
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/
   - API Docs: http://localhost:8000/api/docs

### Frontend → Backend Communication

The frontend communicates with the backend through:

1. **Direct API Calls** (via Axios):
   - Location services
   - Badge APIs
   - Report submission
   - Example: `axios.get('http://localhost:8000/api/locations')`

2. **Supabase Direct** (bypassing backend):
   - Authentication (login/signup)
   - Some data queries
   - File uploads to Supabase Storage

### Making Changes

#### Frontend Changes
1. Edit files in `frontend/src/`
2. Vite hot-reloads automatically
3. Check browser console for errors
4. Test API integrations

#### Backend Changes
1. Edit files in `streetcred_backend/backend/streetcred/myapp/`
2. Django auto-reloads on file changes
3. If changing models:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
4. Test API endpoints at `/api/docs`

### Common Development Tasks

#### Adding New API Endpoint
1. Define endpoint in `myapp/api.py` or `myapp/badge_api.py`
2. Django Ninja auto-generates docs at `/api/docs`
3. Add corresponding service in frontend (`frontend/src/services/`)
4. Call service from React component

#### Adding New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add navigation link in `frontend/src/components/navbar.jsx`
4. Wrap with `ProtectedRoute` if authentication required

#### Adding New Badge
1. Generate badge image:
   ```bash
   cd streetcred_backend/backend/streetcred
   python myapp/google_imggen.py
   ```
2. Upload to Supabase:
   ```bash
   python myapp/upload_image.py
   ```
3. Badge appears in `badges` table automatically

## Development Notes

### Adding New Locations
The Location model automatically generates geohashes on save. When creating locations:
```python
location = Location(name="Example", lat=37.7749, lng=-122.4194)
location.save()  # geohash automatically generated
```

### Working with Maps
Map views use Folium with custom markers and drawing tools. The map_view function:
1. Aggregates locations and calculates center point
2. Creates Folium map with OpenStreetMap tiles
3. Adds markers with geohash information in popups
4. Includes drawing tools plugin for adding new markers
5. Renders to HTML via `_repr_html_()`

### Location Identification
The `locater.py` module identifies NYC neighborhoods from GPS coordinates:
```python
# From within Django project
from myapp.locater import identify_location

location = identify_location(40.7580, -73.9855)  # Returns "Times Square"
```
- Located at `streetcred_backend/backend/streetcred/myapp/locater.py`
- Uses Google Gemini AI with 41 NYC neighborhood reference coordinates
- Optimized prompt with examples for accurate location matching
- Returns the most specific/granular neighborhood name

### Badge Generation Workflow
The badge generation system creates location-based character badges:

1. **Image Generation** (`google_imggen.py`):
   - Generates cartoon character badges (rat, pigeon, squirrel, etc.) for NYC locations
   - Uses Gemini AI image generation model (`gemini-2.5-flash-image`)
   - Supports batch generation for multiple locations and animals
   - Saves images to `gen_images/` folder with naming convention: `{Location_Name}_{animal}.png`

2. **Upload to Supabase** (`upload_image.py`):
   - Uploads images from `gen_images/` to Supabase Storage bucket `badges`
   - Extracts location and animal from filename automatically
   - Inserts metadata into `badges` table with public image URL
   - Supports batch processing of all images in folder

Example usage:
```bash
cd streetcred_backend/backend/streetcred

# Generate badges
python myapp/google_imggen.py

# Upload to Supabase
python myapp/upload_image.py
```

### API Documentation
Django Ninja automatically generates interactive API documentation:
- Swagger UI available at `/api/docs` for main API
- OpenAPI schema at `/api/openapi.json`
- Badge API docs at `/api/badges/docs`

## Troubleshooting

### Common Issues

#### CORS Errors
**Problem**: Frontend can't reach backend API

**Solution**: Check `streetcred_backend/backend/streetcred/streetcred/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React server
]
```

#### Supabase Connection Issues
**Problem**: Authentication or data queries failing

**Solutions**:
1. Verify `.env` files have correct Supabase credentials
2. Check Supabase project is active at https://app.supabase.com
3. Verify RLS (Row Level Security) policies allow access
4. Test connection with Supabase client directly

#### Google AI API Errors
**Problem**: Neighborhood detection or badge generation failing

**Solutions**:
1. Verify `GOOGLE_API_KEY` in backend `.env`
2. Check API quota and billing at https://console.cloud.google.com
3. Fallback system will activate for neighborhood detection
4. Check error logs in Django console

#### Frontend Not Loading
**Problem**: Blank page or errors in browser

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify `npm run dev` is running without errors
3. Clear browser cache and restart dev server
4. Check that all dependencies are installed (`npm install`)

#### Backend API Not Responding
**Problem**: API endpoints return 404 or 500 errors

**Solutions**:
1. Verify Django server is running (`python manage.py runserver`)
2. Check Django console for error stack traces
3. Test endpoints at `/api/docs` (Swagger UI)
4. Verify database migrations are up to date (`python manage.py migrate`)

#### Badge Images Not Showing
**Problem**: Badges display but images are broken

**Solutions**:
1. Check Supabase Storage bucket `badges` exists and is public
2. Verify image URLs in `badges` table are accessible
3. Re-run upload script: `python myapp/upload_image.py`
4. Check CORS settings on Supabase Storage bucket

### Development Best Practices

1. **Always run both servers** during frontend development
2. **Check API docs first** at `/api/docs` before implementing frontend calls
3. **Use Django migrations** for all model changes
4. **Test API endpoints** independently before integrating with frontend
5. **Monitor console logs** in both browser and Django terminal
6. **Keep dependencies updated** but test thoroughly after updates

## Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Django Ninja**: https://django-ninja.dev/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vite.dev/
- **Leaflet Documentation**: https://leafletjs.com/
- **Supabase Documentation**: https://supabase.com/docs
- **Google Gemini AI**: https://ai.google.dev/
