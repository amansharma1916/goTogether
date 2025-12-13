import BookedRide from '../DB/Schema/BookedRideSchema.js';
import Ride from '../DB/Schema/PostedRidesSchema.js';

/**
 * POST /api/bookings
 * Create a new ride booking
 */
export const createBooking = async (req, res) => {
  try {
    const {
      rideId,
      riderId,
      seatsBooked = 1,
      pickupLocation,
      pickupLocationName,
      meetingPoint,
      distanceToMeetingPoint,
      riderNotes,
      paymentMethod = 'cash'
    } = req.body;

    // Validate required fields
    if (!rideId || !riderId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID and Rider ID are required"
      });
    }

    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng) {
      return res.status(400).json({
        success: false,
        message: "Valid pickup location is required"
      });
    }

    // Fetch the ride details
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    // Check if ride is active
    if (ride.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "This ride is no longer available for booking"
      });
    }

    // Check if user is trying to book their own ride
    if (ride.userId.toString() === riderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own ride"
      });
    }

    // Check if enough seats are available
    const existingBookings = await BookedRide.find({
      rideId: rideId,
      status: { $in: ['pending', 'confirmed'] }
    });

    const totalBookedSeats = existingBookings.reduce((sum, booking) => sum + booking.seatsBooked, 0);
    const availableSeats = ride.seatsAvailable - totalBookedSeats;

    if (seatsBooked > availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSeats} seat(s) available`
      });
    }

    // Check if user has already booked this ride
    const existingBooking = await BookedRide.findOne({
      rideId: rideId,
      riderId: riderId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this ride"
      });
    }

    // Calculate total amount
    const totalAmount = ride.pricePerSeat * seatsBooked;

    // Create pickup location GeoJSON
    const pickupPointGeoJSON = {
      type: "Point",
      coordinates: [pickupLocation.lng, pickupLocation.lat]
    };

    // Create meeting point GeoJSON if provided
    let meetingPointGeoJSON = null;
    if (meetingPoint && meetingPoint.lat && meetingPoint.lng) {
      meetingPointGeoJSON = {
        type: "Point",
        coordinates: [meetingPoint.lng, meetingPoint.lat]
      };
    }

    // Create the booking
    const newBooking = new BookedRide({
      rideId,
      riderId,
      driverId: ride.userId,
      seatsBooked,
      pickupLocation: pickupPointGeoJSON,
      pickupLocationName: pickupLocationName || "Pickup Location",
      meetingPoint: meetingPointGeoJSON,
      distanceToMeetingPoint: distanceToMeetingPoint || null,
      riderNotes: riderNotes || "",
      payment: {
        totalAmount,
        paymentStatus: 'pending',
        paymentMethod
      },
      status: 'pending'
    });

    await newBooking.save();

    // Decrease available seats in the ride
    ride.seatsAvailable -= seatsBooked;
    await ride.save();

    // Populate references before sending response
    await newBooking.populate([
      { path: 'rideId' },
      { path: 'riderId', select: 'fullName email phone' },
      { path: 'driverId', select: 'fullName email phone' }
    ]);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: newBooking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/bookings/my-bookings
 * Get current user's bookings (as a rider)
 */
export const getMyBookings = async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const bookings = await BookedRide.findUserBookings(userId, status || null);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/bookings/received
 * Get bookings received by driver for their rides
 */
export const getReceivedBookings = async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const bookings = await BookedRide.findDriverBookings(userId, status || null);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/bookings/ride/:rideId
 * Get all bookings for a specific ride
 */
export const getRideBookings = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.query;

    const query = { rideId };
    if (status) {
      query.status = status;
    }

    const bookings = await BookedRide.find(query)
      .populate('riderId', 'fullName email phone')
      .populate('driverId', 'fullName email phone')
      .sort({ bookedAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error('Error fetching ride bookings:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/bookings/:id
 * Get a specific booking by ID
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await BookedRide.findById(id)
      .populate('rideId')
      .populate('riderId', 'fullName email phone')
      .populate('driverId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id/confirm
 * Confirm a booking (driver action)
 */
export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const booking = await BookedRide.findById(id).populate('rideId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify the user is the driver
    if (booking.driverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the driver can confirm this booking"
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm booking with status: ${booking.status}`
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      booking
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Cancel a booking
 */
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, cancelledBy, cancellationReason } = req.body;

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify the user is either the rider or the driver
    const isRider = booking.riderId.toString() === userId;
    const isDriver = booking.driverId.toString() === userId;

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking"
      });
    }

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      cancelledBy: cancelledBy || (isRider ? 'rider' : 'driver'),
      cancellationReason: cancellationReason || "No reason provided",
      cancelledAt: new Date()
    };

    await booking.save();

    // Restore available seats in the ride
    const ride = await Ride.findById(booking.rideId);
    if (ride) {
      ride.seatsAvailable += booking.seatsBooked;
      await ride.save();
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id/complete
 * Mark booking as completed (driver action)
 */
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify the user is the driver
    if (booking.driverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the driver can complete this booking"
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be completed"
      });
    }

    booking.status = 'completed';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking completed successfully",
      booking
    });

  } catch (error) {
    console.error('Error completing booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id/rate
 * Add rating and review for completed booking (rider action)
 */
export const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ratingForDriver, reviewForDriver } = req.body;

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify the user is the rider
    if (booking.riderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the rider can rate this booking"
      });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be rated"
      });
    }

    if (booking.rating.ratingForDriver) {
      return res.status(400).json({
        success: false,
        message: "This booking has already been rated"
      });
    }

    // Validate rating
    if (!ratingForDriver || ratingForDriver < 1 || ratingForDriver > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    booking.rating = {
      ratingForDriver,
      reviewForDriver: reviewForDriver || "",
      ratedAt: new Date()
    };

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Rating submitted successfully",
      booking
    });

  } catch (error) {
    console.error('Error rating booking:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * PATCH /api/bookings/:id/payment
 * Update payment status
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (!['pending', 'paid', 'refunded', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    booking.payment.paymentStatus = paymentStatus;
    if (transactionId) {
      booking.payment.transactionId = transactionId;
    }
    if (paymentStatus === 'paid') {
      booking.payment.paidAt = new Date();
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      booking
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
