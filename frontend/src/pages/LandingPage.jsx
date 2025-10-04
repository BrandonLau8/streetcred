import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="header">
        <div className="logo">
          <h1 className="logo-text">StreetCred</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          {/* <h2 className="hero-title">Earn points. Level up. Make your city better.</h2>
           */}

          <Link to="/login" className="cta-button primary">
            Earning StreetCred →
          </Link>

          <div className="info-link">
            <Link to="/how-it-works">See how it works</Link>
            <span className="arrow">→</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
