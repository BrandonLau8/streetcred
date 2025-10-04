 from pygeohash.viz import plot_geohashes_folium  
 import pygeohash as pgh  
  
 # Your locations with coordinates  
 locations = [  
     (37.7749, -122.4194),  # San Francisco  
     (37.7750, -122.4195),  # Nearby location  
     (37.7760, -122.4200),  # Another location  
 ]  
  
 # Convert to geohashes  
 geohashes = [pgh.encode(lat, lng, precision=7) for lat, lng in locations]  
  
 # Create interactive map  
 map_obj = plot_geohashes_folium(  
     geohashes,  
     colors=["red", "blue", "green"]  # Optional: color per location  
 )  
  
 # Save to HTML file  
 map_obj.save("locations_map.html")  
  
 This creates an interactive Folium map that you can open in a browser. The map will show all your  
 locations as colored rectangles representing the geohash coverage areas.  
  
 To dynamically add locations: Folium also lets you add markers directly:  
  
 import folium  
  
 # Start with a base map centered on your area  
 map_obj = folium.Map(location=[37.7749, -122.4194], zoom_start=13)  
  
 # Add markers for each location  
 for lat, lng in locations:  
     folium.Marker(  
         location=[lat, lng],  
         popup=f"Location: {lat}, {lng}"  
     ).add_to(map_obj)  
  
 map_obj.save("markers_map.html")# PyGeoHash - Python Geohashing Library

A lightweight, dependency-free Python library for working with geohashes. Ideal for location-based applications like StreetCred's civic engagement platform.

## Installation

```bash
# Basic installation
pip install pygeohash

# With visualization support (includes matplotlib & folium)
pip install pygeohash[viz]
```

## What is a Geohash?

A geohash is a geocoding system that encodes geographic coordinates (latitude/longitude) into a short string of letters and digits. It's hierarchical - longer geohashes are more precise, and nearby locations share common prefixes.

**Example:**
- `ezs42` - Low precision (city-level)
- `ezs42e44yx96` - High precision (building-level)

## Core Functions

### 1. Encoding Coordinates

Convert latitude/longitude to geohash string.

```python
import pygeohash as pgh

# Full precision encoding (12 characters)
geohash = pgh.encode(latitude=42.6, longitude=-5.6)
# Returns: 'ezs42e44yx96'

# Controlled precision (5 characters)
short_geohash = pgh.encode(latitude=42.6, longitude=-5.6, precision=5)
# Returns: 'ezs42'

# Precision levels guide:
# 1-3: Country/State level
# 4-5: City level (~5-25km)
# 6-7: Neighborhood level (~1-5km)
# 8-9: Block level (~150m-600m)
# 10+: Building/Asset level (~20m-150m)
```

### 2. Decoding Geohashes

Convert geohash string back to coordinates.

```python
# Decode to latitude, longitude
lat, lng = pgh.decode(geohash='ezs42')
# Returns: (42.6, -5.6)

# Decode high-precision geohash
lat, lng = pgh.decode(geohash='ezs42e44yx96')
# Returns: (42.600000, -5.600000)
```

### 3. Distance Calculations

Calculate approximate distance between two geohashes.

```python
# Distance in meters
distance = pgh.geohash_approximate_distance(
    geohash_1='bcd3u',
    geohash_2='bc83n'
)
# Returns: distance in meters (float)

# Example: Check if two reports are nearby
report1_hash = 'dr5ru6'
report2_hash = 'dr5ru7'
distance = pgh.geohash_approximate_distance(report1_hash, report2_hash)

if distance < 50:  # Within 50 meters
    print("Possible duplicate report")
```

### 4. Adjacent Geohashes

Find neighboring geohash cells.

```python
# Get adjacent geohash
adjacent = pgh.get_adjacent(geohash='kd3ybyu', direction='right')

# Directions available:
# 'top', 'bottom', 'left', 'right'
# 'topleft', 'topright', 'bottomleft', 'bottomright'

# Example: Get all 8 neighbors
center_hash = 'dr5ru6'
neighbors = []
for direction in ['top', 'bottom', 'left', 'right',
                  'topleft', 'topright', 'bottomleft', 'bottomright']:
    neighbors.append(pgh.get_adjacent(center_hash, direction))
```

### 5. Haversine Distance (High Accuracy)

More accurate distance calculation using Haversine formula.

