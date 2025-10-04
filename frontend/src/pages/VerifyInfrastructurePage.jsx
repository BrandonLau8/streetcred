import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyInfrastructurePage.css';

const VerifyInfrastructurePage = () => {
  const [searchParams] = useSearchParams();
  const infrastructureType = searchParams.get('type') || 'hydrant';
  const navigate = useNavigate();
  
  const [isFunctional, setIsFunctional] = useState(null);
  const [condition, setCondition] = useState(5);
  const [photo, setPhoto] = useState(null);

  const infrastructureTypes = {
    hydrant: { name: 'Fire Hydrant', icon: '🚰', color: '#ff0000', questions: ['Is this hydrant functional?', 'Is the hydrant\'s paint in good condition?'] },
    'traffic-light': { name: 'Traffic Light', icon: '🚦', color: '#ffa500', questions: ['Is this traffic light working?', 'Are all lights functioning properly?'] },
    'stop-sign': { name: 'Stop Sign', icon: '🛑', color: '#ff0000', questions: ['Is this stop sign visible?', 'Is the sign in good condition?'] },
    pothole: { name: 'Pothole', icon: '🕳️', color: '#8b4513', questions: ['Is this pothole dangerous?', 'How severe is the damage?'] },
    streetlight: { name: 'Street Light', icon: '💡', color: '#ffff00', questions: ['Is this street light working?', 'Is the light bright enough?'] },
    crosswalk: { name: 'Crosswalk', icon: '🚶', color: '#ffffff', questions: ['Is this crosswalk visible?', 'Are the markings clear?'] }
  };

  const currentType = infrastructureTypes[infrastructureType] || infrastructureTypes.hydrant;

  const handleSubmit = () => {
    // Handle form submission
    console.log('Infrastructure verification:', {
      type: infrastructureType,
      isFunctional,
      condition,
      photo
    });
    navigate(`/report-submitted?type=${infrastructureType}`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  return (
    <div className="verify-infrastructure-page">
      <div className="infrastructure-image">
        <div className="infrastructure-display" style={{ backgroundColor: currentType.color }}>
          <span className="infrastructure-icon">{currentType.icon}</span>
        </div>
        <h2 className="infrastructure-title">{currentType.name}</h2>
      </div>

      <div className="form-container">
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

        <div className="photo-upload">
          <label htmlFor="photo-upload" className="photo-button">
            <span className="camera-icon">📷</span>
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

        <button 
          onClick={handleSubmit}
          className="cta-button primary"
          disabled={isFunctional === null}
        >
          Report
        </button>
      </div>
    </div>
  );
};

export default VerifyInfrastructurePage;
