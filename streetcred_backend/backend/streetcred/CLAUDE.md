# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StreetCred is a Django-based backend for a location-based service that uses geohashing for efficient spatial queries. The project integrates with Supabase for authentication and data storage, and uses Folium for map visualization.

## Commands

### Development Server
```bash
python manage.py runserver
```

### Database Management
```bash
# Run migrations
python manage.py migrate

# Create migrations after model changes
python manage.py makemigrations

# Create superuser for admin panel
python manage.py createsuperuser
```

### Testing
```bash
# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test myapp

# Run with verbose output
python manage.py test --verbosity=2
```

### Django Shell
```bash
# Interactive Python shell with Django context
python manage.py shell
```

## Architecture

### Core Technology Stack
- **Framework**: Django 5.2.7 with standard Django apps (no Django REST Framework)
- **API Layer**: Django Ninja for API endpoints (defined but not fully integrated)
- **Database**: SQLite (development), with Supabase integration for user management
- **Geospatial**: pygeohash/python-geohash for location-based queries
- **Visualization**: Folium for interactive map rendering
- **Package Manager**: uv (see uv.lock)

### Project Structure
- **streetcred/**: Django project configuration
  - `settings.py`: Configuration including Supabase credentials from .env
  - `urls.py`: URL routing (currently uses function-based views, not Django Ninja)
- **myapp/**: Main application with all business logic
  - `models.py`: Location model with automatic geohash generation
  - `views.py`: Map visualization and location management (function-based views)
  - `auth.py`: Supabase authentication functions (signup/signin)
  - `api.py`: Django Ninja API endpoints (not yet integrated into urls.py)
  - `templates/myapp/map.html`: Folium map template

### Geohashing Implementation
The application uses geohashes for efficient location-based queries:
- **Precision 7**: ~153m radius, used for area searches (300m radius queries)
- **Precision 9**: ~4.8m radius, used for exact locations and duplicate detection
- All Location models auto-generate geohash on save via the model's `save()` method
- Geohash field is indexed for fast prefix-based spatial queries

Example query pattern (from api.py):
```python
# Get nearby facilities using geohash prefix
area_hash = pgh.encode(lat, lng, precision=7)
facilities = db.query("SELECT * FROM facilities WHERE geohash LIKE $1", f"{area_hash}%")
```

### Supabase Integration
- Authentication is handled via `myapp/auth.py` using Supabase client
- Credentials loaded from `.env` file (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Client initialized via `get_supabase_client()` helper function
- User data queries in `views.py` also use Supabase tables

### API Architecture Note
There's a discrepancy between the defined API endpoints:
- `myapp/api.py` defines Django Ninja endpoints (@app.get, @app.post) but these are not yet wired into `streetcred/urls.py`
- Current routing in `urls.py` uses traditional Django function-based views from `myapp/views.py`
- When integrating Django Ninja, add `path('api/', api.urls)` to `streetcred/urls.py`

### Environment Configuration
The project uses python-dotenv to load configuration from `.env` file. Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

### Database Schema
Location model stores geospatial data with indexes on:
- `geohash`: Primary spatial index for proximity queries
- `created_at`: Temporal queries and duplicate detection

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

### Migrating to Django Ninja APIs
When transitioning from function-based views to Django Ninja:
1. The API definitions in `myapp/api.py` need the NinjaAPI instance properly initialized (currently references undefined `app` variable)
2. Import and mount the API in `streetcred/urls.py`
3. Update frontend to call `/api/` prefixed endpoints