```python
# More accurate distance calculation
distance = pgh.geohash_haversine_distance(
    geohash_1='bcd3u',
    geohash_2='bc83n'
)
# Returns: distance in meters (float)

# Use this for critical distance checks where accuracy matters
# Slightly slower than approximate_distance but more precise
```

### 6. Bounding Box Operations

Get and work with geohash bounding boxes.

```python
# Get bounding box for a geohash
bbox = pgh.get_bounding_box(geohash='dr5ru6')
# Returns: (min_lat, max_lat, min_lng, max_lng)

# Check if a point is inside a geohash area
is_inside = pgh.is_point_in_geohash(
    latitude=37.7749,
    longitude=-122.4194,
    geohash='dr5ru6'
)
# Returns: True or False

# Check if a point is in a bounding box
in_box = pgh.is_point_in_box(
    latitude=37.7749,
    longitude=-122.4194,
    box=(37.77, 37.78, -122.42, -122.41)  # (min_lat, max_lat, min_lng, max_lng)
)

# Check if two bounding boxes intersect
intersects = pgh.do_boxes_intersect(
    box1=(37.77, 37.78, -122.42, -122.41),
    box2=(37.775, 37.785, -122.425, -122.415)
)

# Get all geohashes within a bounding box at specific precision
geohashes = pgh.geohashes_in_box(
    min_lat=37.77,
    max_lat=37.78,
    min_lng=-122.42,
    max_lng=-122.41,
    precision=7
)
# Returns: list of geohash strings covering the area
```

### 7. Statistical Functions

Calculate statistics on collections of geohashes.

```python
geohash_list = ['dr5ru6', 'dr5ru7', 'dr5ru5']

# Get mean center point
mean_lat, mean_lng = pgh.mean(geohash_list)

# Find extreme points
northernmost = pgh.northern(geohash_list)  # Returns geohash
southernmost = pgh.southern(geohash_list)
easternmost = pgh.eastern(geohash_list)
westernmost = pgh.western(geohash_list)

# Calculate variance and standard deviation
var_lat, var_lng = pgh.variance(geohash_list)
std_lat, std_lng = pgh.std(geohash_list)

# Use case: Find center of report cluster
report_hashes = [pgh.encode(r['lat'], r['lng'], 7) for r in reports]
center_lat, center_lng = pgh.mean(report_hashes)
print(f"Cluster center: {center_lat}, {center_lng}")
```

## Visualization (Optional)

### Static Matplotlib Plots

```python
from pygeohash.viz import plot_geohash, plot_geohashes
import matplotlib.pyplot as plt

# Plot single geohash area
fig, ax = plot_geohash("9q8yyk", color="red")
plt.title("Coverage Area")
plt.show()

# Plot multiple geohashes with color mapping
geohashes = ["9q8yyk", "9q8yym", "9q8yyj"]
fig, ax = plot_geohashes(geohashes, colors="viridis")
plt.title("Verified Areas")
plt.show()
```

### Interactive Folium Maps

```python
from pygeohash.viz import plot_geohash_folium, plot_geohashes_folium

# Interactive single geohash
map_obj = plot_geohash_folium("9q8yyk", color="red")
map_obj.save("coverage_map.html")

# Interactive multiple geohashes
geohashes = ["9q8yyk", "9q8yym", "9q8yyj"]
map_obj = plot_geohashes_folium(geohashes, colors=["red", "blue", "green"])
map_obj.save("multi_coverage.html")
```

## Use Cases for StreetCred

### 1. Coverage Heatmap & Grid System

Track which areas have been verified.

```python
import pygeohash as pgh
from collections import defaultdict

# Store coverage data by geohash
coverage_map = defaultdict(int)

# When user submits a report
def track_coverage(lat, lng, precision=7):
    """Track coverage at neighborhood level (precision=7)"""
    geohash = pgh.encode(lat, lng, precision=precision)
    coverage_map[geohash] += 1
    return geohash

# Example: Track multiple reports
reports = [
    (37.7749, -122.4194),  # San Francisco
    (37.7750, -122.4195),  # Nearby location
]

for lat, lng in reports:
    grid_cell = track_coverage(lat, lng)
    print(f"Grid cell {grid_cell}: {coverage_map[grid_cell]} reports")

# Find low-coverage areas
low_coverage = [h for h, count in coverage_map.items() if count < 5]
print(f"Needs verification: {low_coverage}")
```

### 2. Duplicate Detection

Identify reports for the same asset.

