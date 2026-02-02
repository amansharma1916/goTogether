/**
 * Date Helper Utilities for Ride Scheduling
 * Used for comparing ride dates with current date
 */

/**
 * Check if a ride is scheduled for today (UTC comparison)
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {Boolean} - True if ride is scheduled for today, false otherwise
 */
export const isRideToday = (departureTime) => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();

    return (
      rideDate.getUTCFullYear() === today.getUTCFullYear() &&
      rideDate.getUTCMonth() === today.getUTCMonth() &&
      rideDate.getUTCDate() === today.getUTCDate()
    );
  } catch (error) {
    console.error("Error in isRideToday:", error);
    return false;
  }
};

/**
 * Check if a ride is scheduled for the future
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {Boolean} - True if ride is in the future, false otherwise
 */
export const isRideFuture = (departureTime) => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    return rideDate >= today;
  } catch (error) {
    console.error("Error in isRideFuture:", error);
    return false;
  }
};

/**
 * Check if a ride is in the past
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {Boolean} - True if ride is in the past, false otherwise
 */
export const isRidePast = (departureTime) => {
  try {
    const rideDate = new Date(departureTime);
    const now = new Date();

    return rideDate < now;
  } catch (error) {
    console.error("Error in isRidePast:", error);
    return false;
  }
};

/**
 * Get the number of days until a ride
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {Number} - Number of days until the ride (0 = today, negative = past)
 */
export const getDaysUntilRide = (departureTime) => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    rideDate.setHours(0, 0, 0, 0);

    const timeDiff = rideDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  } catch (error) {
    console.error("Error in getDaysUntilRide:", error);
    return null;
  }
};

/**
 * Check if a ride is within the next N days
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {Number} days - Number of days to check within
 * @returns {Boolean} - True if ride is within next N days
 */
export const isRideWithinDays = (departureTime, days = 7) => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return rideDate >= today && rideDate <= futureDate;
  } catch (error) {
    console.error("Error in isRideWithinDays:", error);
    return false;
  }
};

/**
 * Format ride date for display
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {String} format - Format type: 'date', 'time', 'datetime', 'relative'
 * @returns {String} - Formatted date string
 */
export const formatRideDate = (departureTime, format = "datetime") => {
  try {
    const rideDate = new Date(departureTime);

    if (isNaN(rideDate.getTime())) {
      return "Invalid date";
    }

    const dateOptions = { month: "short", day: "numeric", year: "numeric" };
    const timeOptions = { hour: "2-digit", minute: "2-digit" };

    switch (format) {
      case "date":
        return rideDate.toLocaleDateString("en-US", dateOptions);
      case "time":
        return rideDate.toLocaleTimeString("en-US", timeOptions);
      case "datetime":
        return rideDate.toLocaleDateString("en-US", {
          ...dateOptions,
          ...timeOptions
        });
      case "relative":
        if (isRideToday(rideDate)) {
          return `Today at ${rideDate.toLocaleTimeString("en-US", timeOptions)}`;
        } else if (isRideFuture(rideDate)) {
          const daysUntil = getDaysUntilRide(rideDate);
          if (daysUntil === 1) {
            return `Tomorrow at ${rideDate.toLocaleTimeString("en-US", timeOptions)}`;
          }
          return `${daysUntil} days away`;
        } else {
          return `${Math.abs(getDaysUntilRide(rideDate))} days ago`;
        }
      default:
        return rideDate.toString();
    }
  } catch (error) {
    console.error("Error in formatRideDate:", error);
    return "Invalid date";
  }
};

/**
 * Check if ride time has passed (departure time + buffer)
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {Number} bufferMinutes - Minutes to add as buffer (default: 0)
 * @returns {Boolean} - True if current time is past departure + buffer
 */
export const hasRideTimePassed = (departureTime, bufferMinutes = 0) => {
  try {
    const rideDate = new Date(departureTime);
    const bufferDate = new Date(rideDate.getTime() + bufferMinutes * 60000);
    const now = new Date();

    return now > bufferDate;
  } catch (error) {
    console.error("Error in hasRideTimePassed:", error);
    return false;
  }
};

export default {
  isRideToday,
  isRideFuture,
  isRidePast,
  getDaysUntilRide,
  isRideWithinDays,
  formatRideDate,
  hasRideTimePassed
};
