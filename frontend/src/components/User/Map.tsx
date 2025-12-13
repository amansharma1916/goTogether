import Navbar from './Assets/Navbar'
import MapComponent from '../User/Assets/MapComponent'
import '../../Styles/User/Map.css'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface Ride {
  _id: string;
  driverId: {
    // fullName: string;
    email: string;
  };
  origin: {
    type: string;
    coordinates: number[];
  };
  destination: {
    type: string;
    coordinates: number[];
  };
  route: {
    type: string;
    coordinates: number[][];
  };
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: number;
  distanceMeters: number;
  durationSeconds: number;
  notes?: string;
}

const ServerURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Map = () => {
  const location = useLocation();
  const [fromQuery, setFromQuery] = useState("");
  const [fromResults, setFromResults] = useState<NominatimResult[]>([]);
  const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<LocationData | null>(null);
  
  const [availableRides, setAvailableRides] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  // Handle ride passed from Rides page
  useEffect(() => {
    if (location.state?.ride) {
      const ride = location.state.ride as Ride;
      setSelectedRide(ride);
      setDestinationLocation({
        lat: ride.destination.coordinates[1],
        lng: ride.destination.coordinates[0],
        name: "Destination"
      });
      // Set pickup location to ride origin for display
      setPickupLocation({
        lat: ride.origin.coordinates[1],
        lng: ride.origin.coordinates[0],
        name: "Origin"
      });
      setFromQuery("Origin");
    }
  }, [location.state]);

  // Fetch suggestions for "From" location
  useEffect(() => {
    if (fromQuery.length < 3) {
      setFromResults([]);
      return;
    }

    const delay = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fromQuery)}&format=json&limit=5`
      )
        .then((res) => res.json())
        .then((data) => setFromResults(data))
        .catch((err) => console.error('Error fetching from location:', err));
    }, 300);

    return () => clearTimeout(delay);
  }, [fromQuery]);

  // Fetch suggestions for "To" location
  

  const handleFromLocationSelect = (item: NominatimResult) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);

    // Update input value
    setFromQuery(item.display_name);

    // Clear dropdown
    setFromResults([]);

    // Send location to map
    setPickupLocation({ lat, lng, name: item.display_name });
  };

  const handleMapPickupClick = (location: LocationData) => {
    setFromQuery(location.name);
    setPickupLocation(location);
  };

  const handleSearchRides = async () => {
    if (!pickupLocation) {
      alert("Please select a pickup location");
      return;
    }

    setIsSearching(true);
    setAvailableRides([]);
    setSelectedRide(null);

    try {
      // Get user ID from localStorage
      const loggedInUserStr = localStorage.getItem('LoggedInUser');
      const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
      const userId = loggedInUser?.id;

      const response = await fetch(`${ServerURL}/api/rides/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng
          },
          radiusMeters: 20000, // 2km radius
          userId: userId // Send userId to exclude own rides
        })
      });

      const data = await response.json();

      if (data.success) {
        setAvailableRides(data.rides);
      } else {
        alert(`Search failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error searching rides:", error);
      alert("Failed to search rides. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRideSelect = (ride: Ride) => {
    setSelectedRide(ride);
    // Set destination for the map
    setDestinationLocation({
      lat: ride.destination.coordinates[1],
      lng: ride.destination.coordinates[0],
      name: "Destination"
    });
  };

  const handleBookRide = async (e: React.MouseEvent, ride: Ride) => {
    e.stopPropagation(); // Prevent card selection

    try {
      // Get user info
      const loggedInUserStr = localStorage.getItem('LoggedInUser');
      const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
      const userId = loggedInUser?.id;

      if (!userId) {
        alert('Please log in to book a ride');
        return;
      }

      if (!pickupLocation) {
        alert('Please select a pickup location first');
        return;
      }

      // Calculate meeting point (nearest point on route to pickup location)
      let nearestPoint = null;
      let minDistance = Infinity;
      
      ride.route.coordinates.forEach((coord) => {
        const [lng, lat] = coord;
        const R = 6371; // Earth's radius in km
        const dLat = (lat - pickupLocation.lat) * Math.PI / 180;
        const dLng = (lng - pickupLocation.lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(pickupLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = { lat, lng };
        }
      });

      const bookingData = {
        rideId: ride._id,
        riderId: userId,
        seatsBooked: 1,
        pickupLocation: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng
        },
        pickupLocationName: pickupLocation.name || 'My Location',
        meetingPoint: nearestPoint,
        distanceToMeetingPoint: minDistance * 1000, // Convert to meters
        riderNotes: '',
        paymentMethod: 'cash'
      };

      const response = await fetch(`${ServerURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking successful! The driver will confirm your request.');
        // Refresh rides to update seat availability
        handleSearchRides();
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // const handleToLocationSelect = (item: NominatimResult) => {
  //   const lat = Number(item.lat);
  //   const lng = Number(item.lon);

  //   // Update input value
  //   setToQuery(item.display_name);

  //   // Clear dropdown
  //   setToResults([]);

  //   // Send location to map
  //   setDestinationLocation({ lat, lng, name: item.display_name });
  // };

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
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  type="text"
                  className="map-search-input"
                  placeholder="Enter pickup location"
                  value={fromQuery}
                  onChange={(e) => setFromQuery(e.target.value)}
                />
              </div>
              {fromResults.length > 0 && (
                <div className="map-dropdown">
                  {fromResults.map((item) => (
                    <div
                      key={item.place_id}
                      className="map-dropdown-item"
                      onClick={() => handleFromLocationSelect(item)}
                    >
                      {item.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            

            <button 
              className="map-search-button" 
              onClick={handleSearchRides}
              disabled={isSearching || !pickupLocation}
            >
              {isSearching ? 'Searching...' : 'Search Rides'}
            </button>
          </div>

          {/* Available Rides Section */}
          <div className="map-rides-list-section">
            <h4 className="map-rides-title">Available Rides ({availableRides.length})</h4>
            <div className="map-rides-list">
              {isSearching ? (
                <p className="map-no-rides">Searching for rides...</p>
              ) : availableRides.length > 0 ? (
                availableRides.map((ride) => (
                  <div 
                    key={ride._id} 
                    className={`map-ride-card ${selectedRide?._id === ride._id ? 'selected' : ''}`}
                    onClick={() => handleRideSelect(ride)}
                  >
                    <div className="map-ride-header">
                      <div className="map-ride-driver">
                        <div className="map-driver-avatar">
                          {/* {ride.driverId.fullName.charAt(0).toUpperCase()} */}
                        </div>
                        <div className="map-driver-info">
                          {/* <h5 className="map-driver-name">{ride.driverId.fullName}</h5> */}
                          <p className="map-ride-time">{formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}</p>
                        </div>
                      </div>
                      <div className="map-ride-price">
                        <span className="map-price-amount">${ride.pricePerSeat}</span>
                        <span className="map-price-label">per seat</span>
                      </div>
                    </div>
                    
                    <div className="map-ride-details">
                      <div className="map-ride-info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>{ride.seatsAvailable} seats available</span>
                      </div>
                      <div className="map-ride-info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{Math.round(ride.durationSeconds / 60)} min</span>
                      </div>
                      <div className="map-ride-info-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                          <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>
                        </svg>
                        <span>{(ride.distanceMeters / 1000).toFixed(1)} km</span>
                      </div>
                    </div>
                    
                    {ride.notes && (
                      <div className="map-ride-notes">
                        <p>{ride.notes}</p>
                      </div>
                    )}
                    
                    <button 
                      className="map-ride-book-btn" 
                      onClick={(e) => handleBookRide(e, ride)}
                    >
                      Book Ride
                    </button>
                  </div>
                ))
              ) : (
                <p className="map-no-rides">
                  {pickupLocation ? 'No rides found. Try adjusting your pickup location.' : 'Search for rides to see available options'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="map-container">
          <MapComponent 
            pickupLocation={pickupLocation} 
            destinationLocation={destinationLocation}
            onPickupClick={handleMapPickupClick}
            rideRoute={selectedRide?.route}
            showUserRoutes={false}
          />
        </div>
      </div>
    </div>
  )
}

export default Map