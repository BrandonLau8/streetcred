import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MapPage.css';

const MapPage = () => {
  const navigate = useNavigate();
  const [selectedInfrastructure, setSelectedInfrastructure] = useState(null);

  const infrastructureTypes = [
    { id: 'hydrant', name: 'Fire Hydrant', icon: '🚰', color: '#ff0000' },
    { id: 'traffic-light', name: 'Traffic Light', icon: '🚦', color: '#ffa500' },
    { id: 'stop-sign', name: 'Stop Sign', icon: '🛑', color: '#ff0000' },
    { id: 'pothole', name: 'Pothole', icon: '🕳️', color: '#8b4513' },
    { id: 'streetlight', name: 'Street Light', icon: '💡', color: '#ffff00' },
    { id: 'crosswalk', name: 'Crosswalk', icon: '🚶', color: '#ffffff' }
  ];

  const handleVerifyInfrastructure = (type) => {
    setSelectedInfrastructure(type);
    navigate(`/verify-infrastructure?type=${type.id}`);
  };

  return (
    <div className="map-page">
      <div className="quest-prompt">
        <span className="quest-icon">⭐</span>
        <span className="quest-text">Quest near you: Verify infrastructure!</span>
      </div>

      <div className="map-container">
        <div className="map">
          {infrastructureTypes.map((type, index) => (
            <div 
              key={type.id}
              className="map-marker infrastructure-marker"
              style={{
                top: `${20 + (index * 15)}%`,
                left: `${20 + (index * 12)}%`,
                backgroundColor: type.color
              }}
              onClick={() => handleVerifyInfrastructure(type)}
            >
              <span className="marker-icon">{type.icon}</span>
            </div>
          ))}
        </div>
      </div>

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
    </div>
  );
};

export default MapPage;
