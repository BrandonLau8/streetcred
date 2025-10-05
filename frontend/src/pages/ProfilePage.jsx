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
  const [loading, setLoading] = useState(true); // 👈 nuevo estado

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
        setUsername(data.username);
      }
      setLoading(false);
    };

    fetchUsername();
  }, [user]);

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
              <div className="avatar">
                <div className="avatar-icon">👤</div>
                <div className="avatar-cap">🧢</div>
              </div>

              <div className="user-name">
                {username || user?.email || "Anonymous"}
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
