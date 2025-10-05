# Reports System

Location-based reporting system where users submit reports and automatically earn points and badges.

## How It Works

### Point Rewards
- **1 point** awarded per report submission
- Points automatically trigger badge awards at milestones (every 5 points)
- Uses existing badge reward system from `badge_rewards.py`

### Report Submission Flow
1. User submits report with `lat`, `lon`, and `description`
2. Report saved to `reports` table in Supabase
3. User automatically receives 1 point
4. System checks for badge milestones (5, 10, 15, etc.)
5. New badges awarded if milestone reached
6. Returns complete report + points/badge info

## Setup

### 1. Create Supabase Storage Bucket
In Supabase Dashboard → Storage:
- Create a new bucket named `report_images`
- Set to **Public** bucket
- Configure policies for public read, authenticated write

### 2. Run SQL Setup
Execute `reports_setup.sql` in Supabase SQL Editor to create:
- `reports` table with `image_url` field
- Indexes for efficient queries
- RLS policies for security
- View for reports with user info

### 3. Run Django Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Prerequisites
- Profiles table with `user_id` and `points` columns
- Badge system setup (see `BADGE_SYSTEM_README.md`)
- Supabase connection configured in `.env`

## API Endpoints

Base URL: `/api/reports/`

### 1. Submit Report & Earn Points
```http
POST /api/reports/submit
Content-Type: application/json

{
  "user_id": "uuid-here",
  "lat": 40.7580,
  "lon": -73.9855,
  "description": "Found a cool street art piece",
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",  // Optional
  "image_extension": "jpg"  // Optional, defaults to "jpg"
}
```

**Note**: The `image_base64` field is optional and accepts base64 encoded images. If provided, the image will be uploaded to Supabase Storage and the public URL will be stored with the report.

**Response:**
```json
{
  "report": {
    "id": 123,
    "user_id": "uuid",
    "lat": 40.7580,
    "lon": -73.9855,
    "description": "Found a cool street art piece",
    "image_url": "https://{project}.supabase.co/storage/v1/object/public/report_images/uuid/20251005_120000_abc123.jpg",
    "created_at": "2025-10-05T12:00:00"
  },
  "points_awarded": 1,
  "previous_points": 4,
  "new_points": 5,
  "new_badges": [
    {
      "milestone": 5,
      "badge": {
        "id": "badge-uuid",
        "animal": "rat",
        "location_name": "Times Square",
        "image_url": "https://..."
      },
      "awarded_at": "2025-10-05T12:00:00"
    }
  ],
  "total_badges": 1,
  "next_milestone": 10
}
```

### 2. Get User's Reports
```http
GET /api/reports/user/{user_id}
```

**Response:**
```json
{
  "user_id": "uuid",
  "total_reports": 15,
  "reports": [
    {
      "id": 123,
      "user_id": "uuid",
      "lat": 40.7580,
      "lon": -73.9855,
      "description": "Found a cool street art piece",
      "created_at": "2025-10-05T12:00:00"
    }
  ]
}
```

### 3. Get Recent Reports
```http
GET /api/reports/recent?limit=20
```

Returns the most recent reports from all users (default: 20).

### 4. Get Nearby Reports
```http
GET /api/reports/nearby?lat=40.7580&lon=-73.9855&radius_km=1.0
```

**Response:**
```json
{
  "lat": 40.7580,
  "lon": -73.9855,
  "radius_km": 1.0,
  "total_reports": 5,
  "reports": [
    {
      "id": 123,
      "user_id": "uuid",
      "lat": 40.7582,
      "lon": -73.9857,
      "description": "Report description",
      "created_at": "2025-10-05T12:00:00",
      "distance_km": 0.25
    }
  ]
}
```

## Database Schema

### reports Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| user_id | UUID | References profiles(user_id) |
| lat | DOUBLE PRECISION | Latitude |
| lon | DOUBLE PRECISION | Longitude |
| description | TEXT | Report description |
| image_url | TEXT | Optional image URL from Supabase Storage |
| created_at | TIMESTAMP | Auto-generated timestamp |

**Indexes:**
- `idx_reports_user_id` - Fast user queries
- `idx_reports_created_at` - Temporal queries
- `idx_reports_user_created` - User's recent reports

**RLS Policies:**
- Anyone can view all reports (public data)
- Users can only create their own reports
- Users can only update/delete their own reports

### Supabase Storage
**Bucket**: `report_images` (public)
- Stores user-uploaded report images
- Organized by user_id folders
- Filename format: `{user_id}/{timestamp}_{unique_id}.{ext}`
- Public read access, authenticated write access

