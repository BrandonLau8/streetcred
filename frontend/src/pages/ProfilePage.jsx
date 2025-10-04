import { Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const user = {
    name: 'Alex',
    points: 1820,
    streak: 7,
    totalReports: 12,
    coverageArea: 'Downtown'
  };

  const badges = [
    { id: 1, icon: '🚰', name: 'Hydrant Hunter' },
    { id: 2, icon: '🌱', name: 'Eco Warrior' },
    { id: 3, icon: '⭐', name: 'Star Reporter' },
    { id: 4, icon: '🏆', name: 'Champion' },
    { id: 5, icon: '🔲', name: 'Grid Master' }
  ];

  return (
    <div className="profile-page">
      <header className="header">
        <Link to="/map" className="back-button">
          <span className="back-arrow">←</span>
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

          <Link to="/leaderboard" className="cta-button secondary">
            View leaderboard
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