```python
def check_duplicate_report(new_lat, new_lng, existing_reports, threshold_m=50):
    """Check if report is near existing ones"""
    new_hash = pgh.encode(new_lat, new_lng, precision=9)

    for report in existing_reports:
        existing_hash = pgh.encode(report['lat'], report['lng'], precision=9)
        distance = pgh.geohash_approximate_distance(new_hash, existing_hash)

        if distance < threshold_m:
            return True, report['id'], distance

    return False, None, None

# Example usage
existing = [
    {'id': 1, 'lat': 37.7749, 'lng': -122.4194},
    {'id': 2, 'lat': 37.7850, 'lng': -122.4100},
]

is_dup, dup_id, dist = check_duplicate_report(37.7750, -122.4195, existing)
if is_dup:
    print(f"Duplicate of report #{dup_id} ({dist:.1f}m away)")
```

### 3. Proximity Quests

Generate location-based challenges.

```python
def find_nearby_facilities(user_lat, user_lng, all_facilities, radius_m=500):
    """Find facilities within radius for quest generation"""
    user_hash = pgh.encode(user_lat, user_lng, precision=8)
    nearby = []

    for facility in all_facilities:
        facility_hash = pgh.encode(
            facility['lat'],
            facility['lng'],
            precision=8
        )
        distance = pgh.geohash_approximate_distance(user_hash, facility_hash)

        if distance <= radius_m:
            nearby.append({
                **facility,
                'distance': distance
            })

    return sorted(nearby, key=lambda x: x['distance'])

# Example: Generate quest
user_location = (37.7749, -122.4194)
facilities = [
    {'id': 1, 'type': 'sign', 'lat': 37.7750, 'lng': -122.4195},
    {'id': 2, 'type': 'light', 'lat': 37.7760, 'lng': -122.4200},
    {'id': 3, 'type': 'bench', 'lat': 37.7900, 'lng': -122.4300},
]

quest_targets = find_nearby_facilities(*user_location, facilities, radius_m=500)
print(f"Quest: Verify {len(quest_targets)} assets within 500m")
```

### 4. Rarity Bonus Calculation

Reward users for verifying low-coverage areas.

```python
def calculate_rarity_bonus(lat, lng, coverage_map, precision=7):
    """Calculate bonus points for low-coverage areas"""
    geohash = pgh.encode(lat, lng, precision=precision)

    # Get coverage count for this grid cell
    cell_coverage = coverage_map.get(geohash, 0)

    # Bonus: 10 points for zero coverage, decreasing to 0 at 50+ reports
    rarity_bonus = max(0, 10 - (cell_coverage * 0.2))

    return round(rarity_bonus, 1)

# Example scoring
coverage_data = {
    'dr5ru6': 2,   # Low coverage
    'dr5ru7': 45,  # High coverage
}

bonus1 = calculate_rarity_bonus(37.7749, -122.4194, coverage_data)
bonus2 = calculate_rarity_bonus(37.7750, -122.4195, coverage_data)

print(f"Rarity bonuses: {bonus1}, {bonus2}")
```

### 5. GPS Accuracy Verification

Validate that user is near the asset.

```python
def verify_gps_proximity(reported_lat, reported_lng, asset_lat, asset_lng, max_distance=50):
    """Verify user is within acceptable range of asset"""
    reported_hash = pgh.encode(reported_lat, reported_lng, precision=9)
    asset_hash = pgh.encode(asset_lat, asset_lng, precision=9)

    distance = pgh.geohash_approximate_distance(reported_hash, asset_hash)

    if distance > max_distance:
        return False, distance, "GPS too far from asset"

    # GPS bonus: closer = more points
    gps_bonus = max(0, 5 - (distance / 10))

    return True, distance, gps_bonus

# Example validation
asset_location = (37.7749, -122.4194)
user_report = (37.7750, -122.4195)

valid, dist, bonus = verify_gps_proximity(*user_report, *asset_location)
if valid:
    print(f"Valid report! GPS bonus: +{bonus:.1f} points ({dist:.1f}m away)")
```

### 6. Admin Coverage Dashboard

Identify areas needing verification.

