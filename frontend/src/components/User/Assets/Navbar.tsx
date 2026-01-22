import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../../../Styles/User/Assets/Navbar.css'
import logo from '../../../images/logo/gotogetherLogo.png'
import NotificationPanel from './NotificationPanel'
import { useNotifications } from '../../../context/NotificationContext'

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      const clickOutsideNotifications = notificationRef.current && !notificationRef.current.contains(target);

      if (clickOutsideDropdown) {
        setIsDropdownOpen(false);
      }
      if (clickOutsideNotifications) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('LoggedInUser');
    
    navigate('/login');
  };
  
  return (
    <div className="Navbar-container">
      <nav className="top-navbar">
        <div className="nav-left">
          <div className="logo-container-nav">
            <img src={logo} alt="GoTogether" className="app-logo" />
            <span className="app-name">GoTogether</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="nav-links">
            <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
            <Link to="/rides" className={`nav-link ${location.pathname === '/rides' ? 'active' : ''}`}>Rides</Link>
            <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>Map</Link>
            <Link to="/join" className={`nav-link ${location.pathname === '/join' ? 'active' : ''}`}>Join</Link>
            <Link to="/bookings" className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`}>Bookings</Link>
          </div>
        </div>

        <div className="nav-right">
          <div className="user-profile-dropdown" ref={dropdownRef}>
            <button 
              className="nav-icon-btn user-profile-btn"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationsOpen(false);
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="white" strokeWidth="2"/>
                <circle cx="16" cy="13" r="5" fill="white"/>
                <path d="M7 27c0-5 4-8 9-8s9 3 9 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item user-info" onClick={() => setIsDropdownOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="12" cy="9" r="3"/>
                    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6"/>
                  </svg>
                  <span>My Profile</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-btn" onClick={handleLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className="nav-icon-btn notification-btn"
              onClick={() => {
                const nextOpen = !isNotificationsOpen;
                setIsNotificationsOpen(nextOpen);
                setIsDropdownOpen(false);
                if (nextOpen) {
                  markAllAsRead();
                }
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={`notification-badge ${unreadCount ? 'visible' : ''}`}>
                {unreadCount > 9 ? '9+' : unreadCount || ''}
              </span>
            </button>
            {isNotificationsOpen && (
              <NotificationPanel
                notifications={notifications}
                onMarkAll={markAllAsRead}
                onRemove={removeNotification}
              />
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar   