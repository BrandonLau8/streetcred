import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import VerifyInfrastructurePage from './pages/VerifyInfrastructurePage';
import VerifyUserInfrastructure from './pages/VerifyUserInfrastructure';
import ReportSubmittedPage from './pages/ReportSubmittedPage';
import './App.css';
import Signup from './pages/SignUp';
import About from './pages/About';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/profile" 
              element={
                  <ProfilePage/>
              } 
            />
            <Route path="/map" element={<MapPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/verify-infrastructure" element={<VerifyInfrastructurePage />} />
            <Route path="/verify-user-infrastructure" element={<VerifyUserInfrastructure />} />
            <Route path="/report-submitted" element={<ReportSubmittedPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
