import Navbar from './Assets/Navbar'
import MapComponent from './Assets/MapComponent'
import '../../Styles/User/Join.css'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Loader from './Assets/Loader'
import { useNotifications } from '../../context/NotificationContext'
import { useGlobalLoader } from '../../context/GlobalLoaderContext'

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

const ServerURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || '';



const Join = () => {
  const location = useLocation();
  const { addNotification } = useNotifications();
  const { show, hide } = useGlobalLoader();
  const [originQuery, setOriginQuery] = useState("");
  const [originResults, setOriginResults] = useState<NominatimResult[]>([]);
  const [originLocation, setOriginLocation] = useState<LocationData | null>(null);
  const [isTypingOrigin, setIsTypingOrigin] = useState(false);
  const [destQuery, setDestQuery] = useState("Amity University Ranchi");
  const [destResults, setDestResults] = useState<NominatimResult[]>([]);
  const [destLocation, setDestLocation] = useState<LocationData | null>({
    lat: 23.334284328951455,
    lng: 85.25833023900533,
    name: "Amity University Ranchi"
  });

  const [departureDate, setDepartureDate] = useState("");
  const [seats, setSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [availableRoutes, setAvailableRoutes] = useState<number>(0);
  const [User, setUser] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  useEffect(() => {
    const getUser = localStorage.getItem('LoggedInUser');
    const User = getUser ? JSON.parse(getUser) : null;
    setUser(User);
    console.log("LoggedInUser:", User);
  }, []);

  
  useEffect(() => {
    if (location.state?.originQuery) {
      setOriginQuery(location.state.originQuery);
      setIsTypingOrigin(true);
    }
  }, [location.state]);
  
  useEffect(() => {
    if (originQuery.length < 3) {
      setOriginResults([]);
      return;
    }

    const delay = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(originQuery)}&format=json&limit=5`
      )
        .then((res) => res.json())
        .then((data) => setOriginResults(data))
        .catch((err) => console.error('Error fetching origin:', err));
    }, 400);

    return () => clearTimeout(delay);
  }, [originQuery]);

  useEffect(() => {
    if (destQuery.length < 3) {
      setDestResults([]);
      return;
    }

    const delay = setTimeout(() => {
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destQuery)}&format=json&limit=5`
      )
        .then((res) => res.json())
        .then((data) => setDestResults(data))
        .catch((err) => console.error('Error fetching destination:', err));
    }, 400);

    return () => clearTimeout(delay);
  }, [destQuery]);

  const handleOriginSelect = (result: NominatimResult) => {
    const location: LocationData = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name
    };
    setOriginLocation(location);
    setOriginQuery(result.display_name);
    setOriginResults([]);
    setIsTypingOrigin(false);
  };

  const handleDestSelect = (result: NominatimResult) => {
    const location: LocationData = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name
    };
    setDestLocation(location);
    setDestQuery(result.display_name);
    setDestResults([]);
  };

  const handleMapOriginClick = (location: LocationData) => {
    setOriginLocation(location);
    setOriginQuery(location.name);
    setOriginResults([]);
    setIsTypingOrigin(false);
  };

  

  const handlePublish = async () => {
    if (!originLocation || !destLocation) {
      alert("Please select both origin and destination");
      return;
    }

    if (!departureDate) {
      alert("Please select a departure date");
      return;
    }

    if (!pricePerSeat || parseFloat(pricePerSeat) <= 0) {
      alert("Please enter a valid price per seat");
      return;
    }

    setIsPublishing(true);
    show('Publishing your ride...');

    const rideData = {
      origin: originLocation,
      userId: User?.id,
      fullname: User.fullname,
      destination: destLocation,
      selectedRouteIndex,
      departureDate,
      seats,
      pricePerSeat,
      vehicle: "Bike",
      notes,
      driverId: "507f1f77bcf86cd799439011" // TODO: Get from auth context
    };

    console.log("Publishing ride with data:", rideData);
    
    try {
      const response = await fetch(`${ServerURL}/api/rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': ORS_API_KEY,
        },
        body: JSON.stringify(rideData)
      });

      const data = await response.json();

      if (data.success) {
        addNotification({
          title: 'Ride posted',
          message: 'Your ride was posted successfully.',
          type: 'success',
        });
        alert(`Ride posted successfully! Ride ID: ${data.rideId}`);
        handleReset();
      } else {
        addNotification({
          title: 'Ride posting failed',
          message: data.message || 'Unable to post your ride. Please try again.',
          type: 'warning',
        });
        alert(`Failed to post ride: ${data.message}`);
      }
    } catch (error) {
      console.error("Error publishing ride:", error);
      alert("Failed to publish ride. Please try again.");
    } finally {
      hide();
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
  };

  const handleReset = () => {
    setOriginQuery("");
    setOriginLocation(null);
    setOriginResults([]);
    setIsTypingOrigin(false);
  };

  // const fetchRoute = async (origin, destination) => {
  //   const response = await fetch(
  //     "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": ORS_API_KEY, // or backend
  //       },
  //       body: JSON.stringify({
  //         coordinates: [
  //           [origin.lng, origin.lat],
  //           [destination.lng, destination.lat]
  //         ],
  //         alternative_routes: {
  //           target_count: 3,
  //           share_factor: 0.6
  //         }
  //       }),
  //     }
  //   );

  //   const data = await response.json();
  //   return data.features; // each feature is a route
  // };


  return (
    <div className="join-page">
      {isPublishing && <Loader />}
      <Navbar />
      <div className="join-content">
        <div className="join-map-container">
          <MapComponent
            pickupLocation={originLocation}
            destinationLocation={destLocation}
            onPickupClick={handleMapOriginClick}
            selectedRouteIndex={selectedRouteIndex}
            onRouteSelect={setSelectedRouteIndex}
            onRoutesUpdate={setAvailableRoutes}
          />
        </div>

        <div className="join-form-container">
          <div className="join-header">
            <button className="join-back-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h2>Post a Ride</h2>
            <div className="join-avatar">
              <img src="https://via.placeholder.com/40" alt="User" />
            </div>
          </div>

          <div className="join-form">
            {/* Origin Input */}
            <div className="join-form-group">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#4ADE80">
                  <circle cx="12" cy="12" r="8" />
                </svg>
                <span>Origin</span>
              </label>
              <div className="join-input-wrapper">
                <input
                  type="text"
                  placeholder="Search Origin"
                  value={originQuery}
                  onChange={(e) => {
                    setOriginQuery(e.target.value);
                    setIsTypingOrigin(true);
                  }}
                />
                {isTypingOrigin && originResults.length > 0 && (
                  <div className="join-dropdown">
                    {originResults.map((result) => (
                      <div
                        key={result.place_id}
                        className="join-dropdown-item"
                        onClick={() => handleOriginSelect(result)}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="join-location-actions">
                <button className="join-my-location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  My Location
                </button>
                <button className="join-reset" onClick={handleReset}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>

            {/* Destination Input */}
            <div className="join-form-group">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>Destination</span>
              </label>
              <div className="join-input-wrapper">
                <input
                  type="text"
                  placeholder="College"
                  value={destQuery}
                  onChange={(e) => setDestQuery(e.target.value)}
                />
                <button className="join-edit-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                {destResults.length > 0 && (
                  <div className="join-dropdown">
                    {destResults.map((result) => (
                      <div
                        key={result.place_id}
                        className="join-dropdown-item"
                        onClick={() => handleDestSelect(result)}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="join-pickup-note">
                <span>Pick Up</span>
                <p>{originLocation?.name || '123 Main St, Downtown'}</p>
              </div>
            </div>

            {/* Seat Type Selector */}
            <div className="join-seat-types">
              <button 
                className={`join-seat-type ${selectedRouteIndex === 0 ? 'active' : ''}`}
                onClick={() => setSelectedRouteIndex(0)}
                disabled={availableRoutes < 1}
              >
                <div className="join-seat-icon" style={{ background: '#4ADE80' }}>A</div>
                <span>A (Green)</span>
              </button>
              <button 
                className={`join-seat-type ${selectedRouteIndex === 1 ? 'active' : ''}`}
                onClick={() => setSelectedRouteIndex(1)}
                disabled={availableRoutes < 2}
              >
                <div className="join-seat-icon" style={{ background: '#F59E0B' }}>B</div>
                <span>B (Amber)</span>
              </button>
              <button 
                className={`join-seat-type ${selectedRouteIndex === 2 ? 'active' : ''}`}
                onClick={() => setSelectedRouteIndex(2)}
                disabled={availableRoutes < 3}
              >
                <div className="join-seat-icon" style={{ background: '#3B82F6' }}>C</div>
                <span>C (Blue)</span>
              </button>
            </div>

            {/* Date & Time */}
            <div className="join-form-group">
              <label>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Departure Date</span>
              </label>
              <div className="join-date-input">
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="join-time-note">Select departure date for your ride.</p>
            </div>

            {/* Seats & Price */}
            <div className="join-form-row">
              <div className="join-form-group">
                <label>Seats Available</label>
                <div className="join-counter">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
                  <span>{seats}</span>
                  <button onClick={() => setSeats(seats + 1)}>+</button>
                </div>
                <p className="join-seats-note">Min 1, Max 8 seats.</p>
              </div>

              <div className="join-form-group">
                <label>Price per Seat</label>
                <div className="join-price-input">
                  <span className="join-currency">Rs</span>
                  <input
                    type="text"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    placeholder="5.00"
                  />
                </div>
                <p className="join-price-note">Enter a valid price.</p>
              </div>
            </div>

            {/* Notes */}
            <div className="join-form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information for riders..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="join-actions">
              <button className="join-publish-btn" onClick={handlePublish}>
                Publish Ride
              </button>
              <button className="join-draft-btn" onClick={handleSaveDraft}>
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Join