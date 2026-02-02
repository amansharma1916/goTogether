/**
 * Rider Tracking Page
 * Full-screen map view for riders to track driver's real-time location
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapComponent from './Assets/MapComponent';
import { useLocationTracking } from '../../context/LocationTrackingContext';
import apiClient from '../../services/api';
import { formatRideDate, formatTimeUntilDeparture } from '../../utils/dateHelpers';
import '../../Styles/User/RiderTrackingPage.css';

interface RideDetails {
  _id: string;
  rideId: {
    origin: { name: string; coordinates: [number, number] };
    destination: { name: string; coordinates: [number, number] };
    departureTime: string;
  };
  driverId: {
    fullname: string;
  };
  pickupLocationName: string;
}

const RiderTrackingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    driverLocation,
    etaMinutes,
    distanceKm,
    isTracking,
    error: trackingError,
    requestLocationUpdate,
    joinTracking,
    leaveTracking
  } = useLocationTracking();

  // Fetch ride details
  useEffect(() => {
    const fetchRideDetails = async () => {
      if (!bookingId) {
        setError('Invalid booking ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get(`/bookings/${bookingId}`);
        
        if (response.data.success && response.data.booking) {
          setRideDetails(response.data.booking);
        } else {
          setError('Ride not found');
        }
      } catch (err: any) {
        console.error('Error fetching ride details:', err);
        setError(err.response?.data?.message || 'Failed to load ride details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideDetails();
  }, [bookingId]);

  // Request location update on mount
  useEffect(() => {
    if (bookingId) {
      joinTracking(bookingId);
      requestLocationUpdate(bookingId);
    }

    return () => {
      if (bookingId) {
        leaveTracking(bookingId);
      }
    };
  }, [bookingId, joinTracking, leaveTracking, requestLocationUpdate]);

  // Auto-refresh location every 30 seconds
  useEffect(() => {
    if (!bookingId || !isTracking) return;

    const interval = setInterval(() => {
      requestLocationUpdate(bookingId);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [bookingId, isTracking, requestLocationUpdate]);

  const handleBackClick = () => {
    navigate('/active-rides');
  };

  const handleRequestUpdate = () => {
    if (bookingId) {
      requestLocationUpdate(bookingId);
    }
  };

  if (isLoading) {
    return (
      <div className="tracking-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !rideDetails) {
    return (
      <div className="tracking-page error">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <h2>Unable to Load Tracking</h2>
          <p>{error || 'Ride details not available'}</p>
          <button className="back-btn" onClick={handleBackClick}>
            ← Back to Active Rides
          </button>
        </div>
      </div>
    );
  }

  const { rideId, driverId, pickupLocationName } = rideDetails;
  
  // Prepare pickup and destination in LocationData format
  const pickupLocation = rideId.origin.coordinates ? {
    lat: rideId.origin.coordinates[1],
    lng: rideId.origin.coordinates[0],
    name: pickupLocationName || rideId.origin.name
  } : null;

  const destinationLocation = rideId.destination.coordinates ? {
    lat: rideId.destination.coordinates[1],
    lng: rideId.destination.coordinates[0],
    name: rideId.destination.name
  } : null;

  return (
    <div className="tracking-page">
      {/* Header */}
      <div className="tracking-header">
        <button className="back-button" onClick={handleBackClick}>
          <span className="back-icon">←</span>
          <span>Back</span>
        </button>
        <h1 className="tracking-title">Live Tracking</h1>
        <button className="refresh-button" onClick={handleRequestUpdate}>
          <span className="refresh-icon">🔄</span>
        </button>
      </div>

      {/* Ride Info Bar */}
      <div className="ride-info-bar">
        <div className="info-row">
          <span className="info-label">Driver:</span>
          <span className="info-value">{driverId.fullname}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Departure:</span>
          <span className="info-value">
            {formatRideDate(rideId.departureTime, 'time')} 
            <span className="time-remaining">
              ({formatTimeUntilDeparture(rideId.departureTime)})
            </span>
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Pickup:</span>
          <span className="info-value">{pickupLocationName || rideId.origin.name}</span>
        </div>
      </div>

      {/* Tracking Status */}
      {isTracking && driverLocation && etaMinutes !== null && (
        <div className="tracking-status-bar active">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span className="status-text">Driver is sharing location</span>
          </div>
          <div className="eta-info">
            <div className="eta-item">
              <span className="eta-label">ETA</span>
              <span className="eta-value">{etaMinutes} min</span>
            </div>
            <div className="eta-item">
              <span className="eta-label">Distance</span>
              <span className="eta-value">{distanceKm?.toFixed(1)} km</span>
            </div>
          </div>
        </div>
      )}

      {!isTracking && !trackingError && (
         <>
           {driverLocation ? (
             <div className="tracking-status-bar inactive">
               <div className="status-indicator">
                 <span className="pulse-dot"></span>
                 <span className="status-text">Showing last known location</span>
               </div>
               {etaMinutes !== null && distanceKm !== null && (
                 <div className="eta-info">
                   <div className="eta-item">
                     <span className="eta-label">Last ETA</span>
                     <span className="eta-value">{etaMinutes} min</span>
                   </div>
                   <div className="eta-item">
                     <span className="eta-label">Last Distance</span>
                     <span className="eta-value">{distanceKm?.toFixed(1)} km</span>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="tracking-status-bar inactive">
               <span className="status-icon">⏸️</span>
               <span className="status-text">Driver hasn't started sharing location yet</span>
             </div>
           )}
         </>
      )}

      {trackingError && (
        <div className="tracking-status-bar error">
          <span className="status-icon">⚠️</span>
          <span className="status-text">{trackingError}</span>
        </div>
      )}

      {/* Map */}
      <div className="tracking-map-container">
        <MapComponent
          pickupLocation={pickupLocation}
          destinationLocation={destinationLocation}
          showDriverTracking={true}
          bookingId={bookingId}
        />
      </div>

      {/* Help Text */}
      <div className="tracking-help">
        <p className="help-text">
          💡 The map updates automatically when the driver shares their location
        </p>
      </div>
    </div>
  );
};

export default RiderTrackingPage;
