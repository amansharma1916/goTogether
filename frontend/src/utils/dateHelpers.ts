/**
 * Frontend Date Helper Utilities for Ride Scheduling
 * Used for comparing ride dates with current date and filtering
 */

/**
 * Check if a ride is scheduled for today
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {boolean} - True if ride is scheduled for today
 */
export const isRideToday = (departureTime: Date | string): boolean => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();

    return (
      rideDate.getUTCFullYear() === today.getUTCFullYear() &&
      rideDate.getUTCMonth() === today.getUTCMonth() &&
      rideDate.getUTCDate() === today.getUTCDate()
    );
  } catch (error) {
    console.error('Error in isRideToday:', error);
    return false;
  }
};

/**
 * Check if a ride is scheduled for the future
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {boolean} - True if ride is in the future
 */
export const isRideFuture = (departureTime: Date | string): boolean => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rideDate >= today;
  } catch (error) {
    console.error('Error in isRideFuture:', error);
    return false;
  }
};

/**
 * Check if a ride is in the past
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {boolean} - True if ride is in the past
 */
export const isRidePast = (departureTime: Date | string): boolean => {
  try {
    const rideDate = new Date(departureTime);
    const now = new Date();

    return rideDate < now;
  } catch (error) {
    console.error('Error in isRidePast:', error);
    return false;
  }
};

/**
 * Get the number of days until a ride
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {number | null} - Number of days until the ride (0 = today, negative = past)
 */
export const getDaysUntilRide = (departureTime: Date | string): number | null => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    rideDate.setHours(0, 0, 0, 0);

    const timeDiff = rideDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  } catch (error) {
    console.error('Error in getDaysUntilRide:', error);
    return null;
  }
};

/**
 * Check if a ride is within the next N days
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {number} days - Number of days to check within (default: 7)
 * @returns {boolean} - True if ride is within next N days
 */
export const isRideWithinDays = (
  departureTime: Date | string,
  days: number = 7
): boolean => {
  try {
    const rideDate = new Date(departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    return rideDate >= today && rideDate <= futureDate;
  } catch (error) {
    console.error('Error in isRideWithinDays:', error);
    return false;
  }
};

/**
 * Format ride date for display
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {string} format - Format type: 'date', 'time', 'datetime', 'relative'
 * @returns {string} - Formatted date string
 */
export const formatRideDate = (
  departureTime: Date | string,
  format: 'date' | 'time' | 'datetime' | 'relative' = 'datetime'
): string => {
  try {
    const rideDate = new Date(departureTime);

    if (isNaN(rideDate.getTime())) {
      return 'Invalid date';
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    switch (format) {
      case 'date':
        return rideDate.toLocaleDateString('en-US', dateOptions);
      case 'time':
        return rideDate.toLocaleTimeString('en-US', timeOptions);
      case 'datetime':
        return rideDate.toLocaleDateString('en-US', { ...dateOptions, ...timeOptions });
      case 'relative': {
        if (isRideToday(rideDate)) {
          return `Today at ${rideDate.toLocaleTimeString('en-US', timeOptions)}`;
        } else if (isRideFuture(rideDate)) {
          const daysUntil = getDaysUntilRide(rideDate);
          if (daysUntil === 1) {
            return `Tomorrow at ${rideDate.toLocaleTimeString('en-US', timeOptions)}`;
          }
          return `${daysUntil} days away`;
        } else {
          const daysPassed = Math.abs(getDaysUntilRide(rideDate) || 0);
          return `${daysPassed} days ago`;
        }
      }
      default:
        return rideDate.toString();
    }
  } catch (error) {
    console.error('Error in formatRideDate:', error);
    return 'Invalid date';
  }
};

/**
 * Check if ride time has passed (departure time + buffer)
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @param {number} bufferMinutes - Minutes to add as buffer (default: 0)
 * @returns {boolean} - True if current time is past departure + buffer
 */
export const hasRideTimePassed = (
  departureTime: Date | string,
  bufferMinutes: number = 0
): boolean => {
  try {
    const rideDate = new Date(departureTime);
    const bufferDate = new Date(rideDate.getTime() + bufferMinutes * 60000);
    const now = new Date();

    return now > bufferDate;
  } catch (error) {
    console.error('Error in hasRideTimePassed:', error);
    return false;
  }
};

/**
 * Format time until ride departure (e.g., "2 hours 30 minutes")
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {string} - Formatted time string
 */
export const formatTimeUntilDeparture = (departureTime: Date | string): string => {
  try {
    const rideDate = new Date(departureTime);
    const now = new Date();
    const diffMs = rideDate.getTime() - now.getTime();

    if (diffMs < 0) {
      return 'Ride departed';
    }

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error in formatTimeUntilDeparture:', error);
    return 'Invalid time';
  }
};

/**
 * Get user-friendly ride schedule text
 * @param {Date|String} departureTime - The ride's scheduled departure time
 * @returns {string} - User-friendly schedule text
 */
export const getRideScheduleText = (departureTime: Date | string): string => {
  try {
    if (isRideToday(departureTime)) {
      const timeStr = formatRideDate(departureTime, 'time');
      const timeUntil = formatTimeUntilDeparture(departureTime);
      return `Today at ${timeStr} (${timeUntil})`;
    }

    if (isRideFuture(departureTime)) {
      const relativeDate = formatRideDate(departureTime, 'relative');
      return relativeDate;
    }

    return formatRideDate(departureTime, 'relative');
  } catch (error) {
    console.error('Error in getRideScheduleText:', error);
    return 'Invalid date';
  }
};

export default {
  isRideToday,
  isRideFuture,
  isRidePast,
  getDaysUntilRide,
  isRideWithinDays,
  formatRideDate,
  hasRideTimePassed,
  formatTimeUntilDeparture,
  getRideScheduleText
};
