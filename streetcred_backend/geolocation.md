# Geolocation for Report Submission

Simple guide to get user's GPS coordinates for submitting reports.

## Overview

When users submit a report, we need their current location (latitude/longitude). This guide shows how to use the browser's Geolocation API to capture coordinates and send them to the report submission endpoint.

## Browser Geolocation API

### Basic Usage

```javascript
// Get user's current location
navigator.geolocation.getCurrentPosition(
    (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy; // meters

        console.log(`Location: ${lat}, ${lon} (±${accuracy}m)`);

        // Use these coordinates to submit report
        submitReport(lat, lon);
    },
    (error) => {
        console.error('Location error:', error.message);
    },
    {
        enableHighAccuracy: true,  // Use GPS if available
        timeout: 10000,            // Wait up to 10 seconds
        maximumAge: 0              // Don't use cached position
    }
);
```

### Error Handling

```javascript
function getLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success - got coordinates
            handleLocationSuccess(position);
        },
        (error) => {
            // Error handling
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert('Please enable location permissions');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Location information unavailable');
                    break;
                case error.TIMEOUT:
                    alert('Location request timed out');
                    break;
                default:
                    alert('Unknown error occurred');
            }
        }
    );
}
```

## Submit Report with Location

### API Endpoint

```
POST /api/reports/submit
```

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "lat": 40.7580,
  "lon": -73.9855,
  "description": "Broken fire hydrant",
  "image_base64": "base64-encoded-image",  // optional
  "image_extension": "jpg"                  // optional
}
```

### Complete Example

```javascript
async function submitReportWithLocation(userId, description, imageBase64 = null) {
    // 1. Get user's location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // 2. Submit report with coordinates
            try {
                const response = await fetch('/api/reports/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        lat: lat,
                        lon: lon,
                        description: description,
                        image_base64: imageBase64,
                        image_extension: 'jpg'
                    })
                });

                const data = await response.json();

                // 3. Show success
                alert(`Report submitted! You earned ${data.points_awarded} point(s)`);
                console.log('New badges:', data.new_badges);

            } catch (error) {
                console.error('Failed to submit report:', error);
                alert('Failed to submit report');
            }
        },
        (error) => {
            alert('Could not get your location. Please enable GPS.');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
}

// Usage
submitReportWithLocation(
    'user-uuid-here',
    'Broken street light on Main St',
    null  // or base64 image
);
```

## HTML Form Example

```html
<form id="report-form">
    <textarea id="description" placeholder="Describe the issue..." required></textarea>
    <input type="file" id="image" accept="image/*">
    <button type="submit">Submit Report</button>
    <div id="status"></div>
</form>

<script>
const form = document.getElementById('report-form');
const status = document.getElementById('status');
const userId = 'your-user-id';  // Get from auth

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    status.textContent = 'Getting your location...';

    // Get location
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            status.textContent = 'Uploading report...';

            // Convert image to base64 if provided
            let imageBase64 = null;
            if (imageFile) {
                imageBase64 = await fileToBase64(imageFile);
            }

            // Submit report
            try {
                const response = await fetch('/api/reports/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        lat: lat,
                        lon: lon,
                        description: description,
                        image_base64: imageBase64,
                        image_extension: imageFile ? imageFile.name.split('.').pop() : 'jpg'
                    })
                });

                const data = await response.json();
                status.textContent = `✅ Report submitted! +${data.points_awarded} points`;
                form.reset();

            } catch (error) {
                status.textContent = '❌ Failed to submit report';
                console.error(error);
            }
        },
        (error) => {
            status.textContent = '❌ Could not get location. Please enable GPS.';
        }
    );
});

