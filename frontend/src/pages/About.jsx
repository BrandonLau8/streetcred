import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/'); // navigate to landing page
  };

  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About Us</h1>
        <p className="about-text">
          We believe every New Yorker should have the power to make their city better. That's why we created a fun, interactive way to report public issues, 
          from broken hydrants to bus delays and damaged sidewalks, all while earning badges and leveling up your civic impact.
          <br /><br />
          Our mission is to turn community awareness into action by combining real-world impact with the spirit of friendly competition. Every report helps 
          the city improve.
        </p>

        <div className="video-container">
          <iframe
            width="280"
            height="500"
            src="https://www.youtube.com/embed/IyX7Dlhh8vc"
            title="StreetCred Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

        <button className="about-button" onClick={handleBackClick}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default About;
