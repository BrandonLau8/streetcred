import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';
import Navbar from "../components/navbar.jsx"

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const badges = [
    { id: 1, icon: '🚰', name: 'Hydrant Hunter' },
    { id: 2, icon: '🌱', name: 'Eco Warrior' },
    { id: 3, icon: '⭐', name: 'Star Reporter' },
    { id: 4, icon: '🏆', name: 'Champion' },
    { id: 5, icon: '🔲', name: 'Grid Master' }
  ];

  return (
    <>
    <Navbar/>
    <div className="profile-page">
      <header className="header">
        <Link to="/map" className="back-button">
          <span className="back-arrow"> Map </span>
        </Link>
        <div className="logo">
          <span className="logo-icon">📍</span>
          <span className="logo-text">StreetCred</span>
        </div>
      </header>

      <main className="main-content">
        <div className="profile-container">
          <div className="user-info">
            <div className="avatar">
              <div className="avatar-icon">👤</div>
              <div className="avatar-cap">🧢</div>
            </div>
            <h1 className="user-name">{user.name}</h1>
            <div className="user-points">{user.points.toLocaleString()} points</div>
          </div>

          <div className="badges-section">
            <h2 className="section-title">Badges</h2>
            <div className="badges-grid">
              {badges.map((badge) => (
                <div key={badge.id} className="badge">
                  <span className="badge-icon">{badge.icon}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <div className="stat">
              <span className="stat-icon">👍</span>
              <span className="stat-text">{user.streak}-day streak</span>
            </div>
            <div className="stat">
              <span className="stat-icon">📋</span>
              <span className="stat-text">Total reports submitted</span>
            </div>
            <div className="stat">
              <span className="stat-icon">🗺️</span>
              <span className="stat-text">Coverage area</span>
            </div>
          </div>

          <div className="action-buttons">
            <Link to="/leaderboard" className="cta-button secondary">
              View leaderboard
            </Link>
            <button onClick={handleLogout} className="cta-button logout">
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default ProfilePage;
