import { useState, useEffect } from 'react';
import "../../Styles/User/Bookings.css";
import Navbar from './Assets/Navbar';

interface Booking {
  _id: string;
  rideId: {
    _id: string;
    origin: { name: string };
    destination: { name: string };
    departureTime: string;
    pricePerSeat: number;
    seatsAvailable: number;
  };
  riderId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  driverId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  seatsBooked: number;
  pickupLocationName: string;
  distanceToMeetingPoint: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment: {
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
  };
  bookedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancellation?: {
    cancelledBy: string;
    cancellationReason: string;
    cancelledAt: string;
  };
  rating?: {
    ratingForDriver: number;
    reviewForDriver: string;
  };
}

const Bookings = () => {
  const [viewMode, setViewMode] = useState<'received' | 'sent'>('received');
  const [receivedBookings, setReceivedBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // Get user ID from localStorage
    const loggedInUser = localStorage.getItem('LoggedInUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      if (viewMode === 'received') {
        fetchReceivedBookings();
      } else {
        fetchMyBookings();
      }
    }
  }, [userId, viewMode]);

  const fetchReceivedBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/received?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setReceivedBookings(data.bookings);
      } else {
        console.error('Failed to fetch received bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching received bookings:', error);
      alert('Failed to load received bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/my-bookings?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setMyBookings(data.bookings);
      } else {
        console.error('Failed to fetch my bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error);
      alert('Failed to load your bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Booking confirmed successfully!');
        fetchReceivedBookings();
      } else {
        alert(data.message || 'Failed to confirm booking');
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    }
  };

  const handleCancel = async (bookingId: string, isDriver: boolean) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          cancelledBy: isDriver ? 'driver' : 'rider',
          cancellationReason: reason
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Booking cancelled successfully');
        if (isDriver) {
          fetchReceivedBookings();
        } else {
          fetchMyBookings();
        }
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Booking marked as completed!');
        fetchReceivedBookings();
      } else {
        alert(data.message || 'Failed to complete booking');
      }
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Failed to complete booking');
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'confirmed':
        return 'status-badge status-confirmed';
      case 'completed':
        return 'status-badge status-completed';
      case 'cancelled':
        return 'status-badge status-cancelled';
      case 'rejected':
        return 'status-badge status-rejected';
      default:
        return 'status-badge';
    }
  };

  const renderBookingCard = (booking: Booking, isReceived: boolean) => {
    return (
      <div key={booking._id} className="booking-card">
        <div className="booking-header">
          <div className="booking-route">
            <h3>{booking.rideId.origin.name}</h3>
            <span className="route-arrow">→</span>
            <h3>{booking.rideId.destination.name}</h3>
          </div>
          <span className={getStatusBadgeClass(booking.status)}>
            {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Departure:</span>
            <span className="detail-value">{formatDate(booking.rideId.departureTime)}</span>
          </div>

          {isReceived ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Rider:</span>
                <span className="detail-value">{booking.riderId.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{booking.riderId.phone}</span>
              </div>
            </>
          ) : (
            <>
              <div className="detail-row">
                <span className="detail-label">Driver:</span>
                <span className="detail-value">{booking.driverId.fullName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{booking.driverId.phone}</span>
              </div>
            </>
          )}

          <div className="detail-row">
            <span className="detail-label">Pickup Location:</span>
            <span className="detail-value">{booking.pickupLocationName}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Seats Booked:</span>
            <span className="detail-value">{booking.seatsBooked}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value amount">₹{booking.payment.totalAmount}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span className="detail-value">{booking.payment.paymentMethod.toUpperCase()}</span>
          </div>

          {booking.distanceToMeetingPoint && (
            <div className="detail-row">
              <span className="detail-label">Distance to Meeting Point:</span>
              <span className="detail-value">{(booking.distanceToMeetingPoint / 1000).toFixed(2)} km</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Booked At:</span>
            <span className="detail-value">{formatDate(booking.bookedAt)}</span>
          </div>

          {booking.cancellation && (
            <div className="cancellation-info">
              <p><strong>Cancelled by:</strong> {booking.cancellation.cancelledBy}</p>
              <p><strong>Reason:</strong> {booking.cancellation.cancellationReason}</p>
              <p><strong>Cancelled at:</strong> {formatDate(booking.cancellation.cancelledAt)}</p>
            </div>
          )}
        </div>

        <div className="booking-actions">
          {isReceived ? (
            // Actions for received bookings (as driver)
            <>
              {booking.status === 'pending' && (
                <>
                  <button className="btn-confirm" onClick={() => handleConfirm(booking._id)}>
                    Confirm Booking
                  </button>
                  <button className="btn-cancel" onClick={() => handleCancel(booking._id, true)}>
                    Reject
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <button className="btn-complete" onClick={() => handleComplete(booking._id)}>
                    Mark as Completed
                  </button>
                  <button className="btn-cancel" onClick={() => handleCancel(booking._id, true)}>
                    Cancel
                  </button>
                </>
              )}
            </>
          ) : (
            // Actions for my bookings (as rider)
            <>
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button className="btn-cancel" onClick={() => handleCancel(booking._id, false)}>
                  Cancel Booking
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const currentBookings = viewMode === 'received' ? receivedBookings : myBookings;

  return (
    <>
      <Navbar />
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <div className="view-mode-buttons">
          <button
            className={`view-mode-btn ${viewMode === 'received' ? 'active' : ''}`}
            onClick={() => setViewMode('received')}
          >
            Received Requests
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'sent' ? 'active' : ''}`}
            onClick={() => setViewMode('sent')}
          >
            My Requests
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading bookings...</div>
      ) : currentBookings.length === 0 ? (
        <div className="no-bookings">
          <p>
            {viewMode === 'received'
              ? 'No booking requests received yet'
              : 'You haven\'t made any booking requests yet'}
          </p>
        </div>
      ) : (
        <div className="bookings-grid">
          {currentBookings.map((booking) => renderBookingCard(booking, viewMode === 'received'))}
        </div>
      )}
    </div>
    </>
  );
};

export default Bookings; 