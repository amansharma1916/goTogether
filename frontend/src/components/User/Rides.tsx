import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../Styles/User/Rides.css'
import Navbar from './Assets/Navbar'

interface Ride {
  _id: string;
  fullName: string;
  userId: string;
  driverId: {
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
  distanceToMeetPoint?: number; 
}

const ServerURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';



const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'distance' | 'time' | 'price'>('distance');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ridesPerPage = 6;
  const [totalRides, setTotalRides] = useState(0);
  const LoggedInUser = localStorage.getItem('LoggedInUser');

  useEffect(() => {

    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          
          setUserLocation({ lat: 23.334284, lng: 85.258330 });
        }
      );
    } else {
      
      setUserLocation({ lat: 23.334284, lng: 85.258330 });
    }
    
    fetchAllRides();
  }, []);

  const fetchAllRides = async (page = 1) => {
    setIsLoading(true);
    try {
      
      const loggedInUserStr = localStorage.getItem('LoggedInUser');
      const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
      const userId = loggedInUser?.id;

      
      const url = userId 
        ? `${ServerURL}/api/rides?userId=${userId}&page=${page}&limit=${ridesPerPage}`
        : `${ServerURL}/api/rides?page=${page}&limit=${ridesPerPage}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRides(data.rides);
        setTotalRides(data.pagination?.totalRides || data.rides.length);
      } else {
        console.error('Failed to fetch rides:', data.message);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyRides = async (page = 1) => {
    setIsLoading(true);
    try {
      
      const loggedInUserStr = localStorage.getItem('LoggedInUser');
      const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
      const userId = loggedInUser?.id;

      if (!userId) {
        console.error('User not logged in');
        setRides([]);
        setTotalRides(0);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${ServerURL}/api/rides/my-rides?userId=${userId}&page=${page}&limit=${ridesPerPage}`);
      const data = await response.json();

      if (data.success) {
        setRides(data.rides);
        setTotalRides(data.pagination?.totalRides || data.rides.length);
      } else {
        console.error('Failed to fetch my rides:', data.message);
        setRides([]);
        setTotalRides(0);
      }
    } catch (error) {
      console.error('Error fetching my rides:', error);
      setRides([]);
      setTotalRides(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewModeChange = (mode: 'all' | 'my') => {
    setViewMode(mode);
    setCurrentPage(1);
    if (mode === 'all') {
      fetchAllRides(1);
    } else {
      fetchMyRides(1);
    }
  };

  const handleViewRide = (ride: Ride) => {
    navigate('/map', { state: { ride } });
  };

  const handleBookRide = async (e: React.MouseEvent, ride: Ride) => {
    e.stopPropagation(); // Prevent card click event

    try {
      // Get user info
      const loggedInUserStr = localStorage.getItem('LoggedInUser');
      const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
      const userId = loggedInUser?.id;

      if (!userId) {
        alert('Please log in to book a ride');
        return;
      }

      if (!userLocation) {
        alert('Unable to determine your location. Please enable location services.');
        return;
      }

      // Calculate meeting point (nearest point on route)
      let nearestPoint = null;
      let minDistance = Infinity;
      
      ride.route.coordinates.forEach((coord) => {
        const [lng, lat] = coord;
        const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
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
          lat: userLocation.lat,
          lng: userLocation.lng
        },
        pickupLocationName: 'My Location',
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
        if (viewMode === 'all') {
          fetchAllRides(currentPage);
        } else {
          fetchMyRides(currentPage);
        }
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  
  const calculateDistanceToNearestPoint = (ride: Ride): number => {
    if (!userLocation || !ride.route || !ride.route.coordinates) {
      return Infinity;
    }

    let minDistance = Infinity;
    ride.route.coordinates.forEach((coord) => {
      const [lng, lat] = coord;
      const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
      if (distance < minDistance) {
        minDistance = distance;
      }
    });

    return minDistance;
  };

  const sortRides = (ridesToSort: Ride[]) => {
    const sorted = [...ridesToSort];
    
    switch (sortBy) {
      case 'distance':
        
        return sorted.map(ride => ({
          ...ride,
          distanceToMeetPoint: calculateDistanceToNearestPoint(ride)
        })).sort((a, b) => (a.distanceToMeetPoint || Infinity) - (b.distanceToMeetPoint || Infinity));
      case 'time':
        return sorted.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
      case 'price':
        return sorted.sort((a, b) => a.pricePerSeat - b.pricePerSeat);
      default:
        return sorted;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sortedRides = sortRides(rides);

  // Server-side pagination - calculate based on total rides from server
  const totalPages = Math.ceil(totalRides / ridesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (viewMode === 'all') {
      fetchAllRides(pageNumber);
    } else {
      fetchMyRides(pageNumber);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (viewMode === 'all') {
        fetchAllRides(newPage);
      } else {
        fetchMyRides(newPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (viewMode === 'all') {
        fetchAllRides(newPage);
      } else {
        fetchMyRides(newPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="rides-page">
      <Navbar />
      <div className="rides-container">
        <div className="rides-header">
          <div className="rides-title-section">
            <h1 className="rides-title">
              {viewMode === 'all' ? 'All Available Rides' : 'My Posted Rides'}
            </h1>
            <p className="rides-subtitle">
              Showing {totalRides > 0 ? ((currentPage - 1) * ridesPerPage) + 1 : 0}-{Math.min(currentPage * ridesPerPage, totalRides)} of {totalRides} rides
            </p>
          </div>
          
          <div className="rides-controls">
            <div className="view-mode-buttons">
              <button 
                className={`view-mode-btn ${viewMode === 'all' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('all')}
              >
                All Rides
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'my' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('my')}
              >
                My Rides
              </button>
            </div>
            
            <div className="rides-sort">
              <label className="sort-label">Sort by:</label>
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'distance' | 'time' | 'price');
                  setCurrentPage(1);
                }}
              >
                <option value="distance">Distance (Shortest First)</option>
                <option value="time">Departure Time</option>
                <option value="price">Price (Lowest First)</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rides-loading">
            <div className="loading-spinner"></div>
            <p>Loading rides...</p>
          </div>
        ) : sortedRides.length > 0 ? (
          <>
          <div className="rides-grid">
            {sortedRides.map((ride) => (
              <div 
                key={ride._id} 
                className="ride-card"
                onClick={() => handleViewRide(ride)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ride-card-header">
                  <div className="ride-driver">
                    <div className="driver-avatar">
                      {ride.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="driver-info">
                      {ride.fullName}
                      <p className="ride-date">{formatDate(ride.departureTime)}</p>
                    </div>
                  </div>
                  <div className="ride-price">
                    <span className="price-amount">${ride.pricePerSeat}</span>
                    <span className="price-label">per seat</span>
                  </div>
                </div>

                <div className="ride-route">
                  <div className="route-point">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ADE80">
                      <circle cx="12" cy="12" r="8"/>
                    </svg>
                    <span>Origin: {ride.origin.coordinates[1].toFixed(4)}, {ride.origin.coordinates[0].toFixed(4)}</span>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
                      <circle cx="12" cy="12" r="8"/>
                    </svg>
                    <span>Destination: Amity University Jharkhand : {ride.destination.coordinates[1].toFixed(4)}, {ride.destination.coordinates[0].toFixed(4)}</span>
                  </div>
                </div>

                <div className="ride-details">
                  {ride.distanceToMeetPoint !== undefined && (
                    <div className="detail-item highlight">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{ride.distanceToMeetPoint.toFixed(1)} km to meetpoint</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{formatTime(ride.departureTime)}</span>
                  </div>
                  <div className="detail-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{ride.seatsAvailable} seats</span>
                  </div>
                  <div className="detail-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                      <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z"/>
                    </svg>
                    <span>{(ride.distanceMeters / 1000).toFixed(1)} km ride</span>
                  </div>
                  <div className="detail-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{Math.round(ride.durationSeconds / 60)} min</span>
                  </div>
                </div>

                {ride.notes && (
                  <div className="ride-notes">
                    <p>{ride.notes}</p>
                  </div>
                )}
              {LoggedInUser && JSON.parse(LoggedInUser).id === ride.userId ? <button 
                className="book-button"
                onClick={(e) => e.preventDefault()}
                >
                  View Your Rides
                </button> :

                <button 
                className="book-button"
                onClick={(e) => handleBookRide(e, ride)}
                >
                  Book This Ride
                </button>
                }
                
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          )}
          </>
        ) : (
          <div className="no-rides">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>No Rides Available</h3>
            <p>Check back later for available rides</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Rides