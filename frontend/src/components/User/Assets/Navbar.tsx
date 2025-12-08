import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../../../Styles/User/Assets/Navbar.css'
import logo from '../../../images/logo/gotogetherLogo.png'

const Navbar = () => {
  const location = useLocation();
  
  return (
    <div className="Navbar-container">
      <nav className="top-navbar">
        {/* Left - App Logo */}
        <div className="nav-left">
          <div className="logo-container-nav">
            <img src={logo} alt="GoTogether" className="app-logo" />
            <span className="app-name">GoTogether</span>
          </div>
        </div>

        {/* Center - Navigation Links */}
        <div className="nav-center">
          <div className="nav-links">
            <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
            <Link to="/rides" className={`nav-link ${location.pathname === '/rides' ? 'active' : ''}`}>Rides</Link>
            <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>Map</Link>
            <Link to="/join" className={`nav-link ${location.pathname === '/join' ? 'active' : ''}`}>Join</Link>
          </div>
        </div>

        {/* Right - User & Notification Icons */}
        <div className="nav-right">
          <button className="nav-icon-btn">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="2"/>
              <circle cx="16" cy="13" r="5" fill="white"/>
              <path d="M7 27c0-5 4-8 9-8s9 3 9 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="nav-icon-btn notification-btn">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="notification-badge"></span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Navbar   