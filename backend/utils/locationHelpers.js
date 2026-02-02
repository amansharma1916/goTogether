/**
 * Location Helper Utilities for Real-Time Tracking
 * Handles coordinate validation, distance calculations, and ETA estimation
 */

/**
 * Validate if coordinates are valid
 * @param {Number} latitude - Latitude coordinate (-90 to 90)
 * @param {Number} longitude - Longitude coordinate (-180 to 180)
 * @returns {Object} - { isValid: Boolean, error: String }
 */
export const validateCoordinates = (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return {
      isValid: false,
      error: "Latitude and longitude must be numbers"
    };
  }

  if (latitude < -90 || latitude > 90) {
    return {
      isValid: false,
      error: "Latitude must be between -90 and 90"
    };
  }

  if (longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: "Longitude must be between -180 and 180"
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Calculate distance between two coordinates using Haversine formula (in kilometers)
 * @param {Number} lat1 - Latitude of point 1
 * @param {Number} lon1 - Longitude of point 1
 * @param {Number} lat2 - Latitude of point 2
 * @param {Number} lon2 - Longitude of point 2
 * @returns {Number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  try {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 1000) / 1000; // Round to 3 decimal places
  } catch (error) {
    console.error("Error calculating distance:", error);
    return null;
  }
};

/**
 * Estimate ETA based on current driver location and destination
 * Uses average speed calculation and remaining distance
 * @param {Number} currentLat - Driver's current latitude
 * @param {Number} currentLon - Driver's current longitude
 * @param {Array} destinationCoords - Destination [longitude, latitude] (GeoJSON format)
 * @param {Number} distanceToDestination - Total distance to destination in km (optional, for more accuracy)
 * @returns {Object} - { etaMinutes: Number, distanceKm: Number, error: String }
 */
export const estimateETA = (
  currentLat,
  currentLon,
  destinationCoords,
  distanceToDestination = null
) => {
  try {
    if (!destinationCoords || destinationCoords.length < 2) {
      return {
        etaMinutes: null,
        distanceKm: null,
        error: "Invalid destination coordinates"
      };
    }

    const destLon = destinationCoords[0];
    const destLat = destinationCoords[1];

    // Calculate distance if not provided
    let remainingDistance = distanceToDestination;
    if (!remainingDistance) {
      remainingDistance = calculateDistance(
        currentLat,
        currentLon,
        destLat,
        destLon
      );
    }

    if (remainingDistance === null) {
      return {
        etaMinutes: null,
        distanceKm: null,
        error: "Could not calculate distance"
      };
    }

    // Average urban driving speed: 30 km/h in city, 60 km/h on highways
    // Using conservative estimate of 40 km/h for mix
    const averageSpeed = 40; // km/h
    const etaMinutes = Math.round((remainingDistance / averageSpeed) * 60);

    return {
      etaMinutes: Math.max(etaMinutes, 1), // Minimum 1 minute
      distanceKm: remainingDistance,
      error: null
    };
  } catch (error) {
    console.error("Error estimating ETA:", error);
    return {
      etaMinutes: null,
      distanceKm: null,
      error: "Error calculating ETA"
    };
  }
};

/**
 * Estimate ETA using route distance (more accurate)
 * @param {Number} currentDistanceAlongRoute - Distance already traveled along route in km
 * @param {Number} totalRouteDistance - Total route distance in km
 * @returns {Object} - { etaMinutes: Number, distanceKm: Number }
 */
export const estimateETAFromRoute = (
  currentDistanceAlongRoute,
  totalRouteDistance
) => {
  try {
    if (
      !totalRouteDistance ||
      currentDistanceAlongRoute < 0 ||
      currentDistanceAlongRoute > totalRouteDistance
    ) {
      return {
        etaMinutes: null,
        distanceKm: null,
        error: "Invalid route distances"
      };
    }

    const remainingDistance = totalRouteDistance - currentDistanceAlongRoute;
    const averageSpeed = 40; // km/h
    const etaMinutes = Math.round((remainingDistance / averageSpeed) * 60);

    return {
      etaMinutes: Math.max(etaMinutes, 1),
      distanceKm: remainingDistance,
      error: null
    };
  } catch (error) {
    console.error("Error estimating ETA from route:", error);
    return {
      etaMinutes: null,
      distanceKm: null,
      error: "Error calculating ETA"
    };
  }
};

/**
 * Check if coordinates have moved significantly
 * Useful for throttling location updates or detecting if driver stopped
 * @param {Number} lat1 - Previous latitude
 * @param {Number} lon1 - Previous longitude
 * @param {Number} lat2 - Current latitude
 * @param {Number} lon2 - Current longitude
 * @param {Number} thresholdMeters - Minimum distance change in meters (default: 50)
 * @returns {Boolean} - True if moved more than threshold
 */
export const hasSignificantLocationChange = (
  lat1,
  lon1,
  lat2,
  lon2,
  thresholdMeters = 50
) => {
  try {
    const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
    if (distanceKm === null) return false;

    const distanceMeters = distanceKm * 1000;
    return distanceMeters >= thresholdMeters;
  } catch (error) {
    console.error("Error checking location change:", error);
    return false;
  }
};

/**
 * Format ETA for display
 * @param {Number} etaMinutes - ETA in minutes
 * @returns {String} - Formatted ETA string
 */
export const formatETA = (etaMinutes) => {
  if (etaMinutes === null || etaMinutes === undefined) {
    return "Calculating...";
  }

  if (etaMinutes < 1) {
    return "Arriving";
  }

  if (etaMinutes === 1) {
    return "1 minute away";
  }

  if (etaMinutes < 60) {
    return `${etaMinutes} minutes away`;
  }

  const hours = Math.floor(etaMinutes / 60);
  const minutes = etaMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} away`;
  }

  return `${hours}h ${minutes}m away`;
};

/**
 * Extract coordinates from GeoJSON Point
 * @param {Object} geoJsonPoint - GeoJSON Point object { type: 'Point', coordinates: [lng, lat] }
 * @returns {Object} - { latitude: Number, longitude: Number, error: String }
 */
export const extractCoordinatesFromGeoJSON = (geoJsonPoint) => {
  try {
    if (
      !geoJsonPoint ||
      geoJsonPoint.type !== "Point" ||
      !geoJsonPoint.coordinates ||
      geoJsonPoint.coordinates.length < 2
    ) {
      return {
        latitude: null,
        longitude: null,
        error: "Invalid GeoJSON point format"
      };
    }

    const [longitude, latitude] = geoJsonPoint.coordinates;

    return {
      latitude,
      longitude,
      error: null
    };
  } catch (error) {
    console.error("Error extracting GeoJSON coordinates:", error);
    return {
      latitude: null,
      longitude: null,
      error: "Error parsing GeoJSON"
    };
  }
};

export default {
  validateCoordinates,
  calculateDistance,
  estimateETA,
  estimateETAFromRoute,
  hasSignificantLocationChange,
  formatETA,
  extractCoordinatesFromGeoJSON
};
