import { Link } from 'react-router-dom';
import './ReportSubmittedPage.css';

const ReportSubmittedPage = () => {
  return (
    <div className="report-submitted-page">
      <div className="success-container">
        <div className="success-icon">
          <div className="coin">
            <span className="hydrant-icon">🚰</span>
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
          <span className="points-number">25</span>
          <span className="points-text">points earned</span>
        </div>

        <div className="next-goal">
          <span className="goal-text">1 more hydrant = Early Bird badge</span>
        </div>

        <Link to="/leaderboard" className="cta-button secondary">
          View leaderboard
        </Link>
      </div>
    </div>
  );
};

export default ReportSubmittedPage;
