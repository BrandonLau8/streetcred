import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { client } from '../Supabase/client.js';
import Navbar from "../components/navbar.jsx";
import UserBadges from "../components/UserBadges.jsx";
import BadgeProgress from "../components/BadgeProgress.jsx";
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempDisplayName, setTempDisplayName] = useState("");

  useEffect(() => {
    if (!user) {
      console.log("⚠️ No user yet");
      return;
    }

    const fetchUsername = async () => {
      console.log("🧾 Fetching profile for user:", user.id);
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error);
      } else {
        console.log("✅ Profile data:", data);
        console.log("Available columns:", Object.keys(data));
        setUsername(data.username);
        setDisplayName(data.full_name || data.display_name || data.name || "");
      }
      setLoading(false);
    };

    fetchUsername();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchBadges = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/badges/user-badges/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setBadges(data.badges || []);
          // Set first badge as default avatar if available
          if (data.badges && data.badges.length > 0) {
            setSelectedBadge(data.badges[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching badges:', err);
      }
    };

    fetchBadges();
  }, [user]);

  const handleEditName = () => {
    setTempDisplayName(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!tempDisplayName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    try {
      // Try updating full_name column (common in Supabase profiles)
      const { data, error } = await client
        .from('profiles')
        .update({ full_name: tempDisplayName })
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error("❌ Error updating display name:", error);
        console.error("Error details:", error);

        // If full_name doesn't exist, tell user to add it
        alert(`Failed to update name: ${error.message}\n\nPlease add a 'full_name' column to your profiles table, or check the console to see available columns.`);
      } else {
        console.log("✅ Display name updated successfully:", data);
        setDisplayName(tempDisplayName);
        setIsEditingName(false);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert(`Failed to update name: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setTempDisplayName("");
    setIsEditingName(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="main-content">
          <h2>Loading user...</h2>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <main className="main-content">
          <h2>Loading profile...</h2>
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <header className="header"></header>
        <main className="main-content">
          <div className="profile-container">
            <div className="user-info">
              <button
                className="avatar-button"
                onClick={() => setShowBadgeSelector(!showBadgeSelector)}
                title="Click to change avatar"
              >
                {selectedBadge ? (
                  <img
                    src={selectedBadge.badges.image_url}
                    alt={selectedBadge.badges.animal}
                    className="avatar-badge-image"
                  />
                ) : (
                  <div className="avatar-default">
                    <div className="avatar-icon">👤</div>
                  </div>
                )}
                <div className="avatar-edit-hint">🔄</div>
              </button>

              {showBadgeSelector && badges.length > 0 && (
                <>
                  <div
                    className="modal-backdrop"
                    onClick={() => setShowBadgeSelector(false)}
                  />
                  <div className="badge-selector-modal">
                    <div className="badge-selector-header">
                      <h3>Select Your Avatar Badge</h3>
                      <button
                        className="close-selector"
                        onClick={() => setShowBadgeSelector(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="badge-selector-grid">
                      {badges.map((badge) => (
                        <button
                          key={badge.badge_id}
                          className={`badge-selector-item ${selectedBadge?.badge_id === badge.badge_id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedBadge(badge);
                            setShowBadgeSelector(false);
                          }}
                        >
                          <img
                            src={badge.badges.image_url}
                            alt={badge.badges.animal}
                            className="badge-selector-image"
                          />
                          <span className="badge-selector-name">{badge.badges.animal}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="user-name-container">
                {isEditingName ? (
                  <div className="name-edit-section">
                    <input
                      type="text"
                      className="name-input"
                      value={tempDisplayName}
                      onChange={(e) => setTempDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <div className="name-edit-buttons">
                      <button className="save-name-btn" onClick={handleSaveName}>
                        Save
                      </button>
                      <button className="cancel-name-btn" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="name-display-section">
                      <div className="display-name">
                        {displayName || "Set your name"}
                      </div>
                      <button className="edit-name-btn" onClick={handleEditName} title="Edit name">
                        ✎
                      </button>
                    </div>
                    <div className="username-subheader">
                      {username || user?.email || "anonymous"}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/leaderboard" className="cta-button secondary">
                View leaderboard
              </Link>
            </div>

            {/* Badge Progress */}
            <BadgeProgress userId={user?.id} />

            {/* User Badges */}
            <UserBadges userId={user?.id} />

          
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfilePage;
