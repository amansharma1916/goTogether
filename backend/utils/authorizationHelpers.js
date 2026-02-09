/**
 * Authorization Helper Utilities for Location Tracking
 * Centralized authorization logic for ride tracking socket events
 */

import { findBookingByIdOrCode } from "./bookingLookup.js";
import { isRideToday } from "./dateHelpers.js";

/**
 * Validate if user is the driver of a booking
 * @param {String} bookingId - The booking ID
 * @param {String} userId - The user ID to verify
 * @returns {Promise<Object>} - { isValid: Boolean, booking: Object, error: String }
 */
export const validateDriverAuthorization = async (bookingId, userId) => {
  try {
    const booking = await findBookingByIdOrCode(bookingId, ["rideId", "driverId"]);

    if (!booking) {
      return {
        isValid: false,
        booking: null,
        error: "Booking not found"
      };
    }

    if (booking.driverId._id.toString() !== userId) {
      return {
        isValid: false,
        booking,
        error: "Only driver can perform this action"
      };
    }

    return {
      isValid: true,
      booking,
      error: null
    };
  } catch (error) {
    console.error("Error validating driver authorization:", error);
    return {
      isValid: false,
      booking: null,
      error: "Authorization validation failed"
    };
  }
};

/**
 * Validate if user is the rider of a booking
 * @param {String} bookingId - The booking ID
 * @param {String} userId - The user ID to verify
 * @returns {Promise<Object>} - { isValid: Boolean, booking: Object, error: String }
 */
export const validateRiderAuthorization = async (bookingId, userId) => {
  try {
    const booking = await findBookingByIdOrCode(bookingId, ["rideId", "riderId"]);

    if (!booking) {
      return {
        isValid: false,
        booking: null,
        error: "Booking not found"
      };
    }

    if (booking.riderId._id.toString() !== userId) {
      return {
        isValid: false,
        booking,
        error: "Only rider can perform this action"
      };
    }

    return {
      isValid: true,
      booking,
      error: null
    };
  } catch (error) {
    console.error("Error validating rider authorization:", error);
    return {
      isValid: false,
      booking: null,
      error: "Authorization validation failed"
    };
  }
};

/**
 * Validate if booking is in confirmed status
 * @param {Object} booking - The booking object
 * @returns {Object} - { isValid: Boolean, error: String }
 */
export const validateBookingConfirmed = (booking) => {
  if (!booking) {
    return {
      isValid: false,
      error: "Booking not provided"
    };
  }

  if (booking.status !== "confirmed") {
    return {
      isValid: false,
      error: `Booking must be confirmed to perform this action. Current status: ${booking.status}`
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate if ride is scheduled for today
 * @param {Object} booking - The booking object
 * @returns {Object} - { isValid: Boolean, error: String }
 */
export const validateRideIsToday = (booking) => {
  if (!booking || !booking.rideId) {
    return {
      isValid: false,
      error: "Booking or ride information not available"
    };
  }

  if (!isRideToday(booking.rideId.departureTime)) {
    return {
      isValid: false,
      error: "Location tracking is only available on the day of the ride"
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Comprehensive driver location tracking authorization check
 * Validates: driver authorization, booking confirmed, ride is today
 * @param {String} bookingId - The booking ID
 * @param {String} driverId - The driver user ID
 * @returns {Promise<Object>} - { isAuthorized: Boolean, booking: Object, error: String }
 */
export const validateDriverLocationTracking = async (bookingId, driverId) => {
  try {
    // Step 1: Verify driver authorization
    const driverAuth = await validateDriverAuthorization(bookingId, driverId);
    if (!driverAuth.isValid) {
      return {
        isAuthorized: false,
        booking: null,
        error: driverAuth.error
      };
    }

    const booking = driverAuth.booking;

    // Step 2: Verify booking is confirmed
    const confirmedCheck = validateBookingConfirmed(booking);
    if (!confirmedCheck.isValid) {
      return {
        isAuthorized: false,
        booking,
        error: confirmedCheck.error
      };
    }

    // Step 3: Verify ride is today
    const todayCheck = validateRideIsToday(booking);
    if (!todayCheck.isValid) {
      return {
        isAuthorized: false,
        booking,
        error: todayCheck.error
      };
    }

    return {
      isAuthorized: true,
      booking,
      error: null
    };
  } catch (error) {
    console.error("Error validating driver location tracking:", error);
    return {
      isAuthorized: false,
      booking: null,
      error: "Authorization check failed"
    };
  }
};

/**
 * Comprehensive rider location tracking authorization check
 * Validates: rider authorization, booking exists
 * @param {String} bookingId - The booking ID
 * @param {String} riderId - The rider user ID
 * @returns {Promise<Object>} - { isAuthorized: Boolean, booking: Object, error: String }
 */
export const validateRiderLocationTracking = async (bookingId, riderId) => {
  try {
    // Verify rider authorization
    const riderAuth = await validateRiderAuthorization(bookingId, riderId);
    if (!riderAuth.isValid) {
      return {
        isAuthorized: false,
        booking: null,
        error: riderAuth.error
      };
    }

    return {
      isAuthorized: true,
      booking: riderAuth.booking,
      error: null
    };
  } catch (error) {
    console.error("Error validating rider location tracking:", error);
    return {
      isAuthorized: false,
      booking: null,
      error: "Authorization check failed"
    };
  }
};

export default {
  validateDriverAuthorization,
  validateRiderAuthorization,
  validateBookingConfirmed,
  validateRideIsToday,
  validateDriverLocationTracking,
  validateRiderLocationTracking
};
