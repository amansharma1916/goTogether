import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../Styles/User/Bookings.css";
import Navbar from './Assets/Navbar';
import { useNotifications } from '../../context/NotificationContext';
import { useGlobalLoader } from '../../context/GlobalLoaderContext';
import apiClient from '../../services/api';

interface Booking {
  _id: string;
  rideId: {
    _id: string;
    origin: { name: string; coordinates?: [number, number] };
    destination: { name: string; coordinates?: [number, number] };
    departureTime: string;
    pricePerSeat: number;
    seatsAvailable: number;
    route?: { type: string; coordinates: [number, number][] };
  };
  riderId: {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  };
  driverId: {
    _id: string;
    fullname: string;
    email: string;
    phone: string;
  };
  seatsBooked: number;
  pickupLocationName: string;
  meetingPoint?: { type: string; coordinates: [number, number] };
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
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<'received' | 'sent'>('received');
  const [receivedBookings, setReceivedBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 4;
  const [totalReceivedBookings, setTotalReceivedBookings] = useState(0);
  const [totalMyBookings, setTotalMyBookings] = useState(0);
  const { show, hide } = useGlobalLoader();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('LoggedInUser');
    console.log('LoggedInUser from localStorage:', loggedInUser);
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setCurrentPage(1);
      if (viewMode === 'received') {
        fetchReceivedBookings(1);
      } else {
        fetchMyBookings(1);
      }
    }
  }, [userId, viewMode]);

  const fetchReceivedBookings = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/bookings/received', {
        params: { page, limit: bookingsPerPage }
      });
      if (response.data.success) {
        setReceivedBookings(response.data.bookings);
        setTotalReceivedBookings(response.data.pagination?.totalBookings || response.data.bookings.length);
      } else {
        console.error('Failed to fetch received bookings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching received bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBookings = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/bookings/my-bookings', {
        params: { page, limit: bookingsPerPage }
      });
      if (response.data.success) {
        setMyBookings(response.data.bookings);
        setTotalMyBookings(response.data.pagination?.totalBookings || response.data.bookings.length);
      } else {
        console.error('Failed to fetch my bookings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching my bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    
    try {
      show('Confirming booking...');
      const response = await apiClient.patch(`/bookings/${bookingId}/confirm`);
      const data = response.data;
      if (data.success) {
        const successMsg = data.message || 'You have confirmed the booking request.';
        addNotification({
          title: 'Booking confirmed',
          message: successMsg,
          type: 'success',
        });
        alert(successMsg);
        hide();
        fetchReceivedBookings(currentPage);
      } else {
        const warnMsg = data.message || 'Unable to confirm booking.';
        addNotification({
          title: 'Confirmation failed',
          message: warnMsg,
          type: 'warning',
        });
        alert(warnMsg);
        hide();
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      const errorMsg = 'Something went wrong while confirming the booking.';
      addNotification({
        title: 'Confirmation error',
        message: errorMsg,
        type: 'warning',
      });
      alert(errorMsg);
      hide();
    }
  };

  const handleCancel = async (bookingId: string, isDriver: boolean) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;

    try {
      show('Cancelling booking...');
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, {
        cancelledBy: isDriver ? 'driver' : 'rider',
        cancellationReason: reason
      });
      const data = response.data;
      if (data.success) {
        const infoMsg = data.message || `The booking has been cancelled. Reason: ${reason}`;
        addNotification({
          title: 'Booking cancelled',
          message: infoMsg,
          type: 'info',
        });
        alert(infoMsg);
        hide();
        if (isDriver) {
          fetchReceivedBookings(currentPage);
        } else {
          fetchMyBookings(currentPage);
        }
      } else {
        const warnMsg = data.message || 'Unable to cancel booking.';
        addNotification({
          title: 'Cancellation failed',
          message: warnMsg,
          type: 'warning',
        });
        alert(warnMsg);
        hide();
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMsg = 'Something went wrong while cancelling the booking.';
      addNotification({
        title: 'Cancellation error',
        message: errorMsg,
        type: 'warning',
      });
      alert(errorMsg);
      hide();
    }
  };

  // const handleComplete = async (bookingId: string) => {
  //   try {
  //     show('Completing ride...');
  //     const response = await apiClient.patch(`/bookings/${bookingId}/complete`);
  //     const data = response.data;
  //     if (data.success) {
  //       const successMsg = data.message || 'The ride has been marked as completed.';
  //       addNotification({
  //         title: 'Ride completed',
  //         message: successMsg,
  //         type: 'success',
  //       });
  //       alert(successMsg);
  //       hide();
  //       fetchReceivedBookings(currentPage);
  //     } else {
  //       const warnMsg = data.message || 'Unable to complete booking.';
  //       addNotification({
  //         title: 'Completion failed',
  //         message: warnMsg,
  //         type: 'warning',
  //       });
  //       alert(warnMsg);
  //       hide();
  //     }
  //   } catch (error) {
  //     console.error('Error completing booking:', error);
  //     const errorMsg = 'Something went wrong while completing the booking.';
  //     addNotification({
  //       title: 'Completion error',
  //       message: errorMsg,
  //       type: 'warning',
  //     });
  //     alert(errorMsg);
  //     hide();
  //   }
  // };

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

  const openMapModal = (booking: Booking) => {
    // Navigate to Map with booking data
    navigate('/map', {
      state: {
        booking: booking,
        showMeetingPoint: true
      }
    });
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

        {isReceived && (
          <div className="location-section">
            <div className="location-header">
              <h4>📍 Pickup Location</h4>
              <button 
                className="btn-view-map"
                onClick={() => openMapModal(booking)}
                title="View pickup location on map"
              >
                View on Map
              </button>
            </div>
            <div className="location-info">
              <p className="location-name">{booking.pickupLocationName}</p>
              {booking.distanceToMeetingPoint && (
                <p className="distance-info">
                  📏 {(booking.distanceToMeetingPoint / 1000).toFixed(2)} km from route
                </p>
              )}
            </div>
          </div>
        )}

        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">Departure:</span>
            <span className="detail-value">{formatDate(booking.rideId.departureTime)}</span>
          </div>

          {isReceived ? (
            <>
              <div className="detail-row">
                <span className="detail-label">Rider:</span>
                <span className="detail-value">{booking.riderId.fullname}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:( pending )</span>
                <span className="detail-value">{booking.riderId.phone}</span>
              </div>
            </>
          ) : (
            <>
              <div className="detail-row">
                <span className="detail-label">Driver:</span>
                <span className="detail-value">{booking.driverId.fullname}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:( pending )</span>
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
                  <button className="btn-show-ride" onClick={() => navigate('/active-rides')}>
                    Show Ride
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
              {booking.status === 'pending' && (
                <button className="btn-cancel" onClick={() => handleCancel(booking._id, false)}>
                  Cancel Booking
                </button>
              )}
              {booking.status === 'confirmed' && (
                <>
                  <button className="btn-show-ride" onClick={() => navigate('/active-rides')}>
                    Show Ride
                  </button>
                  <button className="btn-cancel" onClick={() => handleCancel(booking._id, false)}>
                    Cancel Booking
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const currentBookings = viewMode === 'received' ? receivedBookings : myBookings;
  const totalBookings = viewMode === 'received' ? totalReceivedBookings : totalMyBookings;
  const totalPages = Math.ceil(totalBookings / bookingsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (viewMode === 'received') {
      fetchReceivedBookings(pageNumber);
    } else {
      fetchMyBookings(pageNumber);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (viewMode === 'received') {
        fetchReceivedBookings(newPage);
      } else {
        fetchMyBookings(newPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (viewMode === 'received') {
        fetchReceivedBookings(newPage);
      } else {
        fetchMyBookings(newPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
        <>
        <div className="bookings-grid">
          {currentBookings.map((booking) => renderBookingCard(booking, viewMode === 'received'))}
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
      )}
    </div>
    </>
  );
};

export default Bookings; 