import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifyHydrantPage.css';

const VerifyHydrantPage = () => {
  const [isFunctional, setIsFunctional] = useState(null);
  const [paintCondition, setPaintCondition] = useState(5);
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    // Handle form submission
    console.log('Hydrant verification:', {
      isFunctional,
      paintCondition,
      photo
    });
    navigate('/report-submitted');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  return (
    <div className="verify-hydrant-page">
      <div className="hydrant-image">
        <div className="hydrant-display">
          <span className="hydrant-icon">🚰</span>
        </div>
      </div>

      <div className="form-container">
        <div className="question-group">
          <h3 className="question">Is this hydrant functional?</h3>
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
          <h3 className="question">Is the hydrant's paint in good condition?</h3>
          <div className="rating-container">
            <div className="rating-bar">
              <div 
                className="rating-fill"
                style={{ width: `${(paintCondition / 10) * 100}%` }}
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
              value={paintCondition}
              onChange={(e) => setPaintCondition(parseInt(e.target.value))}
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

export default VerifyHydrantPage;
