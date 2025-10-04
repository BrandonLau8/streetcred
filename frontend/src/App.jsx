import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import VerifyHydrantPage from './pages/VerifyHydrantPage';
import ReportSubmittedPage from './pages/ReportSubmittedPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/verify-hydrant" element={<VerifyHydrantPage />} />
          <Route path="/report-submitted" element={<ReportSubmittedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
