import { useEffect, useState } from 'react';
import { client } from '../Supabase/client.js';
import Navbar from '../components/navbar.jsx';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('username, points')
          .order('points', { ascending: false });

        if (error) throw error;
        setUsers(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <>
      <Navbar />
      <div className="leaderboard-page">
        <header className="leaderboard-header">
          <h1>Leaderboard</h1>
        </header>

        <main className="leaderboard-main">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ul className="leaderboard-list">
              {users.map((user, index) => (
                <li key={user.username} className="leaderboard-item">
                  <span className="rank">{index + 1}</span>
                  <span className="username">{user.username}</span>
                  <span className="points">{user.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </>
  );
};

export default Leaderboard;
