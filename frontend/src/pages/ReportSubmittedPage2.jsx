import { Link, useSearchParams } from 'react-router-dom';
import './ReportSubmittedPage.css';

const ReportSubmittedPage2 = () => {
  const [searchParams] = useSearchParams();
  const infrastructureType = searchParams.get('type') || 'infrastructure';

  const infrastructureTypes = {
    hydrant: { icon: '🚰', name: 'hydrant', badge: 'Hydrant Hunter' },
    'traffic-light': { icon: '🚦', name: 'traffic light', badge: 'Traffic Controller' },
    'stop-sign': { icon: '🛑', name: 'stop sign', badge: 'Safety Monitor' },
    pothole: { icon: '🕳️', name: 'pothole', badge: 'Road Warrior' },
    streetlight: { icon: '💡', name: 'street light', badge: 'Light Keeper' },
    crosswalk: { icon: '🚶', name: 'crosswalk', badge: 'Pedestrian Protector' }
  };

  const currentType = infrastructureTypes[infrastructureType] || infrastructureTypes.hydrant;

  return (
    <div className="report-submitted-page">
      <div className="success-container">
        <div className="success-icon">
          <div className="coin">
            <span className="infrastructure-icon">{currentType.icon}</span>
            <div className="sparkles">
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
            </div>
          </div>
        </div>

        <h1 className="success-message">Report submitted!</h1>

        <div className="points-earned">
          <span className="points-number">1</span>
          <span className="points-text">point earned</span>
        </div>

        {/* <div className="next-goal">
          <span className="goal-text">1 more {currentType.name} = {currentType.badge} badge</span>
        </div> */}

        <Link to="/leaderboard" className="cta-button secondary">
          View leaderboard
        </Link>
        <Link to="/map" className="cta-button secondary">
          Back to Map
        </Link>
      </div>
    </div>
  );
};

export default ReportSubmittedPage2;
