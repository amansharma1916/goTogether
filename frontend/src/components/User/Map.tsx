import React from 'react'
import Navbar from './Assets/Navbar'
import MapComponent from '../User/Assets/MapComponent'
import '../../Styles/User/Map.css'

const Map = () => {
  return (
    <div className="map-page">
      <Navbar />
      <div className="map-page-container">
        {/* Left Side - Search Container */}
        <div className="map-search-container">
          <div className="map-search-section">
            <h3 className="map-search-title">Find Your Ride</h3>
            
            {/* From Location */}
            <div className="map-search-input-group">
              <label className="map-search-label">From</label>
              <div className="map-search-input-wrapper">
                <svg className="map-location-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input 
                  type="text" 
                  className="map-search-input"
                  placeholder="Enter pickup location"
                />
              </div>
            </div>

            

            <button className="map-search-button">Search Rides</button>
          </div>

          {/* Available Rides Section */}
          <div className="map-rides-list-section">
            <h4 className="map-rides-title">Available Rides</h4>
            <div className="map-rides-list">
              {/* Rides will be displayed here */}
              <p className="map-no-rides">Search for rides to see available options</p>
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="map-container">
          <MapComponent />
        </div>
      </div>
    </div>
  )
}

export default Map