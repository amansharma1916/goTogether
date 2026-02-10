import { createContext, useContext } from 'react';

export interface DriverLocation {
  bookingId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  etaMinutes: number | null;
  distanceKm: number | null;
  timestamp: string;
}

export interface TrackingSession {
  bookingId: string;
  driverId: string;
  driverName: string;
  isActive: boolean;
  currentLocation: DriverLocation | null;
  lastUpdate: string | null;
  error: string | null;
}

export interface LocationTrackingContextValue {
  // Active tracking sessions
  activeSessions: Map<string, TrackingSession>;
  
  // Current tracking (for single ride)
  currentTracking: TrackingSession | null;
  currentBookingId: string | null;
  
  // Current driver location (live updates)
  driverLocation: DriverLocation | null;
  
  // ETA and distance (derived from location)
  etaMinutes: number | null;
  distanceKm: number | null;
  
  // Connection state
  isConnected: boolean;
  isTracking: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions
  startTracking: (bookingId: string) => void;
  stopTracking: (bookingId: string) => void;
  joinTracking: (bookingId: string) => void;
  leaveTracking: (bookingId: string) => void;
  updateDriverLocation: (location: DriverLocation) => void;
  requestLocationUpdate: (bookingId: string) => void;
  clearError: () => void;
  
  // Status
  trackingStatus: 'idle' | 'starting' | 'active' | 'stopping' | 'error';
}

const LocationTrackingContext = createContext<LocationTrackingContextValue | undefined>(undefined);

export const useLocationTracking = () => {
  const context = useContext(LocationTrackingContext);
  if (!context) {
    throw new Error('useLocationTracking must be used within LocationTrackingProvider');
  }
  return context;
};

// Safe version that returns default values if not in provider
export const useLocationTrackingSafe = () => {
  const context = useContext(LocationTrackingContext);
  
  if (!context) {
    // Return default values when not in provider
    return {
      activeSessions: new Map(),
      currentTracking: null,
      currentBookingId: null,
      driverLocation: null,
      etaMinutes: null,
      distanceKm: null,
      isConnected: false,
      isTracking: false,
      error: null,
      startTracking: () => {},
      stopTracking: () => {},
      joinTracking: () => {},
      leaveTracking: () => {},
      updateDriverLocation: () => {},
      requestLocationUpdate: () => {},
      clearError: () => {},
      trackingStatus: 'idle' as const
    };
  }
  
  return context;
};

export default LocationTrackingContext;
