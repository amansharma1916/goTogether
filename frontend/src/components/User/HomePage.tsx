import '../../Styles/User/HomePage.css'

const HomePage = () => {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section-homepage">
        <div className="hero-content-homepage">
          <h1 className="hero-title-homepage">
            Student Rideshare Platform.<br />
            Find your ride today!
          </h1>
          
          {/* Search Bar */}
          <div className="search-container-homepage">
            <div className="search-bar-homepage">
              <svg className="search-icon-homepage" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search for rides, destinations..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-homepage">
            <button className="btn-action btn-first">Post Rides</button>
            <button className="btn-action btn-ride">Ride now</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage 