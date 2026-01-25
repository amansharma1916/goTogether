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
  updatePaymentStatus,
  updateRideStatus
} from '../controllers/bookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', authMiddleware, createBooking);


router.get('/my-bookings', authMiddleware, getMyBookings);


router.get('/received', authMiddleware, getReceivedBookings);


router.get('/ride/:rideId', getRideBookings);


router.get('/:id', authMiddleware, getBookingById);


router.patch('/:id/confirm', authMiddleware, confirmBooking);


router.patch('/:id/cancel', authMiddleware, cancelBooking);


router.patch('/:id/complete', authMiddleware, completeBooking);


router.patch('/:id/rate', authMiddleware, rateBooking);


router.patch('/:id/payment', authMiddleware, updatePaymentStatus);


router.patch('/:id/status', authMiddleware, updateRideStatus);

export default router;
