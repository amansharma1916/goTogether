import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../Styles/User/HomePage.css'
import { ShieldCheck, IndianRupee, Route, Users, Bike, Wallet } from 'lucide-react'

// Simple CountUp Component
const CountUp = ({ end }: { end: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / 30
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [end])

  return <h2>{count}+</h2>
}


const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handlePostRides = () => {
    navigate('/join', {
      state: searchQuery.trim() ? { originQuery: searchQuery } : undefined
    })
  }

  const handleRideNow = () => {
    navigate('/map', {
      state: searchQuery.trim() ? { originQuery: searchQuery } : undefined
    })
  }

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
              <svg
                className="search-icon-homepage"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="text"
                className="search-input"
                placeholder="Search your pickup location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-homepage">
            <button className="btn-action btn-first" onClick={handlePostRides}>
              Post Ride
            </button>
            <button className="btn-action btn-ride" onClick={handleRideNow}>
              Ride Now
            </button>
            <button
              className="btn-action btn-active-rides"
              onClick={() => navigate('/active-rides')}
            >
              My Active Rides
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
<div className="features-section">
  <div
    className="feature-card"
  >
    <ShieldCheck size={36} className="feature-icon" />
    <h3>Verified Students</h3>
    <p>Only college-approved students can join rides.</p>

    <div className="feature-hover">
      <span>Learn more →</span>
    </div>
  </div>

  <div
    className="feature-card"
  >
    <IndianRupee size={36} className="feature-icon" />
    <h3>Low Cost Travel</h3>
    <p>Cheaper than buses or autos for daily commute.</p>

    <div className="feature-hover">
      <span>Learn more →</span>
    </div>
  </div>

  <div
    className="feature-card"
  >
    <Route size={36} className="feature-icon" />
    <h3>Same Route Mating</h3>
    <p>Match with students traveling your route.</p>

    <div className="feature-hover">
      <span>Learn more →</span>
    </div>
  </div>
</div>

<div className="stats-divider-accent"></div>

      {/* Stats Section */}
      {/* Enhanced Stats Section */}
<div
  className="stats-section"
>
  <div className="stat-card">
    <Users size={32} className="stat-icon" />
    <CountUp end={1200} />
    <span>Verified Students</span>
  </div>

  <div className="stat-card">
    <Bike size={32} className="stat-icon" />
    <CountUp end={300} />
    <span>Daily Rides</span>
  </div>

  <div className="stat-card">
    <Wallet size={32} className="stat-icon" />
    <h2>₹40</h2>
    <span>Average Fare</span>
  </div>
</div>
    </div>
  )
}

export default HomePage
