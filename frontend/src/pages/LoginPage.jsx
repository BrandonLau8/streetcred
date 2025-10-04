import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login - in real app, this would call your backend
    const userData = {
      id: 1,
      name: 'Alex',
      email: email,
      points: 1820,
      streak: 7,
      totalReports: 12,
      coverageArea: 'Downtown'
    };
    
    login(userData);
    navigate('/profile');
  };

  const handleGoogleLogin = () => {
    // Simulate Google login
    const userData = {
      id: 1,
      name: 'Alex',
      email: 'alex@gmail.com',
      points: 1820,
      streak: 7,
      totalReports: 12,
      coverageArea: 'Downtown'
    };
    
    login(userData);
    navigate('/profile');
  };

  const handleGitHubLogin = () => {
    // Simulate GitHub login
    const userData = {
      id: 1,
      name: 'Alex',
      email: 'alex@github.com',
      points: 1820,
      streak: 7,
      totalReports: 12,
      coverageArea: 'Downtown'
    };
    
    login(userData);
    navigate('/profile');
  };

  return (
    <div className="login-page">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">📍</span>
          <span className="logo-text">StreetCred</span>
        </div>
      </header>

      <main className="main-content">
        <div className="login-container">
          <h1 className="login-title">Log in to StreetCred</h1>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="cta-button primary">
              Log in
            </button>
          </form>

          <div className="separator">
            <span>or</span>
          </div>

          <div className="social-login">
            <button onClick={handleGoogleLogin} className="social-button google">
              <span className="social-icon">G</span>
              Continue with Google
            </button>
            
            <button onClick={handleGitHubLogin} className="social-button github">
              <span className="social-icon">🐙</span>
              Continue with GitHub
            </button>
          </div>

          <div className="incentive-message">
            <span className="badge-icon">🏆</span>
            <span>Unlock your first badge after 1 report!</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