```python
def generate_coverage_report(all_reports, precision=6):
    """Generate coverage statistics by area"""
    from collections import Counter

    # Count reports per grid cell
    grid_counts = Counter()
    for report in all_reports:
        geohash = pgh.encode(report['lat'], report['lng'], precision=precision)
        grid_counts[geohash] += 1

    # Find coverage gaps
    total_cells = len(grid_counts)
    low_coverage = [h for h, count in grid_counts.items() if count < 5]
    high_coverage = [h for h, count in grid_counts.items() if count >= 20]

    return {
        'total_grid_cells': total_cells,
        'low_coverage_cells': len(low_coverage),
        'high_coverage_cells': len(high_coverage),
        'low_coverage_hashes': low_coverage[:10],  # Top 10 to focus on
        'avg_reports_per_cell': sum(grid_counts.values()) / total_cells
    }

# Example dashboard
reports = [
    {'lat': 37.7749, 'lng': -122.4194},
    {'lat': 37.7750, 'lng': -122.4195},
    # ... more reports
]

stats = generate_coverage_report(reports, precision=6)
print(f"Coverage: {stats['total_grid_cells']} cells")
print(f"Need verification: {stats['low_coverage_hashes']}")
```

### 7. Spatial Indexing for Fast Queries

Use geohash prefixes for efficient database queries.

```python
# SQL query optimization using geohash prefix
def get_facilities_in_area(center_lat, center_lng, precision=6):
    """Get all facilities in same geohash area"""
    area_hash = pgh.encode(center_lat, center_lng, precision=precision)

    # SQL: WHERE geohash LIKE 'dr5ru%'
    # This uses index for fast filtering
    sql = f"""
        SELECT * FROM facilities
        WHERE geohash LIKE '{area_hash}%'
    """
    return sql

# Example: Query facilities near user
query = get_facilities_in_area(37.7749, -122.4194, precision=6)
print(query)
```

### 8. Rate Limiting by Location

Prevent spam from same location.

```python
from datetime import datetime, timedelta

def check_rate_limit(user_id, lat, lng, recent_reports, cooldown_minutes=5):
    """Prevent multiple reports from same grid cell too quickly"""
    location_hash = pgh.encode(lat, lng, precision=8)

    # Check recent reports from this user in this grid cell
    cutoff_time = datetime.now() - timedelta(minutes=cooldown_minutes)

    for report in recent_reports:
        if report['user_id'] == user_id:
            report_hash = pgh.encode(report['lat'], report['lng'], precision=8)

            # Same grid cell?
            if report_hash == location_hash and report['created_at'] > cutoff_time:
                time_left = cooldown_minutes - (datetime.now() - report['created_at']).seconds / 60
                return False, f"Wait {time_left:.1f} minutes before reporting here again"

    return True, "OK"

# Example
recent = [
    {'user_id': 123, 'lat': 37.7749, 'lng': -122.4194,
     'created_at': datetime.now() - timedelta(minutes=2)}
]

allowed, msg = check_rate_limit(123, 37.7750, -122.4195, recent)
print(msg)
```

## Best Practices for StreetCred

### Recommended Precision Levels

```python
# For different use cases:
PRECISION_LEVELS = {
    'coverage_grid': 6,      # ~1.2km x 0.6km (neighborhood)
    'duplicate_check': 9,    # ~5m x 5m (asset level)
    'quest_proximity': 7,    # ~150m x 150m (block)
    'rarity_bonus': 6,       # Same as coverage grid
    'rate_limiting': 8,      # ~40m x 20m (prevent spam)
    'storage_index': 7,      # Database indexing efficiency
}
```

### Database Schema Integration

```sql
-- Add geohash column to facilities table
ALTER TABLE facilities ADD COLUMN geohash VARCHAR(12);

-- Create index for fast lookups
CREATE INDEX idx_facilities_geohash ON facilities(geohash);

-- Update geohash on insert/update (PostgreSQL example)
CREATE OR REPLACE FUNCTION update_geohash()
RETURNS TRIGGER AS $$
BEGIN
    -- Use precision 9 for facility-level accuracy
    NEW.geohash = encode_geohash(NEW.lat, NEW.lng, 9);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER facilities_geohash_trigger
BEFORE INSERT OR UPDATE ON facilities
FOR EACH ROW EXECUTE FUNCTION update_geohash();
```

### FastAPI Integration Example

