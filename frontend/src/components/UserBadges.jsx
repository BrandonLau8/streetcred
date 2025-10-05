import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';
import './UserBadges.css';

const UserBadges = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('UserBadges: userId =', userId);

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBadges = async () => {
      console.log('Fetching badges for user:', userId);
      let response;
      try {
        setLoading(true);
        response = await fetch(`${API_BASE_URL}/api/badges/user-badges/${userId}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to fetch badges: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Badges loaded:', data);
        setBadges(data.badges || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching badges:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId]);

  if (!userId) {
    return (
      <div className="user-badges">
        <h3>My Badges</h3>
        <p className="no-user">Please log in to see your badges</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-badges">
        <h3>My Badges</h3>
        <div className="loading">Loading badges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-badges">
        <h3>My Badges</h3>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="user-badges">
      <h3>My Badges ({badges.length})</h3>

      {badges.length === 0 ? (
        <div className="no-badges">
          <p>No badges yet! Start earning points to unlock badges.</p>
          <p className="hint">You'll earn your first badge at 5 points!</p>
        </div>
      ) : (
        <div className="badges-grid">
          {badges.map((badge) => (
            <div key={badge.badge_id} className="badge-card">
              {badge.badges.image_url && (
                <img
                  src={badge.badges.image_url}
                  alt={`${badge.badges.animal} badge`}
                  className="badge-image"
                />
              )}
              <div className="badge-info">
                <h4>{badge.badges.animal}</h4>
                <p className="location">{badge.badges.location_name}</p>
                <div className="badge-meta">
                  <span className="milestone">🏆 {badge.milestone} points</span>
                  <span className="earned-date">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBadges;
