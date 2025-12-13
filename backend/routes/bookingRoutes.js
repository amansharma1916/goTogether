import express from 'express';
import {
  createBooking,
  getMyBookings,
  getReceivedBookings,
  getRideBookings,
  getBookingById,
  confirmBooking,
  cancelBooking,
  completeBooking,
  rateBooking,
  updatePaymentStatus
} from '../controllers/bookingController.js';

const router = express.Router();

// POST /api/bookings - Create a new booking
router.post('/', createBooking);

// GET /api/bookings/my-bookings - Get current user's bookings (as rider)
router.get('/my-bookings', getMyBookings);

// GET /api/bookings/received - Get bookings received by driver
router.get('/received', getReceivedBookings);

// GET /api/bookings/ride/:rideId - Get all bookings for a specific ride
router.get('/ride/:rideId', getRideBookings);

// GET /api/bookings/:id - Get a specific booking by ID
router.get('/:id', getBookingById);

// PATCH /api/bookings/:id/confirm - Confirm a booking (driver)
router.patch('/:id/confirm', confirmBooking);

// PATCH /api/bookings/:id/cancel - Cancel a booking (rider or driver)
router.patch('/:id/cancel', cancelBooking);

// PATCH /api/bookings/:id/complete - Mark booking as completed (driver)
router.patch('/:id/complete', completeBooking);

// PATCH /api/bookings/:id/rate - Rate and review booking (rider)
router.patch('/:id/rate', rateBooking);

// PATCH /api/bookings/:id/payment - Update payment status
router.patch('/:id/payment', updatePaymentStatus);

export default router;
