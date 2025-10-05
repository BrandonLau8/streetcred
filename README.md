# STREETCRED
# StreetCred Frontend

## Authentication
The frontend integrates with Supabase for authentication:
User Flow
User signs up or logs in via the frontend
Frontend sends authentication request to Supabase
Supabase returns a user session
Frontend stores user context for API calls and reporting


## 📸 Photo Upload
Users can attach photos to their reports:
Process
Frontend uploads image to Supabase Storage
Supabase returns a public URL
Frontend includes the URL in the report submission
Reports are displayed with images in the UI

## 🧪 Testing
Run Frontend Tests:
npm test
Test App in Browser:
npm run dev
# Opens frontend at http://localhost:5173

## 📚 Dependencies
--Key frontend packages:
--React 18 - Frontend framework
--React Router DOM - Client-side routing
--Supabase JS - Authentication & storage client
--Tailwind CSS - Styling
--Vite - Development server & build tool

## 📞 Support
For issues or questions:
Check troubleshooting section
Verify environment variables
Ensure Supabase project and Storage buckets are correctly configured
Test API endpoints individually


# StreetCred Backend

A Django-based backend API for the StreetCred infrastructure verification platform, featuring AI-powered neighborhood detection and Supabase integration.

## 🚀 Features

- **Django REST API** with Django Ninja framework
- **AI-Powered Location Detection** using Google Gemini AI
- **Supabase Integration** for database and authentication
- **CORS Support** for frontend communication
- **Badge System** for user rewards and progress tracking
- **Infrastructure Reporting** with photo upload support
- **Real-time Hydrant Detection** with PostGIS spatial queries

## 📋 Prerequisites

- **Python 3.11+**
- **uv** package manager
- **Supabase account** and project
- **Google AI API key** (for neighborhood detection)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd streetcred/streetcred_backend
```

### 2. Install uv (if not already installed)
```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### 3. Install Dependencies
```bash
cd backend/streetcred
uv sync
```

### 4. Environment Setup
Create a `.env` file in the `backend/streetcred/` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Django Configuration
SECRET_KEY=your_django_secret_key
DEBUG=True
```

## 🏃‍♂️ Running the Server

### Development Server
```bash
cd backend/streetcred
uv run python manage.py runserver
```

The server will start at `http://localhost:8000`

### Production Server
```bash
cd backend/streetcred
uv run python manage.py collectstatic
uv run python manage.py migrate
uv run gunicorn streetcred.wsgi:application
```

## 📊 Database Setup

### 1. Apply Migrations
```bash
uv run python manage.py migrate
```

### 2. Create Superuser (Optional)
```bash
uv run python manage.py createsuperuser
```

### 3. Supabase Database Schema
Ensure your Supabase database has the following tables:
- `profiles` - User profile information
- `hydrants` - Fire hydrant locations with PostGIS geometry
- `reports` - Infrastructure verification reports
- `user_badges` - User badge assignments
- `badge_progress` - Badge completion tracking

## 🔧 API Endpoints

### Core API (`/api/`)
- `GET /locations` - Get all locations
- `POST /location/add` - Add new location
- `GET /locations/nearby` - Get nearby locations
- `POST /report/create` - Create infrastructure report

### Supabase Integration (`/api/supabase/`)
- `GET /hydrants` - Get hydrants from Supabase
- `GET /{table_name}` - Get data from any Supabase table

### Badge System (`/api/badges/`)
- `GET /user-badges/{user_id}` - Get user's badges
- `GET /badge-progress/{user_id}` - Get badge progress
- `POST /assign-badge` - Assign badge to user

### Location Detection (`/api/identify-neighborhood/`)
- `GET /?lat={latitude}&lng={longitude}` - Identify NYC neighborhood

## 🗺️ Neighborhood Detection

The backend includes AI-powered neighborhood detection using Google Gemini AI:

### Features
- **40+ NYC neighborhoods** supported
- **Fallback system** using coordinate mapping
- **Error handling** for API failures
- **Real-time detection** from coordinates

### Supported Neighborhoods
- Times Square, Central Park, Battery Park City
- Chelsea, Greenwich Village, SoHo
- Financial District, Upper East/West Side
- Harlem, and many more...

## 🏗️ Project Structure

```
streetcred_backend/
├── backend/
│   └── streetcred/
│       ├── myapp/
│       │   ├── api.py              # Django Ninja API endpoints
│       │   ├── badge_api.py        # Badge system API
│       │   ├── locater.py          # AI neighborhood detection
│       │   ├── models.py           # Database models
│       │   ├── views.py            # Django views
│       │   └── auth.py             # Supabase authentication
│       ├── streetcred/
│       │   ├── settings.py         # Django settings
│       │   └── urls.py             # URL routing
│       ├── manage.py               # Django management
│       ├── pyproject.toml          # uv dependencies
│       └── .env                    # Environment variables
└── README.md
```

## 🔐 Authentication

The backend integrates with Supabase for authentication:

### User Flow
1. **Frontend** authenticates with Supabase
2. **Backend** validates user tokens
3. **API calls** include user context
4. **Reports** are linked to authenticated users

## 📸 Photo Upload

Infrastructure reports support photo uploads:

### Process
1. **Frontend** uploads to Supabase Storage
2. **Backend** receives photo URL
3. **Database** stores report with image reference
4. **Public URLs** generated for display

## 🧪 Testing

### Run Tests
```bash
uv run python manage.py test
```

### Test API Endpoints
```bash
# Test neighborhood detection
curl "http://localhost:8000/api/identify-neighborhood/?lat=40.7580&lng=-73.9855"

# Test hydrants endpoint
curl "http://localhost:8000/api/supabase/hydrants"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
```python
# In settings.py, ensure CORS is configured:
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # React dev server
]
```

#### 2. Supabase Connection Issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Ensure RLS policies allow API access

#### 3. Google AI API Errors
- Verify `GOOGLE_AI_API_KEY` is set correctly
- Check API quota and billing
- Fallback system will activate if AI fails

#### 4. Database Migration Issues
```bash
# Reset migrations if needed
uv run python manage.py migrate --fake-initial
```

## 📚 Dependencies

Key packages managed by `uv`:

- **Django 5.2.7** - Web framework
- **Django Ninja** - API framework
- **django-cors-headers** - CORS support
- **supabase** - Supabase client
- **google-genai** - Google AI integration
- **psycopg2** - PostgreSQL adapter
- **gunicorn** - Production WSGI server

## 🔄 Development Workflow

### 1. Start Development
```bash
cd backend/streetcred
uv run python manage.py runserver
```

### 2. Make Changes
- Edit code in `myapp/` directory
- Django auto-reloads on file changes

### 3. Test Changes
- Use browser or curl to test endpoints
- Check Django logs for errors

### 4. Deploy
```bash
uv run python manage.py collectstatic
uv run python manage.py migrate
uv run gunicorn streetcred.wsgi:application
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Django logs for errors
3. Verify environment variables
4. Test API endpoints individually

## 🎯 Next Steps

- [ ] Add more infrastructure types
- [ ] Implement real-time notifications
- [ ] Add admin dashboard
- [ ] Optimize database queries
- [ ] Add comprehensive testing suite

---

**Happy coding! 🚀**
