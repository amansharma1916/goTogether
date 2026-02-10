/**
 * Hook for managing driver's geolocation tracking
 * Handles browser geolocation API, permissions, and periodic updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocationTracking } from '../context/LocationTrackingContext';

interface DriverPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface UseDriverLocationOptions {
  bookingId: string;
  enabled: boolean;
  updateInterval?: number; // milliseconds (default: 5000 = 5 seconds)
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseDriverLocationReturn {
  position: DriverPosition | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unsupported' | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<void>;
}

export const useDriverLocation = ({
  bookingId,
  enabled,
  updateInterval = 5000,
  highAccuracy = true,
  timeout = 10000,
  maximumAge = 0
}: UseDriverLocationOptions): UseDriverLocationReturn => {
  const [position, setPosition] = useState<DriverPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'granted' | 'denied' | 'prompt' | 'unsupported' | null
  >(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isStartedRef = useRef(false); // Track if already started to avoid duplicate starts
  const { updateDriverLocation } = useLocationTracking();

  // Check if geolocation is supported
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionStatus('unsupported');
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!navigator.permissions) {
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');

      result.addEventListener('change', () => {
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      });
    } catch (err) {
      console.error('Error checking permission:', err);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (permissionStatus === 'unsupported') {
      throw new Error('Geolocation is not supported');
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionStatus('granted');
          setError(null);
          resolve();
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setPermissionStatus('denied');
            setError('Location permission denied. Please enable it in browser settings.');
          } else {
            setError(err.message);
          }
          reject(err);
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge
        }
      );
    });
  }, [permissionStatus, highAccuracy, timeout, maximumAge]);

  // Handle geolocation success
  const handleSuccess = useCallback(
    (geoPosition: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = geoPosition.coords;

      const newPosition: DriverPosition = {
        latitude,
        longitude,
        accuracy,
        timestamp: Date.now()
      };

      setPosition(newPosition);
      setError(null);

      // Send location update to server via socket
      updateDriverLocation({
        bookingId,
        driverId: '', // Will be filled by context from socket userId
        latitude,
        longitude,
        accuracy,
        etaMinutes: null,
        distanceKm: null,
        timestamp: new Date().toISOString()
      });

      console.log('Location updated:', {
        latitude,
        longitude,
        accuracy: `${accuracy.toFixed(0)}m`
      });
    },
    [bookingId, updateDriverLocation]
  );

  // Handle geolocation error
  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable. Please check your device settings.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Location request timed out. Trying again...';
        break;
      default:
        errorMessage = err.message || 'Unknown location error';
    }

    setError(errorMessage);
    console.error('Geolocation error:', errorMessage);
  }, []);

  // Start tracking
  const startTracking = useCallback(() => {
    // Avoid starting multiple times
    if (isStartedRef.current) {
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (permissionStatus === 'denied') {
      setError('Location permission denied. Please enable it in browser settings.');
      return;
    }

    isStartedRef.current = true;
    setIsTracking(true);
    setError(null);

    // Use watchPosition for continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge
      }
    );

    watchIdRef.current = watchId;

    // Also set up interval for periodic updates (as backup)
    intervalIdRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        {
          enableHighAccuracy: highAccuracy,
          timeout,
          maximumAge
        }
      );
    }, updateInterval);

    console.log('Location tracking started');
  }, [permissionStatus, highAccuracy, timeout, maximumAge, updateInterval, handleSuccess, handleError]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    // Avoid stopping if not started
    if (!isStartedRef.current) {
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    isStartedRef.current = false;

    setIsTracking(false);
    console.log('Location tracking stopped');
  }, []);

  // Auto start/stop based on enabled prop (without isTracking in deps to avoid infinite loop)
  useEffect(() => {
    if (enabled && permissionStatus === 'granted') {
      startTracking();
    } else if (!enabled && isStartedRef.current) {
      stopTracking();
    }
    // Only depend on enabled and permissionStatus, not isTracking
    // Cleanup: stop tracking when component unmounts or enabled becomes false
    return () => {
      if (isStartedRef.current) {
        stopTracking();
      }
    };
  }, [enabled, permissionStatus, startTracking, stopTracking]);

  return {
    position,
    error,
    permissionStatus,
    isTracking,
    startTracking,
    stopTracking,
    requestPermission
  };
};

export default useDriverLocation;
