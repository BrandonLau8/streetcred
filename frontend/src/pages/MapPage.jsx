import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import Navbar from "../components/navbar.jsx"
import UserBadges from "../components/UserBadges.jsx"
import BadgeProgress from "../components/BadgeProgress.jsx"
import { getClosestHydrants } from '../services/hydrantsAPI';

// Fix for default markers in react-leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom user location icon
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="10" fill="#22c55e" stroke="white" stroke-width="3"/>
      <circle cx="12.5" cy="12.5" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5],
});

// Component to automatically center map when location changes
const MapCenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const MapPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedInfrastructure, setSelectedInfrastructure] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hydrants, setHydrants] = useState([]);
  const [hydrantsLoading, setHydrantsLoading] = useState(false);
  const [hydrantsError, setHydrantsError] = useState(null);
  const watchIdRef = useRef(null);

  const infrastructureTypes = [
    { id: 'hydrant', name: 'Fire Hydrant', icon: '🚰', color: '#ff0000' },
    { id: 'pothole', name: 'Pothole', icon: '🕳️', color: '#8b4513' },
    { id: 'streetlight', name: 'Street Light', icon: '💡', color: '#ffff00' }
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocationError(null);
        console.log('Current location:', location);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Don't use cached position for initial request
      }
    );
  };

  // Start watching user's location for real-time updates
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setLocationError(null);
        console.log('Location updated:', location);
      },
      (error) => {
        console.error('Error tracking location:', error);
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location tracking denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location tracking unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location tracking timed out.';
            break;
          default:
            errorMessage = `Location tracking error: ${error.message}`;
        }
        setLocationError(errorMessage);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000 // 10 seconds for real-time updates
      }
    );
  };

  // Stop watching user's location
  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsTracking(false);
    }
  };

  // Fetch hydrants when user location changes
  const fetchHydrants = async (lat, lng, radius = 0.5) => {
    setHydrantsLoading(true);
    setHydrantsError(null);
    
    try {
      const result = await getClosestHydrants(lat, lng, radius);
      
      if (result.success) {
        setHydrants(result.data);
        console.log(`Found ${result.count} hydrants within ${radius} miles`);
      } else {
        setHydrantsError(result.error);
        setHydrants([]);
      }
    } catch (error) {
      console.error('Error fetching hydrants:', error);
      setHydrantsError('Failed to fetch hydrants');
      setHydrants([]);
    } finally {
      setHydrantsLoading(false);
    }
  };

  // Fetch hydrants when user location changes
  useEffect(() => {
    if (userLocation) {
      fetchHydrants(userLocation.lat, userLocation.lng, 0.5);
    }
  }, [userLocation]);

  // Initialize location on component mount
  useEffect(() => {
    // For testing purposes - set hardcoded location
    const testLocation = {
      lat: 40.763272,
      lng: -73.979352,
      accuracy: 5
    };
    setUserLocation(testLocation);
    setLocationError(null);
    setIsTracking(true);
    console.log('Using test location:', testLocation);

    // Uncomment these lines when you want real location tracking:
    // getCurrentLocation();
    // startLocationTracking();

    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, []);

  // Function to update test location (for testing different areas)
  const updateTestLocation = (lat, lng) => {
    const newLocation = {
      lat: lat,
      lng: lng,
      accuracy: 5
    };
    setUserLocation(newLocation);
    console.log('Updated test location:', newLocation);
  };

  const handleVerifyInfrastructure = (type) => {
    if (!userLocation) {
      setLocationError('Please wait for your location to be determined before verifying infrastructure.');
      return;
    }

    setSelectedInfrastructure(type);
    // Pass location data via navigation state
    navigate(`/verify-infrastructure?type=${type.id}`, {
      state: {
        userLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          accuracy: userLocation.accuracy
        }
      }
    });
  };

  // Handle hydrant click - only allow if within 100ft (30.48m)
  const handleHydrantClick = (hydrant) => {
    if (!userLocation) return;
    
    const distanceMeters = hydrant.distance_meters;
    const distanceFeet = distanceMeters * 3.28084; // Convert meters to feet
    
    if (distanceMeters <= 30.48) { // 100 feet = 30.48 meters
      // User is close enough, navigate to verify page
      navigate(`/verify-infrastructure?type=hydrant&hydrantId=${hydrant.id}&lat=${hydrant.lat}&lng=${hydrant.lon}`);
    } else {
      // User is too far, show alert
      alert(`You need to be within 100 feet to verify this hydrant. You are currently ${Math.round(distanceFeet)} feet away.`);
    }
  };

  return (
    <>
    <Navbar />
    <div className="map-page">
      {/* Location Status */}
      <div className="location-status">
        {locationError ? (
          <div className="error-message">
            {locationError}
            <button onClick={getCurrentLocation} className="retry-button">
              Retry
            </button>
          </div>
        ) : userLocation ? (
          <div className="location-info">
            <span className="tracking-indicator">
              {isTracking ? '🟢' : '🔴'} Location Tracking: {isTracking ? 'Active' : 'Inactive'}
            </span>
            <span className="coordinates">
              {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
            </span>
            <span className="accuracy">
              Accuracy: ±{Math.round(userLocation.accuracy)}m
            </span>
            <span className="hydrants-count">
              {hydrantsLoading ? 'Loading hydrants...' : `${hydrants.length} hydrants nearby`}
            </span>

            <span className="hydrants-in-range">
              {hydrantsLoading ? '' : `${hydrants.filter(h => h.distance_meters <= 30.48).length} within 100ft`}
            </span>
          </div>
        ) : (
          <div className="loading-location">
            Getting your location...
            <button onClick={getCurrentLocation} className="retry-button">
              Refresh Location
            </button>
          </div>
        )}
      </div>

      {/* Test Location Controls */}
      <div className="test-location-controls">
        <h4>Test Different Locations:</h4>
        <div className="location-buttons">
          <button 
            className="location-btn"
            onClick={() => updateTestLocation(40.767779, -73.976940)}
          >
            Central Park
          </button>
          <button 
            className="location-btn"
            onClick={() => updateTestLocation(40.70390676017579, -74.01372957903186)}
          >
            Battery Park
          </button>
          <button 
            className="location-btn"
            onClick={() => updateTestLocation(40.7499, -73.9943)}
          >
            Times Square
          </button>
          <button 
            className="location-btn"
            onClick={() => updateTestLocation(40.806807, -73.964200)}
          >
            Columbia University
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="map-container">
        {userLocation ? (
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={16}
            style={{ height: '500px', width: '100%' }}
            className="leaflet-map"
          >
            <MapCenter center={[userLocation.lat, userLocation.lng]} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location Marker */}
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userLocationIcon}
            >
              <Popup>
                <div>
                  <strong>Your Location</strong><br/>
                  Lat: {userLocation.lat.toFixed(6)}<br/>
                  Lng: {userLocation.lng.toFixed(6)}<br/>
                  Accuracy: ±{Math.round(userLocation.accuracy)}m<br/>
                  <button
                    onClick={() => navigate('/verify-user-infrastructure?type=hydrant', {
                      state: {
                        userLocation: {
                          lat: userLocation.lat,
                          lng: userLocation.lng,
                          accuracy: userLocation.accuracy
                        }
                      }
                    })}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Report Here
                  </button>
                </div>
              </Popup>
            </Marker>

            {/* Hydrant Markers */}
            {hydrants.map((hydrant) => {
              const distanceMeters = hydrant.distance_meters;
              const distanceFeet = distanceMeters * 3.28084;
              const isWithinRange = distanceMeters <= 30.48; // 100 feet
              
              return (
                <Marker 
                  key={hydrant.id}
                  position={[hydrant.lat, hydrant.lon]}
                  eventHandlers={{
                    click: () => handleHydrantClick(hydrant)
                  }}
                >
                  <Popup>
                    <div>
                      <strong>Fire Hydrant</strong><br/>
                      ID: {hydrant.id}<br/>
                      Distance: {Math.round(distanceFeet)} ft ({Math.round(distanceMeters)}m)<br/>
                      {isWithinRange ? (
                        <span style={{color: 'green', fontWeight: 'bold'}}>
                          ✅ Click to verify (within range)
                        </span>
                      ) : (
                        <span style={{color: 'red'}}>
                          ❌ Too far to verify
                        </span>
                      )}
                      <br/>
                      Lat: {hydrant.lat.toFixed(6)}<br/>
                      Lng: {hydrant.lon.toFixed(6)}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="map-placeholder">
            <div className="loading-map">
              Loading map...
            </div>
          </div>
        )}
      </div>

      {/* Infrastructure Types */}
      <div className="infrastructure-types">
        <h3>Select infrastructure to verify:</h3>
        <div className="type-grid">
          {infrastructureTypes.map((type) => (
            <button
              key={type.id}
              className="type-button"
              onClick={() => handleVerifyInfrastructure(type)}
            >
              <span className="type-icon">{type.icon}</span>
              <span className="type-name">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Badge Progress */}
      <BadgeProgress userId={user?.id} />

      {/* User Badges */}
      <UserBadges userId={user?.id} />
    </div>
    </>
  );
};

export default MapPage;
