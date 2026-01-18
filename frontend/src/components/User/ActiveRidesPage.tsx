import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Assets/Navbar';
import '../../Styles/User/ActiveRidesPage.css';

interface ActiveRide {
  _id: string;
  rideId: {
    _id: string;
    origin: { name: string; coordinates?: [number, number] };
    destination: { name: string; coordinates?: [number, number] };
    departureTime: string;
    driverId: string;
    pricePerSeat: number;
  };
  riderId: {
    _id: string;
    fullName: string;
  };
  driverId: {
    _id: string;
    fullName: string;
  };
  seatsBooked: number;
  pickupLocationName: string;
  payment: {
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
  };
  confirmedAt?: string;
  status: string;
}

const ActiveRidesPage = () => {
  const navigate = useNavigate();
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loggedInUser = localStorage.getItem('LoggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchActiveRides();
    }
  }, [userId]);

  const fetchActiveRides = async () => {
    setIsLoading(true);
    try {
      // Fetch confirmed bookings where user is rider
      const riderResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/my-bookings?userId=${userId}`
      );
      const riderData = await riderResponse.json();
      const riderRides = riderData.success
        ? riderData.bookings.filter((b: ActiveRide) => b.status === 'confirmed')
        : [];

      // Fetch confirmed bookings where user is driver
      const driverResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/received?userId=${userId}`
      );
      const driverData = await driverResponse.json();
      const driverRides = driverData.success
        ? driverData.bookings.filter((b: ActiveRide) => b.status === 'confirmed')
        : [];

      const allRides = [...riderRides, ...driverRides];
      setActiveRides(allRides);
    } catch (error) {
      console.error('Error fetching active rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="active-rides-page">
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/home')}>
            ← Back
          </button>
          <h1>My Active Rides</h1>
          <div className="rides-count">
            {activeRides.length} {activeRides.length === 1 ? 'ride' : 'rides'}
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your active rides...</p>
          </div>
        ) : activeRides.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚗</div>
            <h2>No Active Rides</h2>
            <p>You don't have any confirmed rides at the moment</p>
            <button className="btn-browse" onClick={() => navigate('/map')}>
              Browse Available Rides
            </button>
          </div>
        ) : (
          <div className="rides-grid">
            {activeRides.map((ride) => {
              const isRider = ride.riderId._id === userId;
              const counterparty = isRider ? ride.driverId : ride.riderId;

              return (
                <div key={ride._id} className="ride-card">
                  {/* Header */}
                  <div className="card-header">
                    <div className="route-display">
                      <div className="location-item">
                        <span className="location-icon">📍</span>
                        <div className="location-details">
                          <span className="location-label">From</span>
                          <span className="location-name">{ride.rideId.origin.name}</span>
                        </div>
                      </div>
                      <div className="route-divider"></div>
                      <div className="location-item">
                        <span className="location-icon">🎯</span>
                        <div className="location-details">
                          <span className="location-label">To</span>
                          <span className="location-name">{ride.rideId.destination.name}</span>
                        </div>
                      </div>
                    </div>
                    <span className="status-label">✓ CONFIRMED</span>
                  </div>

                  {/* Body */}
                  <div className="card-body">
                    {/* Person Section */}
                    <div className="info-section">
                      <h4 className="section-title">
                        {isRider ? '🚗 Driver' : '👤 Passenger'}
                      </h4>
                      <div className="person-info">
                        <span className="person-name">{counterparty.fullName}</span>
                      </div>
                    </div>

                    {/* Trip Details Section */}
                    <div className="info-section">
                      <h4 className="section-title">📅 Trip Details</h4>
                      <div className="details-grid">
                        <div className="detail-row">
                          <span className="detail-key">Pickup Location</span>
                          <span className="detail-value">{ride.pickupLocationName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-key">Departure</span>
                          <span className="detail-value">{formatTime(ride.rideId.departureTime)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-key">Date</span>
                          <span className="detail-value">
                            {new Date(ride.rideId.departureTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-key">Seats</span>
                          <span className="detail-value">{ride.seatsBooked}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="info-section">
                      <h4 className="section-title">💳 Payment</h4>
                      <div className="payment-info">
                        <div className="price-box">
                          <span className="price-label">Total Amount</span>
                          <span className="price-amount">₹{ride.payment.totalAmount}</span>
                        </div>
                        <div className="payment-details">
                          <span className="payment-status">{ride.payment.paymentStatus.toUpperCase()}</span>
                          <span className="payment-method">{ride.payment.paymentMethod.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="card-footer">
                    <button 
                      className="action-btn primary-btn"
                      onClick={() => navigate('/map', { state: { booking: ride } })}
                    >
                      View on Map
                    </button>
                    <button className="action-btn secondary-btn">Chat</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveRidesPage;
