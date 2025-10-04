from django.shortcuts import render
from django.http import JsonResponse
import pygeohash as pgh
import folium
from folium import plugins
from django.http import JsonResponse
from .auth import get_supabase_client

# Create your views here.

def get_users(request):
    supabase = get_supabase_client()
    response = supabase.table('users').select('*').execute()
    return JsonResponse(response.data, safe=False)

def create_user(request):
    supabase = get_supabase_client()
    data = {
        'name': request.POST.get('name'),
        'email': request.POST.get('email')
    }
    response = supabase.table('users').insert(data).execute()
    return JsonResponse(response.data, safe=False)


def map_view(request):
    """Display interactive map with locations"""
    from .models import Location

    # Get all locations from Django database
    location_objs = Location.objects.all().order_by('-created_at')

    # Convert to list of dicts for template
    locations = [
        {
            "id": loc.id,
            "lat": loc.lat,
            "lon": loc.lon,
            "name": loc.name,
            "geohash": loc.geohash,
            "type": "location"
        }
        for loc in location_objs
    ]

    # Get hydrants from Supabase (with error handling)
    try:
        supabase = get_supabase_client()
        hydrants_response = supabase.table('hydrants').select('*').execute()

        print(f"DEBUG: Fetched {len(hydrants_response.data)} hydrants from Supabase")
        print(f"DEBUG: Sample hydrant data: {hydrants_response.data[:2] if hydrants_response.data else 'None'}")

        # Add hydrants to locations list
        hydrants_added = 0
        for hydrant in hydrants_response.data:
            lat = hydrant.get('lat') or hydrant.get('latitude')
            lng = hydrant.get('lon') or hydrant.get('longitude') or hydrant.get('longitude')

            # Skip hydrants with invalid coordinates
            if lat is None or lng is None:
                print(f"DEBUG: Skipping hydrant with missing coords: {hydrant}")
                continue

            # Generate geohash for hydrants
            geohash = pgh.encode(float(lat), float(lng), precision=7)
            locations.append({
                "id": hydrant.get('id'),
                "lat": float(lat),
                "lon": float(lng),
                "name": hydrant.get('name') or hydrant.get('id') or 'Hydrant',
                "geohash": geohash,
                "type": "hydrant"
            })
            hydrants_added += 1

        print(f"DEBUG: Added {hydrants_added} hydrants to map")
    except Exception as e:
        # If Supabase fails, just skip hydrants and continue with locations
        print(f"ERROR: Could not fetch hydrants from Supabase: {e}")
        import traceback
        traceback.print_exc()

    # Create base map centered on all markers
    # Filter out any locations with None coordinates
    valid_locations = [loc for loc in locations if loc.get('lat') is not None and loc.get('lon') is not None]

    if valid_locations:
        center_lat = sum(loc['lat'] for loc in valid_locations) / len(valid_locations)
        center_lng = sum(loc['lon'] for loc in valid_locations) / len(valid_locations)
    else:
        # Default to San Francisco if no locations
        center_lat, center_lng = 37.7749, -122.4194

    # Create folium map
    m = folium.Map(
        location=[center_lat, center_lng],
        zoom_start=13,
        tiles='OpenStreetMap'
    )

    # Add markers for each valid location
    for loc in valid_locations:
        # Different icons for different types
        if loc.get('type') == 'hydrant':
            icon_color = 'blue'
            icon_name = 'tint'
            marker_type = '💧 Hydrant'
        else:
            icon_color = 'red'
            icon_name = 'info-sign'
            marker_type = '📍 Location'

        folium.Marker(
            location=[loc['lat'], loc['lon']],
            popup=f"<b>{marker_type}</b><br><b>{loc['name']}</b><br>Geohash: {loc['geohash']}",
            tooltip=loc['name'],
            icon=folium.Icon(color=icon_color, icon=icon_name)
        ).add_to(m)

    # Add drawing tools
    draw = plugins.Draw(
        export=True,
        position='topleft',
        draw_options={
            'polyline': False,
            'rectangle': False,
            'polygon': False,
            'circle': False,
            'circlemarker': False,
            'marker': True
        }
    )
    draw.add_to(m)

    # Get map HTML
    map_html = m._repr_html_()

    # Count how many of each type
    location_count = sum(1 for loc in valid_locations if loc.get('type') == 'location')
    hydrant_count = sum(1 for loc in valid_locations if loc.get('type') == 'hydrant')

    print(f"DEBUG FINAL: Rendering {location_count} locations and {hydrant_count} hydrants")
    print(f"DEBUG FINAL: Total valid_locations: {len(valid_locations)}")

    context = {
        'map_html': map_html,
        'locations': valid_locations
    }

    return render(request, 'myapp/map.html', context)


def add_location(request):
    """API endpoint to add a new location"""
    if request.method == 'POST':
        import json
        from .models import Location

        data = json.loads(request.body)

        lat = float(data.get('lat'))
        lon = float(data.get('lon'))
        name = data.get('name', 'New Location')

        # Save to database
        location = Location.objects.create(lat=lat, lon=lon, name=name)

        return JsonResponse({
            'status': 'success',
            'geohash': location.geohash,
            'location': {'lat': lat, 'lon': lon, 'name': name}
        })

    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=400)