```python
from fastapi import FastAPI, HTTPException
import pygeohash as pgh

app = FastAPI()

@app.get("/v1/facilities")
async def get_nearby_facilities(lat: float, lng: float, radius: int = 300):
    """Get facilities near coordinates"""
    # Convert radius to appropriate precision
    # 300m ≈ precision 7
    area_hash = pgh.encode(lat, lng, precision=7)

    # Query DB with geohash prefix for efficiency
    facilities = await db.query(
        "SELECT * FROM facilities WHERE geohash LIKE $1",
        f"{area_hash}%"
    )

    # Filter by exact distance
    results = []
    for facility in facilities:
        distance = pgh.geohash_approximate_distance(
            pgh.encode(lat, lng, 9),
            facility.geohash
        )
        if distance <= radius:
            results.append({**facility, 'distance': distance})

    return sorted(results, key=lambda x: x['distance'])

@app.post("/v1/reports")
async def create_report(lat: float, lng: float, facility_id: int):
    """Create report with duplicate detection"""
    # Check for duplicates
    report_hash = pgh.encode(lat, lng, precision=9)

    existing = await db.query(
        """SELECT * FROM reports
           WHERE facility_id = $1
           AND created_at > NOW() - INTERVAL '1 hour'""",
        facility_id
    )

    for report in existing:
        distance = pgh.geohash_approximate_distance(
            report_hash,
            pgh.encode(report.lat, report.lng, 9)
        )
        if distance < 50:  # Within 50m
            raise HTTPException(400, "Duplicate report detected")

    # Create report...
    return {"status": "created"}
```

## Performance Considerations

- **Encoding/Decoding**: O(1) - Very fast
- **Distance Calculation**: Approximate, not geodesic (small error at large distances)
- **Database Indexing**: Use B-tree index on VARCHAR for geohash column
- **Precision Trade-off**: Higher precision = more storage, but better accuracy

## Common Gotchas

1. **Geohash boundaries**: Points near grid edges might not share prefix despite being close
   - Solution: Check neighboring cells for proximity searches

2. **Distance is approximate**: Uses geohash centers, not true geodesic distance
   - Solution: For critical distance checks, use PostGIS or geopy for exact calculations

3. **Precision overflow**: Don't exceed 12 characters
   - Solution: Validate precision parameter (1-12)

## Complete API Reference

### Encoding/Decoding
- `encode(latitude, longitude, precision=12)` → str - Convert coordinates to geohash
- `decode(geohash)` → (float, float) - Convert geohash to lat/lng

### Distance Calculations
- `geohash_approximate_distance(geohash_1, geohash_2)` → float - Fast approximate distance in meters
- `geohash_haversine_distance(geohash_1, geohash_2)` → float - Accurate distance using Haversine formula

### Navigation
- `get_adjacent(geohash, direction)` → str - Get neighboring geohash cell

### Bounding Boxes
- `get_bounding_box(geohash)` → (min_lat, max_lat, min_lng, max_lng) - Get geohash bounds
- `is_point_in_geohash(latitude, longitude, geohash)` → bool - Check if point is in geohash
- `is_point_in_box(latitude, longitude, box)` → bool - Check if point is in bounding box
- `do_boxes_intersect(box1, box2)` → bool - Check if two boxes overlap
- `geohashes_in_box(min_lat, max_lat, min_lng, max_lng, precision)` → list[str] - Get all geohashes in area

### Statistics
- `mean(geohash_list)` → (float, float) - Calculate mean center point
- `northern(geohash_list)` → str - Find northernmost geohash
- `southern(geohash_list)` → str - Find southernmost geohash
- `eastern(geohash_list)` → str - Find easternmost geohash
- `western(geohash_list)` → str - Find westernmost geohash
- `variance(geohash_list)` → (float, float) - Calculate variance in lat/lng
- `std(geohash_list)` → (float, float) - Calculate standard deviation in lat/lng

### Visualization (requires pygeohash[viz])
- `plot_geohash(geohash, color)` → (fig, ax) - Matplotlib plot of single geohash
- `plot_geohashes(geohash_list, colors)` → (fig, ax) - Matplotlib plot of multiple geohashes
- `plot_geohash_folium(geohash, color)` → folium.Map - Interactive map of single geohash
- `plot_geohashes_folium(geohash_list, colors)` → folium.Map - Interactive map of multiple geohashes

## Resources

- **Official Documentation**: https://pygeohash.mcginniscommawill.com/
- **PyPI**: https://pypi.org/project/pygeohash/
- **GitHub**: https://github.com/wdm0006/pygeohash
- **Geohash Algorithm**: http://geohash.org
- **StreetCred Context**: See `CLAUDE.md` for full platform architecture
