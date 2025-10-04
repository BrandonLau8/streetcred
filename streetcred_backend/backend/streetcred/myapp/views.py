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
            "lat": loc.lat,
            "lng": loc.lng,
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

        # Add hydrants to locations list
        for hydrant in hydrants_response.data:
            # Generate geohash for hydrants
            geohash = pgh.encode(hydrant.get('lat', 0), hydrant.get('lng', 0), precision=7)
            locations.append({
                "lat": hydrant.get('lat'),
                "lng": hydrant.get('lng'),
                "name": hydrant.get('name', 'Hydrant'),
                "geohash": geohash,
                "type": "hydrant"
            })
    except Exception as e:
        # If Supabase fails, just skip hydrants and continue with locations
        print(f"Warning: Could not fetch hydrants from Supabase: {e}")

    # Create base map centered on all markers
    if locations:
        center_lat = sum(loc['lat'] for loc in locations) / len(locations)
        center_lng = sum(loc['lng'] for loc in locations) / len(locations)
    else:
        # Default to San Francisco if no locations
        center_lat, center_lng = 37.7749, -122.4194

    # Create folium map
    m = folium.Map(
        location=[center_lat, center_lng],
        zoom_start=13,
        tiles='OpenStreetMap'
    )

    # Add markers for each location
    for loc in locations:
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
            location=[loc['lat'], loc['lng']],
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

    context = {
        'map_html': map_html,
        'locations': locations
    }

    return render(request, 'myapp/map.html', context)


def add_location(request):
    """API endpoint to add a new location"""
    if request.method == 'POST':
        import json
        from .models import Location

        data = json.loads(request.body)

        lat = float(data.get('lat'))
        lng = float(data.get('lng'))
        name = data.get('name', 'New Location')

        # Save to database
        location = Location.objects.create(lat=lat, lng=lng, name=name)

        return JsonResponse({
            'status': 'success',
            'geohash': location.geohash,
            'location': {'lat': lat, 'lng': lng, 'name': name}
        })

    return JsonResponse({'status': 'error', 'message': 'POST required'}, status=400)
