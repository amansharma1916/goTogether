
import React, { useEffect, useState } from 'react';
import useDriverLocation from '../../../hooks/useDriverLocation';
import { useLocationTracking } from '../../../context/LocationTrackingContext';
import '../../../Styles/User/Assets/DriverLocationTracker.css';

interface DriverLocationTrackerProps {
  bookingId: string;
  onTrackingStart?: () => void;
  onTrackingStop?: () => void;
}

export const DriverLocationTracker: React.FC<DriverLocationTrackerProps> = ({
  bookingId,
  onTrackingStart,
  onTrackingStop
}) => {
  const { startTracking: startSocketTracking, stopTracking: stopSocketTracking } = useLocationTracking();
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);

  const {
    position,
    error: geoError,
    permissionStatus,
    isTracking,
    startTracking: startGeoTracking,
    stopTracking: stopGeoTracking,
    requestPermission
  } = useDriverLocation({
    bookingId,
    enabled: isSharingEnabled,
    updateInterval: 5000, // Update every 5 seconds
    highAccuracy: true
  });

  // Handle start sharing
  const handleStartSharing = async () => {
    try {
      // Request permission if needed
      if (permissionStatus === 'prompt' || permissionStatus === null) {
        await requestPermission();
      }

      if (permissionStatus === 'denied') {
        return;
      }

      // Start socket tracking (joins room, notifies rider)
      startSocketTracking(bookingId);

      // Enable geolocation tracking
      setIsSharingEnabled(true);
      startGeoTracking();

      if (onTrackingStart) {
        onTrackingStart();
      }
    } catch (err) {
      console.error('Failed to start location sharing:', err);
    }
  };

  // Handle stop sharing
  const handleStopSharing = () => {
    // Stop geolocation tracking
    setIsSharingEnabled(false);
    stopGeoTracking();

    // Stop socket tracking (leaves room, notifies rider)
    stopSocketTracking(bookingId);

    if (onTrackingStop) {
      onTrackingStop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        handleStopSharing();
      }
    };
  }, []);

  return (
    <div className="driver-location-tracker">
      {/* Permission Status Banner */}
      {permissionStatus === 'unsupported' && (
        <div className="permission-banner error">
          <span className="banner-icon">⚠️</span>
          <span className="banner-text">
            Your browser doesn't support location tracking
          </span>
        </div>
      )}

      {permissionStatus === 'denied' && (
        <div className="permission-banner error">
          <span className="banner-icon">🚫</span>
          <div className="banner-content">
            <span className="banner-text">Location access denied</span>
            <span className="banner-subtext">
              Please enable location permissions in your browser settings
            </span>
          </div>
        </div>
      )}

      {/* Tracking Controls */}
      {permissionStatus !== 'unsupported' && (
        <div className="tracking-controls">
          {!isTracking ? (
            <button
              className="tracking-btn start-btn"
              onClick={handleStartSharing}
              disabled={permissionStatus === 'denied'}
            >
              <span className="btn-icon">📍</span>
              <span className="btn-text">Start Sharing Location</span>
            </button>
          ) : (
            <button
              className="tracking-btn stop-btn"
              onClick={handleStopSharing}
            >
              <span className="btn-icon">⏸️</span>
              <span className="btn-text">Stop Sharing Location</span>
            </button>
          )}
        </div>
      )}

      {/* Tracking Status */}
      {isTracking && position && (
        <div className="tracking-status active">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span className="status-text">Location Sharing Active</span>
          </div>
          <div className="location-details">
            <div className="detail-item">
              <span className="detail-label">Accuracy:</span>
              <span className="detail-value">{position.accuracy.toFixed(0)}m</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Update:</span>
              <span className="detail-value">
                {new Date(position.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {geoError && (
        <div className="tracking-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{geoError}</span>
        </div>
      )}

      {/* Permission Prompt */}
      {permissionStatus === 'prompt' && !isTracking && (
        <div className="permission-info">
          <p className="info-text">
            Your browser will ask for location permission when you start sharing
          </p>
        </div>
      )}
    </div>
  );
};

export default DriverLocationTracker;
