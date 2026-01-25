import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Assets/Navbar';
import '../../Styles/User/ActiveRidesPage.css';
import apiClient from '../../services/api';

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(null);
  const [statusAction, setStatusAction] = useState<'payment' | 'complete' | 'cancel'>('payment');
  const [cancellationReason, setCancellationReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
      const riderResponse = await apiClient.get('/bookings/my-bookings');
      const riderData = riderResponse.data;
      const riderRides = riderData.success
        ? riderData.bookings.filter((b: ActiveRide) => b.status === 'confirmed')
        : [];

      // Fetch confirmed bookings where user is driver
      const driverResponse = await apiClient.get('/bookings/received');
      const driverData = driverResponse.data;
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

  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     year: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   });
  // };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = async () => {
    if (!selectedRide) return;

    setIsUpdating(true);
    try {
      let status = 'confirmed';
      let paymentStatus = undefined;
      let reason = undefined;

      if (statusAction === 'payment') {
        paymentStatus = 'paid';
      } else if (statusAction === 'complete') {
        status = 'completed';
      } else if (statusAction === 'cancel') {
        status = 'cancelled';
        reason = cancellationReason || 'Emergency cancellation';
      }

      const response = await apiClient.patch(
        `/bookings/${selectedRide._id}/status`,
        {
          status,
          paymentStatus,
          cancellationReason: reason
        }
      );

      const data = response.data;

      if (data.success) {
        // Refresh active rides
        await fetchActiveRides();
        setShowStatusModal(false);
        setSelectedRide(null);
        setCancellationReason('');
        alert(`Ride ${statusAction === 'payment' ? 'payment marked as done' : statusAction === 'complete' ? 'completed' : 'cancelled'} successfully!`);
      } else {
        alert(data.message || 'Failed to update ride status');
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      alert('Error updating ride status');
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (ride: ActiveRide, action: 'payment' | 'complete' | 'cancel') => {
    setSelectedRide(ride);
    setStatusAction(action);
    setShowStatusModal(true);
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
                    
                    {/* Status Update Buttons */}
                    <div className="status-actions">
                      {ride.payment.paymentStatus === 'pending' && (
                        <button 
                          className="status-btn payment-btn"
                          onClick={() => openStatusModal(ride, 'payment')}
                        >
                          💳 Payment Done
                        </button>
                      )}
                      
                      {ride.payment.paymentStatus === 'paid' && (
                        <button 
                          className="status-btn complete-btn"
                          onClick={() => openStatusModal(ride, 'complete')}
                        >
                          ✅ Complete Ride
                        </button>
                      )}
                      
                      <button 
                        className="status-btn cancel-btn"
                        onClick={() => openStatusModal(ride, 'cancel')}
                      >
                        ⚠️ Emergency Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusModal && selectedRide && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {statusAction === 'payment' && '💳 Mark Payment as Done'}
                  {statusAction === 'complete' && '✅ Complete Ride'}
                  {statusAction === 'cancel' && '⚠️ Emergency Cancel Ride'}
                </h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowStatusModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <div className="ride-summary">
                  <p><strong>Route:</strong> {selectedRide.rideId.origin.name} → {selectedRide.rideId.destination.name}</p>
                  <p><strong>Amount:</strong> ₹{selectedRide.payment.totalAmount}</p>
                  <p><strong>{selectedRide.riderId._id === userId ? 'Driver' : 'Passenger'}:</strong> {selectedRide.riderId._id === userId ? selectedRide.driverId.fullName : selectedRide.riderId.fullName}</p>
                </div>

                {statusAction === 'payment' && (
                  <div className="confirmation-text">
                    <p>Confirm that the payment of ₹{selectedRide.payment.totalAmount} has been completed?</p>
                  </div>
                )}

                {statusAction === 'complete' && (
                  <div className="confirmation-text">
                    <p>Mark this ride as completed? This action cannot be undone.</p>
                  </div>
                )}

                {statusAction === 'cancel' && (
                  <div className="cancellation-section">
                    <p className="warning-text">⚠️ This is an emergency cancellation. Please provide a reason:</p>
                    <textarea
                      className="cancellation-input"
                      placeholder="Reason for cancellation (optional)"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowStatusModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  className={`btn-confirm ${statusAction === 'cancel' ? 'btn-danger' : ''}`}
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveRidesPage;
