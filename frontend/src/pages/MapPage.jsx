import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const MapPage = () => {
  const navigate = useNavigate();
  const [selectedInfrastructure, setSelectedInfrastructure] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hydrants, setHydrants] = useState([]);
  const [hydrantsLoading, setHydrantsLoading] = useState(false);
  const [hydrantsError, setHydrantsError] = useState(null);
  const watchIdRef = useRef(null);

  // TODO: Replace with actual user ID from your authentication system
  // For example: const { userId } = useAuth();
  const [userId, setUserId] = useState("a1f30266-3ffc-49d3-8ea5-fb3f78a79361");

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
        setLocationError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
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
        setLocationError(`Location tracking error: ${error.message}`);
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

  // Initialize location on component mount
  useEffect(() => {
    // For testing purposes - set hardcoded location
    const testLocation = {
      lat: 40.764812,
      lng: -73.965347,
      accuracy: 5
    };
    setUserLocation(testLocation);
    setLocationError(null);
    setIsTracking(true);
    console.log('Using test location:', testLocation);

    // Fetch hydrants for test location
    fetchHydrants(testLocation.lat, testLocation.lng, 0.5);

    // Uncomment these lines when you want real location tracking:
    // getCurrentLocation();
    // startLocationTracking();

    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, []);

  const handleVerifyInfrastructure = (type) => {
    setSelectedInfrastructure(type);
    navigate(`/verify-infrastructure?type=${type.id}`);
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
          </div>
        ) : (
          <div className="loading-location">
            Getting your location...
          </div>
        )}
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
                  Accuracy: ±{Math.round(userLocation.accuracy)}m
                </div>
              </Popup>
            </Marker>

            {/* Hydrant Markers */}
            {hydrants.map((hydrant) => (
              <Marker 
                key={hydrant.id}
                position={[hydrant.lat, hydrant.lon]}
              >
                <Popup>
                  <div>
                    <strong>Fire Hydrant</strong><br/>
                    ID: {hydrant.id}<br/>
                    Distance: {hydrant.distance_meters ? `${Math.round(hydrant.distance_meters)}m` : 'Unknown'}<br/>
                    Lat: {hydrant.lat.toFixed(6)}<br/>
                    Lng: {hydrant.lon.toFixed(6)}
                  </div>
                </Popup>
              </Marker>
            ))}
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
      <BadgeProgress userId={userId} />

      {/* User Badges */}
      <UserBadges userId={userId} />
    </div>
    </>
  );
};

export default MapPage;
