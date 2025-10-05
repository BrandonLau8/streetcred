import { useState, useEffect } from 'react';
import './BadgeProgress.css';

const BadgeProgress = ({ userId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('BadgeProgress: userId =', userId);

    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      console.log('Fetching progress for user:', userId);
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/badges/badge-progress/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch progress: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Progress loaded:', data);
        setProgress(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching badge progress:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  if (!userId) return null;
  if (loading) return <div className="badge-progress loading">Loading progress...</div>;
  if (error) return <div className="badge-progress error">Error: {error}</div>;
  if (!progress) return null;

  return (
    <div className="badge-progress">
      <div className="progress-header">
        <h3>Badge Progress</h3>
        <div className="stats">
          <span className="stat">
            <strong>{progress.current_points}</strong> points
          </span>
          <span className="stat">
            <strong>{progress.total_badges}</strong> badges
          </span>
          <div className="points-remaining">
          {progress.points_to_next_badge} points until your next badge!
        </div>
        </div>
      </div>

      {/* <div className="progress-bar-container">
        <div className="progress-info">
          <span className="current">{progress.current_points} points</span>
          <span className="next-milestone">Next badge at {progress.next_milestone}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress.progress_percent}%` }}
          >
            <span className="progress-text">{Math.round(progress.progress_percent)}%</span>
          </div>
        </div>
        <div className="points-remaining">
          {progress.points_to_next_badge} points until your next badge!
        </div>
      </div> */}
    </div>
  );
};

export default BadgeProgress;
