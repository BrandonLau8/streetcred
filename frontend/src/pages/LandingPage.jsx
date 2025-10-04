import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">📍</span>
          <span className="logo-text">StreetCred</span>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">Earn points. Level up. Make your city better.</h1>
          
          <div className="hero-illustration">
            <div className="person-illustration">
              <div className="person">👤</div>
              <div className="phone">📱</div>
            </div>
            <div className="map-illustration">
              <div className="map-pin">📍</div>
              <div className="hydrant">🚰</div>
            </div>
          </div>

          <Link to="/login" className="cta-button primary">
            Earning StreetCred →
          </Link>

          <div className="info-link">
            <Link to="/about">See how it works</Link>
            <span className="arrow">→</span>
          </div>
        </div>

        <div className="features-section">
          <div className="feature">
            <div className="feature-icon verify">✓</div>
            <span className="feature-text">Verify and report</span>
          </div>
          <div className="feature">
            <div className="feature-icon report">↑</div>
            <span className="feature-text">Report report</span>
          </div>
          <div className="feature">
            <div className="feature-icon rewards">★</div>
            <span className="feature-text">Earn rewards</span>
          </div>
        </div>

        <div className="incentive-message">
          <span className="badge-icon">🏆</span>
          <span>Earn your first badge after 1 report!</span>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
