import { useNavigate } from 'react-router-dom';
import './MapPage.css';

const MapPage = () => {
  const navigate = useNavigate();

  const handleVerifyHydrant = () => {
    navigate('/verify-hydrant');
  };

  return (
    <div className="map-page">
      <div className="quest-prompt">
        <span className="quest-icon">⭐</span>
        <span className="quest-text">Quest near you: Verify this hydrant!</span>
      </div>

      <div className="map-container">
        <div className="map">
          <div className="map-marker hydrant-marker">
            <span className="marker-icon">🚰</span>
          </div>
          <div className="map-marker other-marker">
            <span className="marker-dot"></span>
          </div>
          <div className="map-marker other-marker">
            <span className="marker-dot"></span>
          </div>
          <div className="map-marker other-marker">
            <span className="marker-dot"></span>
          </div>
        </div>
      </div>

      <div className="action-section">
        <button onClick={handleVerifyHydrant} className="cta-button primary">
          <span className="button-icon">✅</span>
          Verify hydrant
        </button>
      </div>
    </div>
  );
};

export default MapPage;
