import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/navbar.jsx';
import { useAuth } from '../contexts/AuthContext';
import { client } from '../Supabase/client';
import { identifyNeighborhood } from '../services/locationService';
import { addPoints } from '../services/badgesAPI';
import './VerifyInfrastructurePage.css';

const VerifyInfrastructurePage = () => {
  const [searchParams] = useSearchParams();
  const infrastructureType = searchParams.get('type') || 'hydrant';
  const hydrantId = searchParams.get('hydrantId');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [generalCondition, setGeneralCondition] = useState(null);
  const [isFunctional, setIsFunctional] = useState(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [isDetectingNeighborhood, setIsDetectingNeighborhood] = useState(false);

  const infrastructureTypes = {
    hydrant: { name: 'Fire Hydrant', icon: '🚰', color: '#ff0000' },
    pothole: { name: 'Pothole', icon: '🕳️', color: '#8b4513' },
    streetlight: { name: 'Street Light', icon: '💡', color: '#ffff00' }
  };

  const currentType = infrastructureTypes[infrastructureType] || infrastructureTypes.hydrant;

  const conditionOptions = [
    { value: 'great', label: 'Great', color: '#22c55e', icon: '✅' },
    { value: 'okay', label: 'Okay', color: '#f59e0b', icon: '⚠️' },
    { value: 'bad', label: 'Bad', color: '#ef4444', icon: '❌' }
  ];

  // Auto-detect neighborhood when component loads
  useEffect(() => {
    const detectNeighborhood = async () => {
      if (lat && lng) {
        console.log(`🔍 Detecting neighborhood for coordinates: [${lat}, ${lng}]`);
        setIsDetectingNeighborhood(true);
        try {
          const result = await identifyNeighborhood(parseFloat(lat), parseFloat(lng));
          if (result.success) {
            setNeighborhood(result.neighborhood);
            console.log(`✅ Detected neighborhood: ${result.neighborhood} for coordinates [${lat}, ${lng}]`);
          } else {
            console.error('❌ Failed to detect neighborhood:', result.error);
          }
        } catch (error) {
          console.error('❌ Error detecting neighborhood:', error);
        } finally {
          setIsDetectingNeighborhood(false);
        }
      } else {
        console.log('⚠️ No coordinates provided for neighborhood detection');
      }
    };

    detectNeighborhood();
  }, [lat, lng]);

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('You must be logged in to submit a report');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare the report data
      const reportData = {
        user_id: user.id,
        lat: parseFloat(lat),
        lon: parseFloat(lng),
        description: description || null,
        image_url: null, // Will be updated if photo is uploaded
        itemid: hydrantId || null,
        type: infrastructureType,
        condition: generalCondition,
        functional: isFunctional ? 'Yes' : 'No',
        neighborhood: neighborhood // Auto-detected neighborhood
      };

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await client.storage
          .from('reports')
          .upload(filePath, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo if upload fails
        } else {
          // Get public URL
          const { data: { publicUrl } } = client.storage
            .from('reports')
            .getPublicUrl(filePath);
          reportData.image_url = publicUrl;
        }
      }

      // Insert report into database
      const { data, error } = await client
        .from('reports')
        .insert([reportData])
        .select();

      if (error) {
        console.error('Database error:', error);
        setSubmitError('Failed to submit report. Please try again.');
        return;
      }

      console.log('Report submitted successfully:', data);

      // Add points to user account
      const pointsToAdd = 1; // Standard points for infrastructure report
      const pointsResult = await addPoints(
        user.id,
        pointsToAdd,
        parseFloat(lat),
        parseFloat(lng)
      );

      if (pointsResult.success) {
        console.log('Points added successfully:', pointsResult.data);
        console.log(`Earned ${pointsResult.data.points_added} points!`);
        console.log(`Total points: ${pointsResult.data.new_points}`);

        // Check if user reached a milestone (5, 10, 15, 20, etc.)
        const totalPoints = pointsResult.data.new_points;
        const isMilestone = totalPoints % 5 === 0 && totalPoints >= 5;

        if (isMilestone) {
          console.log('Milestone reached! Navigating to badge earned page');

          // Navigate to badge earned page
          navigate('/badge-earned', {
            state: {
              badge: pointsResult.data.new_badges?.[0]?.badge || null,
              milestone: totalPoints,
              points: pointsResult.data.points_added,
              totalPoints: totalPoints
            }
          });
        } else {
          // Navigate to regular success page (no milestone)
          navigate(`/report-submitted2?type=${infrastructureType}&reportId=${data[0].id}&points=${pointsResult.data.points_added}`);
        }
      } else {
        console.error('Failed to add points:', pointsResult.error);
        // Still navigate to success page even if points API fails
        navigate(`/report-submitted2?type=${infrastructureType}&reportId=${data[0].id}`);
      }

    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(file);
  };

  const isFormValid = generalCondition !== null && isFunctional !== null;

  return (
    <>
      <Navbar />
      <div className="verify-infrastructure-page">
        {/* Header Section */}
        <div className="verify-header">
          <div className="infrastructure-display" style={{ backgroundColor: currentType.color }}>
            <span className="infrastructure-icon">{currentType.icon}</span>
          </div>
          <div className="header-info">
            <h1 className="infrastructure-title">{currentType.name}</h1>
            {hydrantId && (
              <p className="infrastructure-id">ID: {hydrantId}</p>
            )}
            {lat && lng && (
              <p className="infrastructure-location">
                📍 {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
              </p>
            )}
            {isDetectingNeighborhood ? (
              <p className="neighborhood-status">
                🔍 Detecting neighborhood...
              </p>
            ) : neighborhood ? (
              <p className="neighborhood-status">
                🏘️ {neighborhood}
              </p>
            ) : null}
            
            
          </div>
        </div>

        {/* Form Section */}
        <div className="verify-form">
          {/* Step 1: General Condition */}
          <div className="form-step">
            <h2 className="step-title">Step 1: General Condition</h2>
            <p className="step-description">How would you rate the overall condition?</p>
            <div className="condition-options">
              {conditionOptions.map((option) => (
                <button
                  key={option.value}
                  className={`condition-button ${generalCondition === option.value ? 'selected' : ''}`}
                  onClick={() => setGeneralCondition(option.value)}
                  style={{ 
                    borderColor: generalCondition === option.value ? option.color : '#e5e7eb',
                    backgroundColor: generalCondition === option.value ? `${option.color}15` : 'white'
                  }}
                >
                  <span className="condition-icon">{option.icon}</span>
                  <span className="condition-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Functionality */}
          <div className="form-step">
            <h2 className="step-title">Step 2: Functionality</h2>
            <p className="step-description">Does it look functional?</p>
            <div className="functionality-options">
              <button
                className={`functionality-button ${isFunctional === true ? 'selected yes' : ''}`}
                onClick={() => setIsFunctional(true)}
              >
                <span className="functionality-icon">✅</span>
                <span className="functionality-label">Yes</span>
              </button>
              <button
                className={`functionality-button ${isFunctional === false ? 'selected no' : ''}`}
                onClick={() => setIsFunctional(false)}
              >
                <span className="functionality-icon">❌</span>
                <span className="functionality-label">No</span>
              </button>
            </div>
          </div>

          {/* Step 3: Location Details */}
          <div className="form-step">
            <h2 className="step-title">Step 3: Location Details</h2>
            <p className="step-description">Location information for this report</p>
            <div className="location-details">
              <div className="location-item">
                <span className="location-label">📍 Coordinates:</span>
                <span className="location-value">
                  {lat && lng ? `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}` : 'Not available'}
                </span>
              </div>
              <div className="location-item">
                <span className="location-label">🏘️ Neighborhood:</span>
                <span className="location-value">
                  {isDetectingNeighborhood ? (
                    <span className="detecting">🔍 Detecting...</span>
                  ) : neighborhood ? (
                    <span className="detected">{neighborhood}</span>
                  ) : (
                    <span className="not-detected">Not detected</span>
                  )}
                </span>
              </div>
              {hydrantId && (
                <div className="location-item">
                  <span className="location-label">🚰 Hydrant ID:</span>
                  <span className="location-value">{hydrantId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Description */}
          <div className="form-step">
            <h2 className="step-title">Step 4: Description</h2>
            <p className="step-description">Tell us more about what you observed</p>
            <textarea
              className="description-input"
              placeholder="Describe the condition, any issues you noticed, or additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Step 5: Photo (Optional) */}
          <div className="form-step">
            <h2 className="step-title">Step 5: Photo (Optional)</h2>
            <p className="step-description">Add a photo to support your report</p>
            <div className="photo-upload">
              <label htmlFor="photo-upload" className="photo-button">
                <span className="camera-icon">📷</span>
                <span className="photo-text">
                  {photo ? 'Change Photo' : 'Add Photo'}
                </span>
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
                  <span className="photo-name">📎 {photo.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button 
              onClick={handleSubmit}
              className={`submit-button ${isFormValid && !isSubmitting ? 'enabled' : 'disabled'}`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
            {!isFormValid && !isSubmitting && (
              <p className="validation-message">
                Please complete all required steps to submit your report
              </p>
            )}
            {submitError && (
              <p className="error-message">
                {submitError}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyInfrastructurePage;
