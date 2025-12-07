import '../../Styles/Default/LandingPage.css'
import logo from '../../images/logo/gotogetherLogo.png'
import MapImg from '../../images/Landing/road.png'
import { Link } from 'react-router-dom'
const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-container">
            <img src={logo} alt="goTogether Logo" className="logo" />
            <span className="logo-text">goTogether</span>
          </div>
          
          <h1 className="hero-title">
            A safer, smarter<br />
            way for students to<br />
            share rides.
          </h1>
          
          <p className="hero-description">
            Find rides to your college or offer seats on your<br />
            route — only verified students.
          </p>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn-get-started" >Get Started</Link>
            <Link to="/login" className="btn-login">Login</Link>
          </div>
        </div>
        
        <div className="hero-image">
          <img src={MapImg} alt="Map Illustration" />
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature">
          <div className="feature-icon">🎓</div>
          <h3 className="feature-title">Verified Students Only</h3>
          <p className="feature-description">
            All users are authenticated via university<br />
            credentials, ensuring a trusted<br />
            community.
          </p>
        </div>
        
        <div className="feature">
          <div className="feature-icon">💰</div>
          <h3 className="feature-title">Affordable Ride Sharing</h3>
          <p className="feature-description">
            Save money on transport with shared<br />
            rides, making daily commutes<br />
            budget-friendly.
          </p>
        </div>
        
        <div className="feature">
          <div className="feature-icon">📍</div>
          <h3 className="feature-title">Safe & Real-Time Updates</h3>
          <p className="feature-description">
            Track rides with live updates and travel<br />
            safely with verified student drivers.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="footer">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#privacy">Privacy</a>
      </footer>
    </div>
  )
}

export default LandingPage