## Python Usage

```python
from myapp.reports_api import submit_report
from myapp.badge_rewards import update_user_points

# Directly using Supabase
from myapp.badge_rewards import supabase

# Submit report manually
report = supabase.table("reports").insert({
    "user_id": "abc-123",
    "lat": 40.7580,
    "lon": -73.9855,
    "description": "Great coffee shop"
}).execute()

# Award points
result = update_user_points("abc-123", 1)
print(f"New points: {result['new_points']}")
print(f"Badges earned: {len(result['new_badges'])}")
```

## Frontend Integration Example

```javascript
// Submit a report with optional photo
async function submitReport(userId, lat, lon, description, imageFile = null) {
  let imageBase64 = null;
  let imageExtension = 'jpg';

  // Convert image to base64 if provided
  if (imageFile) {
    imageBase64 = await fileToBase64(imageFile);
    imageExtension = imageFile.name.split('.').pop() || 'jpg';
  }

  const response = await fetch('/api/reports/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      lat: lat,
      lon: lon,
      description: description,
      image_base64: imageBase64,
      image_extension: imageExtension
    })
  });

  const result = await response.json();

  // Show success message with points earned
  console.log(`Report submitted! Earned 1 point. Total: ${result.new_points}`);

  // Show badge notification if milestone reached
  if (result.new_badges.length > 0) {
    showBadgeNotification(result.new_badges);
  }

  return result;
}

// Helper: Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Camera Capture: Take photo and submit report
async function capturePhotoAndSubmit() {
  // Create file input for camera
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // Use rear camera on mobile

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Get current location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const description = prompt('Describe what you found:');

      if (description) {
        const result = await submitReport(userId, lat, lon, description, file);
        alert(`Report submitted! Image uploaded. +1 point (Total: ${result.new_points})`);
      }
    });
  };

  input.click();
}

// Get user's report history
async function getUserReports(userId) {
  const response = await fetch(`/api/reports/user/${userId}`);
  const data = await response.json();

  console.log(`User has submitted ${data.total_reports} reports`);
  return data.reports;
}

// Get nearby reports
async function getNearbyReports(lat, lon, radiusKm = 1.0) {
  const response = await fetch(
    `/api/reports/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`
  );
  return await response.json();
}

// Example: Submit report on map click
map.on('click', async (e) => {
  const { lat, lng } = e.latlng;
  const description = prompt('Enter report description:');

  if (description) {
    const result = await submitReport(currentUserId, lat, lng, description);
    alert(`Report submitted! +1 point (Total: ${result.new_points})`);
  }
});
```

## Integration with Existing Systems

### Badge System
Reports automatically integrate with the badge reward system:
- Each report awards 1 point via `update_user_points()`
- Badges auto-awarded at milestones (5, 10, 15 points)
- See `BADGE_SYSTEM_README.md` for badge details

### Location System
While the `Location` model uses geohashes, the `Report` model stores raw lat/lon:
- **Reports**: Store exact coordinates for user submissions
- **Locations**: Use geohash for spatial indexing of places

This separation allows:
- Precise report locations
- Flexible spatial queries on reports
- Future integration with location-based features

## Features

✅ Automatic point rewards (1 point per report)
✅ Automatic badge awards at milestones
✅ User report history tracking
✅ Recent reports feed
✅ Nearby reports search (Haversine distance)
✅ **Photo upload with reports** (base64 → Supabase Storage)
✅ RLS security policies
✅ Indexed for performance

## Testing

```bash
# Test with curl
curl -X POST http://localhost:8000/api/reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-uuid",
    "lat": 40.7580,
    "lon": -73.9855,
    "description": "Test report"
  }'

# Get user reports
curl http://localhost:8000/api/reports/user/test-uuid

# Get nearby reports
curl "http://localhost:8000/api/reports/nearby?lat=40.7580&lon=-73.9855&radius_km=1.0"
```

## Production Considerations

### Spatial Indexing
For production with large datasets, consider:
- PostGIS extension for advanced spatial queries
- Geohash indexing for faster proximity searches
- Spatial clustering for map visualization

### Rate Limiting
Implement rate limiting to prevent spam:
- Limit reports per user per hour
- Validate coordinates are within service area
- Check for duplicate reports in same location

### Data Validation
- Validate lat/lon bounds (-90 to 90, -180 to 180)
- Sanitize description input
- Enforce max description length
- Verify user_id exists in profiles table
