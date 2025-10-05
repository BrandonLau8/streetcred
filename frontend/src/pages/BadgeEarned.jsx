import { Link, useLocation } from 'react-router-dom';
import './ReportSubmittedPage.css';

const BadgeEarned = () => {
  const location = useLocation();
  const { badge, milestone, points, totalPoints } = location.state || {};

  // Fallback if no badge data
  if (!badge) {
    return (
      <div className="report-submitted-page">
        <div className="success-container">
          <h1 className="success-message">No badge data available</h1>
          <Link to="/map" className="cta-button secondary">
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="report-submitted-page">
      <div className="success-container">
        {/* Badge Image */}
        <div className="success-icon">
          <div className="coin">
            {badge.image_url ? (
              <img
                src={badge.image_url}
                alt={`${badge.animal} badge`}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              <span className="infrastructure-icon">🏆</span>
            )}
            <div className="sparkles">
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
              <span className="sparkle">✨</span>
            </div>
          </div>
        </div>

        <h1 className="success-message">New Badge Earned!</h1>

        {/* Badge Details */}
        <div className="badge-details" style={{ margin: '20px 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', margin: '10px 0', color: '#333' }}>
             {badge.location_name} {badge.animal}!
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Milestone: {milestone} points
          </p>
        </div>

        <div className="points-earned">
          <span className="points-number">{points}</span>
          <span className="points-text">point{points !== 1 ? 's' : ''} earned</span>
        </div>

        <div className="total-points" style={{ margin: '10px 0', fontSize: '14px', color: '#888' }}>
          Total Points: {totalPoints}
        </div>

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

export default BadgeEarned;
