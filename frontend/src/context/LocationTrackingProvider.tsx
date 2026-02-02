import React, { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import LocationTrackingContext, {
  type DriverLocation,
  type LocationTrackingContextValue,
  type TrackingSession
} from './LocationTrackingContext';
import { createSocket } from '../services/socket';

interface LocationTrackingProviderProps {
  children: ReactNode;
}

export const LocationTrackingProvider: React.FC<LocationTrackingProviderProps> = ({
  children
}) => {
  const socketRef = useRef<any>(null);
  
  // State management
  const [activeSessions, setActiveSessions] = useState<Map<string, TrackingSession>>(
    new Map()
  );
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<
    'idle' | 'starting' | 'active' | 'stopping' | 'error'
  >('idle');

  // Socket initialization
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found');
      return;
    }

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Location tracking socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Location tracking socket disconnected');
    });

    // Listen for driver location sharing started
    socket.on('driver_location_sharing_started', (data) => {
      console.log('Driver started sharing location:', data);
      const { bookingId, driverId, driverName } = data;

      const newSession: TrackingSession = {
        bookingId,
        driverId,
        driverName,
        isActive: true,
        currentLocation: null,
        lastUpdate: new Date().toISOString(),
        error: null
      };

      setActiveSessions((prev) => new Map(prev).set(bookingId, newSession));
      
      // Set as current if not already tracking
      if (!currentBookingId) {
        setCurrentBookingId(bookingId);
      }

      setTrackingStatus('active');
      setError(null);
    });

    // Listen for driver location updates (main event)
    socket.on('driver_location_updated', (data) => {
      const {
        bookingId,
        driverId,
        latitude,
        longitude,
        accuracy,
        etaMinutes,
        distanceKm,
        timestamp
      } = data;

      // Create location object
      const location: DriverLocation = {
        bookingId,
        driverId,
        latitude,
        longitude,
        accuracy,
        etaMinutes,
        distanceKm,
        timestamp
      };

      // Update driver location
      setDriverLocation(location);

      // Update session if active
      setActiveSessions((prev) => {
        const updated = new Map(prev);
        const session = updated.get(bookingId);
        if (session) {
          updated.set(bookingId, {
            ...session,
            currentLocation: location,
            lastUpdate: new Date().toISOString()
          });
        }
        return updated;
      });
    });

    // Listen for driver location sharing stopped
    socket.on('driver_location_sharing_stopped', (data) => {
      console.log('Driver stopped sharing location:', data);
      const { bookingId, reason } = data;

      // Deactivate session
      setActiveSessions((prev) => {
        const updated = new Map(prev);
        const session = updated.get(bookingId);
        if (session) {
          updated.set(bookingId, {
            ...session,
            isActive: false
          });
        }
        return updated;
      });

      // Clear current tracking if it's this booking
      if (currentBookingId === bookingId) {
        setCurrentBookingId(null);
        // KEEP driverLocation for map to show last known location
        // setDriverLocation(null);
        
        if (reason === 'driver_disconnected') {
          setError('Driver connection lost. Tracking stopped.');
          setTrackingStatus('error');
        } else {
          setTrackingStatus('idle');
        }
      }
    });

    // Listen for location requested (driver receives this)
    socket.on('location_requested', (data) => {
      console.log('Rider requested location update:', data);
      // Driver side: can use this to send immediate location update
      // Emit 'driver_location_update' event if needed
    });

    // Listen for socket errors
    socket.on('error', (errorData) => {
      console.error('Location tracking error:', errorData);
      setError(errorData.message || 'An error occurred during tracking');
      setTrackingStatus('error');
    });

    return () => {
      // Cleanup listeners (don't disconnect socket as it's shared)
      socket.off('connect');
      socket.off('disconnect');
      socket.off('driver_location_sharing_started');
      socket.off('driver_location_updated');
      socket.off('driver_location_sharing_stopped');
      socket.off('location_requested');
      socket.off('error');
    };
  }, [currentBookingId]);

  /**
   * Start tracking a ride
   */
  const startTracking = useCallback(
    (bookingId: string) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        setTrackingStatus('starting');
        setError(null);
        
        // Emit driver_share_location for drivers, or just set up listener for riders
        socketRef.current.emit('driver_share_location', { bookingId });

        console.log('Tracking started for booking:', bookingId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to start tracking';
        setError(errorMsg);
        setTrackingStatus('error');
      }
    },
    []
  );

  /**
   * Stop tracking a ride
   */
  const stopTracking = useCallback(
    (bookingId: string) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        setTrackingStatus('stopping');

        // Emit driver_stop_sharing_location
        socketRef.current.emit('driver_stop_sharing_location', { bookingId });

        // Clear local state after a short delay
        setTimeout(() => {
          setActiveSessions((prev) => {
            const updated = new Map(prev);
            updated.delete(bookingId);
            return updated;
          });

          if (currentBookingId === bookingId) {
            setCurrentBookingId(null);
             // KEEP driverLocation for map to show last known location
             // setDriverLocation(null);
            setTrackingStatus('idle');
          }
        }, 500);

        console.log('Tracking stopped for booking:', bookingId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to stop tracking';
        setError(errorMsg);
        setTrackingStatus('error');
      }
    },
    [currentBookingId]
  );

  /**
   * Update driver location (driver side)
   */
  const updateDriverLocation = useCallback(
    (location: DriverLocation) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        socketRef.current.emit('driver_location_update', {
          bookingId: location.bookingId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString()
        });

        console.log('Location update sent:', location);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send location';
        console.error(errorMsg);
        setError(errorMsg);
      }
    },
    []
  );

  /**
   * Request location update from driver (rider side)
   */
  const requestLocationUpdate = useCallback(
    (bookingId: string) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        socketRef.current.emit('rider_request_location', { bookingId });
        console.log('Location update requested for booking:', bookingId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to request location';
        console.error(errorMsg);
        setError(errorMsg);
      }
    },
    []
  );

  /**
   * Rider joins tracking room to receive updates
   */
  const joinTracking = useCallback(
    (bookingId: string) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        socketRef.current.emit('rider_join_tracking', { bookingId });
        setCurrentBookingId(bookingId);
        console.log('Rider joined tracking room for booking:', bookingId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to join tracking room';
        console.error(errorMsg);
        setError(errorMsg);
      }
    },
    []
  );

  /**
   * Rider leaves tracking room
   */
  const leaveTracking = useCallback(
    (bookingId: string) => {
      if (!socketRef.current) {
        setError('Socket not connected');
        return;
      }

      try {
        socketRef.current.emit('rider_leave_tracking', { bookingId });
        if (currentBookingId === bookingId) {
          setCurrentBookingId(null);
        }
        console.log('Rider left tracking room for booking:', bookingId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to leave tracking room';
        console.error(errorMsg);
        setError(errorMsg);
      }
    },
    [currentBookingId]
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed values
  const currentTracking = currentBookingId ? activeSessions.get(currentBookingId) || null : null;
  const isTracking = trackingStatus === 'active';

  const contextValue: LocationTrackingContextValue = {
    // State
    activeSessions,
    currentTracking,
    currentBookingId,
    driverLocation,
    etaMinutes: driverLocation?.etaMinutes ?? null,
    distanceKm: driverLocation?.distanceKm ?? null,
    isConnected,
    isTracking,
    error,
    trackingStatus,

    // Actions
    startTracking,
    stopTracking,
    joinTracking,
    leaveTracking,
    updateDriverLocation,
    requestLocationUpdate,
    clearError
  };

  return (
    <LocationTrackingContext.Provider value={contextValue}>
      {children}
    </LocationTrackingContext.Provider>
  );
};

export default LocationTrackingProvider;
