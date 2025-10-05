import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import './ProfilePage.css';
import Navbar from "../components/navbar.jsx"

const ProfilePage = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        const { data, error } = await client
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        if (data && data.username) setUsername(data.username);
      }
    };
    fetchUsername();
  }, [user]);

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
        <header className="header"></header>
        <main className="main-content">
          <div className="profile-container">
            <div className="user-info">
              <div className="avatar">
                <div className="avatar-icon">👤</div>
                <div className="avatar-cap">🧢</div>
              </div>

              <div className="user-name">
                 {username ? username : user?.email ? user.email : "User"}
              </div>

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
            <div className="action-buttons">
              <Link to="/leaderboard" className="cta-button secondary">
                View leaderboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;