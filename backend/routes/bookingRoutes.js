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

const router = express.Router();


router.post('/', createBooking);


router.get('/my-bookings', getMyBookings);


router.get('/received', getReceivedBookings);


router.get('/ride/:rideId', getRideBookings);


router.get('/:id', getBookingById);


router.patch('/:id/confirm', confirmBooking);


router.patch('/:id/cancel', cancelBooking);


router.patch('/:id/complete', completeBooking);


router.patch('/:id/rate', rateBooking);


router.patch('/:id/payment', updatePaymentStatus);


router.patch('/:id/status', updateRideStatus);

export default router;