// Helper: Convert File to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove "data:image/jpeg;base64," prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
    });
}
</script>
```

## Show Location on Map

If you want to show where the report will be submitted:

```javascript
// Using Leaflet.js
const map = L.map('map').setView([40.7580, -73.9855], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Center map on user location
    map.setView([lat, lon], 15);

    // Add marker
    L.marker([lat, lon])
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();
});
```

## Button to Get Current Position

```html
<style>
    .location-btn {
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }
    .location-btn:hover {
        background-color: #2980b9;
    }
    .location-btn:disabled {
        background-color: #95a5a6;
        cursor: not-allowed;
    }
    .coords-display {
        margin: 10px 0;
        padding: 10px;
        background-color: #ecf0f1;
        border-radius: 3px;
    }
    .success { color: #27ae60; }
    .error { color: #e74c3c; }
</style>

<form id="report-form">
    <textarea id="description" placeholder="Describe the issue..." required></textarea>

    <!-- Button to get location -->
    <button type="button" id="get-location-btn" class="location-btn">
        📍 Get My Location
    </button>

    <!-- Hidden fields auto-filled by geolocation -->
    <input type="hidden" id="lat" name="lat">
    <input type="hidden" id="lon" name="lon">

    <!-- Show coordinates to user -->
    <div id="coords-display" class="coords-display" style="display: none;"></div>

    <button type="submit" id="submit-btn" disabled>Submit Report</button>
</form>

<script>
const getLocationBtn = document.getElementById('get-location-btn');
const coordsDisplay = document.getElementById('coords-display');
const submitBtn = document.getElementById('submit-btn');
const latInput = document.getElementById('lat');
const lonInput = document.getElementById('lon');

// Click button to get location
getLocationBtn.addEventListener('click', () => {
    // Disable button and show loading
    getLocationBtn.disabled = true;
    getLocationBtn.textContent = '⏳ Getting location...';
    coordsDisplay.style.display = 'block';
    coordsDisplay.className = 'coords-display';
    coordsDisplay.textContent = 'Requesting your location...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            // Fill hidden fields
            latInput.value = lat;
            lonInput.value = lon;

            // Show success
            coordsDisplay.className = 'coords-display success';
            coordsDisplay.innerHTML = `
                ✅ Location found!<br>
                📍 ${lat.toFixed(6)}, ${lon.toFixed(6)}<br>
                📏 Accuracy: ±${Math.round(accuracy)}m
            `;

            // Update button
            getLocationBtn.textContent = '✅ Location Set';
            getLocationBtn.style.backgroundColor = '#27ae60';

            // Enable submit
            submitBtn.disabled = false;
        },
        (error) => {
            // Show error
            coordsDisplay.className = 'coords-display error';

            let errorMessage = '';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '❌ Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '❌ Location unavailable. Please try again.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '❌ Location request timed out. Please try again.';
                    break;
                default:
                    errorMessage = '❌ Unknown error occurred.';
            }

            coordsDisplay.textContent = errorMessage;

            // Re-enable button
            getLocationBtn.disabled = false;
            getLocationBtn.textContent = '📍 Get My Location';
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});

// On submit
document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const lat = parseFloat(latInput.value);
    const lon = parseFloat(lonInput.value);
    const description = document.getElementById('description').value;

    // Submit to API...
    console.log('Submitting:', { lat, lon, description });
});
</script>
```

## Security & Privacy

### HTTPS Required
Geolocation API only works on:
- `https://` (secure sites)
- `localhost` (development)

### User Permission
Users must grant permission. Show a friendly message:

```javascript
function requestLocation() {
    // Show explanation before requesting
    const message = "We need your location to submit the report at the correct place.";

    if (confirm(message)) {
        navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError
        );
    }
}
```

### Accuracy
- **High accuracy mode** (`enableHighAccuracy: true`): Uses GPS, drains battery
- **Normal mode**: Uses network/WiFi, faster but less accurate

```javascript
// For reports, use high accuracy
navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: true  // Better accuracy for precise locations
});
```

## Browser Compatibility

Supported by all modern browsers:
- Chrome 5+
- Firefox 3.5+
- Safari 5+
- Edge (all versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

Check support:
```javascript
if ('geolocation' in navigator) {
    // Supported
} else {
    alert('Geolocation not supported');
}
```

## Testing

### Test on localhost
```bash
# Start server
.venv/bin/python manage.py runserver

# Visit http://localhost:8000/map/
# Browser will prompt for location permission
```

### Mock Location (Development)
```javascript
// For testing without GPS
function getMockLocation() {
    return {
        coords: {
            latitude: 40.7580,
            longitude: -73.9855,
            accuracy: 10
        }
    };
}

// Use mock in development
const position = getMockLocation();
submitReport(position.coords.latitude, position.coords.longitude);
```

## Summary

**To submit a report with location:**

1. Request geolocation permission
2. Get `lat` and `lon` from `navigator.geolocation.getCurrentPosition()`
3. POST to `/api/reports/submit` with coordinates
4. Handle success/error responses

That's it! No database setup needed - just capture coordinates and send to the report API.
