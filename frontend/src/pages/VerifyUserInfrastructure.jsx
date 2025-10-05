import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addPoints } from '../services/badgesAPI';
import './VerifyInfrastructurePage.css';

const VerifyUserInfrastructure = () => {
  const [searchParams] = useSearchParams();
  const infrastructureType = searchParams.get('type') || 'hydrant';
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isFunctional, setIsFunctional] = useState(null);
  const [condition, setCondition] = useState(5);
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const infrastructureTypes = {
    hydrant: { name: 'Fire Hydrant', icon: '=�', color: '#ff0000', questions: ['Is this hydrant functional?', 'Is the hydrant\'s paint in good condition?'] },
    'traffic-light': { name: 'Traffic Light', icon: '=�', color: '#ffa500', questions: ['Is this traffic light working?', 'Are all lights functioning properly?'] },
    'stop-sign': { name: 'Stop Sign', icon: '=�', color: '#ff0000', questions: ['Is this stop sign visible?', 'Is the sign in good condition?'] },
    pothole: { name: 'Pothole', icon: '=s', color: '#8b4513', questions: ['Is this pothole dangerous?', 'How severe is the damage?'] },
    streetlight: { name: 'Street Light', icon: '=�', color: '#ffff00', questions: ['Is this street light working?', 'Is the light bright enough?'] },
    crosswalk: { name: 'Crosswalk', icon: '=�', color: '#ffffff', questions: ['Is this crosswalk visible?', 'Are the markings clear?'] }
  };

  const currentType = infrastructureTypes[infrastructureType] || infrastructureTypes.hydrant;

  // Get user location on mount
  useEffect(() => {
    // Try to get location from navigation state first
    if (location.state?.userLocation) {
      setUserLocation(location.state.userLocation);
      console.log('Using location from navigation state:', location.state.userLocation);
    } else {
      // Otherwise, request location from browser
      getCurrentLocation();
    }
  }, [location.state]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(loc);
        setLocationError(null);
        console.log('Got current location:', loc);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async () => {
    if (!userLocation) {
      alert('Please wait for your location to be determined before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      // Convert photo to base64 if exists
      let imageBase64 = null;
      if (photo) {
        imageBase64 = await fileToBase64(photo);
      }

      const reportData = {
        type: infrastructureType,
        isFunctional,
        condition,
        description,
        lat: userLocation.lat,
        lng: userLocation.lng,
        accuracy: userLocation.accuracy,
        photo: imageBase64
      };

      console.log('Infrastructure verification with location:', reportData);

      // Add points to user account
      const pointsToAdd = 25; // Standard points for infrastructure report
      const result = await addPoints(
        user?.id,
        pointsToAdd,
        userLocation.lat,
        userLocation.lng
      );

      if (result.success) {
        console.log('Points added successfully:', result.data);
        console.log(`Earned ${result.data.points_added} points!`);
        console.log(`Total points: ${result.data.new_points}`);

        if (result.data.new_badges && result.data.new_badges.length > 0) {
          console.log('New badges earned:', result.data.new_badges);
        }

        // Navigate to success page with points data
        navigate(`/report-submitted?type=${infrastructureType}&points=${result.data.points_added}&newBadges=${result.data.new_badges.length}`);
      } else {
        console.error('Failed to add points:', result.error);
        // Still navigate to success page even if points API fails
        navigate(`/report-submitted?type=${infrastructureType}`);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(file);
  };

  // Helper: Convert File to base64
  const fileToBase64 = (file) => {
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
  };

  return (
    <div className="verify-infrastructure-page">
      <div className="infrastructure-image">
        <div className="infrastructure-display" style={{ backgroundColor: currentType.color }}>
          <span className="infrastructure-icon">{currentType.icon}</span>
        </div>
        <h2 className="infrastructure-title">{currentType.name}</h2>
      </div>

      {/* Location Status */}
      {locationError && (
        <div className="location-error" style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', marginBottom: '10px', borderRadius: '5px' }}>
          {locationError}
          <button onClick={getCurrentLocation} style={{ marginLeft: '10px' }}>Retry</button>
        </div>
      )}
      {userLocation && (
        <div className="location-info" style={{ padding: '10px', backgroundColor: '#efe', color: '#060', marginBottom: '10px', borderRadius: '5px', fontSize: '12px' }}>
          =� Location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)} (�{Math.round(userLocation.accuracy)}m)
        </div>
      )}

      <div className="form-container">
        {/* Question 1 */}
        <div className="question-group">
          <h3 className="question">{currentType.questions[0]}</h3>
          <div className="answer-buttons">
            <button
              className={`answer-button ${isFunctional === true ? 'selected' : ''}`}
              onClick={() => setIsFunctional(true)}
            >
              Yes
            </button>
            <button
              className={`answer-button ${isFunctional === false ? 'selected' : ''}`}
              onClick={() => setIsFunctional(false)}
            >
              No
            </button>
          </div>
        </div>

        {/* Question 2 */}
        <div className="question-group">
          <h3 className="question">{currentType.questions[1]}</h3>
          <div className="rating-container">
            <div className="rating-bar">
              <div
                className="rating-fill"
                style={{ width: `${(condition / 10) * 100}%` }}
              ></div>
            </div>
            <div className="rating-labels">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={condition}
              onChange={(e) => setCondition(parseInt(e.target.value))}
              className="rating-slider"
            />
          </div>
        </div>

        {/* Description field */}
        <div className="description-section">
          <h3 className="question">Add a description (optional)</h3>
          <textarea
            className="description-input"
            placeholder="Describe what you observed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Photo upload */}
        <div className="photo-upload">
          <label htmlFor="photo-upload" className="photo-button">
            <span className="camera-icon">=�</span>
            Photo
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="photo-input"
          />
          {photo && (
            <div className="photo-preview">
              <span className="photo-name">{photo.name}</span>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="cta-button primary"
          disabled={isFunctional === null || !userLocation}
        >
          {userLocation ? 'Report' : 'Waiting for location...'}
        </button>
      </div>
    </div>
  );
};

export default VerifyUserInfrastructure;
