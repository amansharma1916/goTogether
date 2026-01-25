import BookedRide from '../DB/Schema/BookedRideSchema.js';
import Ride from '../DB/Schema/PostedRidesSchema.js';


export const createBooking = async (req, res) => {
  try {
    const {
      rideId,
      seatsBooked = 1,
      pickupLocation,
      pickupLocationName,
      meetingPoint,
      distanceToMeetingPoint,
      riderNotes,
      paymentMethod = 'cash'
    } = req.body;

    // Get riderId from JWT token
    const riderId = req.user?.userId;

    if (!riderId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: "Ride ID is required"
      });
    }

    if (!pickupLocation || !pickupLocation.lat || !pickupLocation.lng) {
      return res.status(400).json({
        success: false,
        message: "Valid pickup location is required"
      });
    }

    
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    
    if (ride.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "This ride is no longer available for booking"
      });
    }

    
    if (ride.userId.toString() === riderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own ride"
      });
    }

    
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

    
    const totalAmount = ride.pricePerSeat * seatsBooked;

    
    const pickupPointGeoJSON = {
      type: "Point",
      coordinates: [pickupLocation.lng, pickupLocation.lat]
    };

    
    let meetingPointGeoJSON = null;
    if (meetingPoint && meetingPoint.lat && meetingPoint.lng) {
      meetingPointGeoJSON = {
        type: "Point",
        coordinates: [meetingPoint.lng, meetingPoint.lat]
      };
    }

    
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

    
    ride.seatsAvailable -= seatsBooked;
    await ride.save();

    
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


export const getMyBookings = async (req, res) => {
  try {
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { status, page = 1, limit = 4 } = req.query;

    // Pagination calculations
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { riderId: userId };
    if (status) {
      filter.status = status;
    }

    // Get total count
    const totalBookings = await BookedRide.countDocuments(filter);

    // Fetch bookings with pagination
    const bookings = await BookedRide.find(filter)
      .populate([
        { path: 'rideId' },
        { path: 'riderId', select: 'fullName email phone' },
        { path: 'driverId', select: 'fullName email phone' }
      ])
      .sort({ bookedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalBookings / limitNum),
        totalBookings,
        bookingsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBookings / limitNum),
        hasPrevPage: pageNum > 1
      }
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


export const getReceivedBookings = async (req, res) => {
  try {
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const { status, page = 1, limit = 4 } = req.query;

    // Pagination calculations
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = { driverId: userId };
    if (status) {
      filter.status = status;
    }

    // Get total count
    const totalBookings = await BookedRide.countDocuments(filter);

    // Fetch bookings with pagination
    const bookings = await BookedRide.find(filter)
      .populate([
        { path: 'rideId' },
        { path: 'riderId', select: 'fullName email phone' },
        { path: 'driverId', select: 'fullName email phone' }
      ])
      .sort({ bookedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalBookings / limitNum),
        totalBookings,
        bookingsPerPage: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBookings / limitNum),
        hasPrevPage: pageNum > 1
      }
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


export const confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const booking = await BookedRide.findById(id).populate('rideId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    
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


export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelledBy, cancellationReason } = req.body;
    // Get userId from JWT token
    const userId = req.user?.userId;
    

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    
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


export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    
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


export const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { ratingForDriver, reviewForDriver } = req.body;
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const booking = await BookedRide.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    
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


// New controller for updating ride status
export const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, cancellationReason } = req.body;
    // Get userId from JWT token
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const booking = await BookedRide.findById(id).populate('rideId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user is authorized (either rider or driver)
    const isRider = booking.riderId.toString() === userId;
    const isDriver = booking.driverId.toString() === userId;

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking"
      });
    }

    // Validate status transition
    const validStatuses = ['confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    // Handle status update
    if (status === 'cancelled') {
      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: "Cannot cancel a completed ride"
        });
      }

      booking.status = 'cancelled';
      booking.cancellation = {
        cancelledBy: isRider ? 'rider' : 'driver',
        cancellationReason: cancellationReason || "Emergency cancellation",
        cancelledAt: new Date()
      };

      // Restore seats to the ride
      const ride = await Ride.findById(booking.rideId);
      if (ride) {
        ride.seatsAvailable += booking.seatsBooked;
        await ride.save();
      }
    } else if (status === 'completed') {
      if (booking.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: "Only confirmed rides can be completed"
        });
      }
      booking.status = 'completed';
      booking.completedAt = new Date();
    }

    // Update payment status if provided
    if (paymentStatus && ['pending', 'paid'].includes(paymentStatus)) {
      booking.payment.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') {
        booking.payment.paidAt = new Date();
      }
    }

    await booking.save();

    // Populate booking data for response
    await booking.populate([
      { path: 'riderId', select: 'fullName email phone' },
      { path: 'driverId', select: 'fullName email phone' }
    ]);

    return res.status(200).json({
      success: true,
      message: "Ride status updated successfully",
      booking
    });

  } catch (error) {
    console.error('Error updating ride status:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
