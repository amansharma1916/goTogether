import express from 'express';
import { createRide, getRides, getRideById, searchRides, getMyRides } from '../controllers/rideController.js';

const router = express.Router();

// POST /api/rides - Create a new ride
router.post('/', createRide);

// GET /api/rides/my-rides - Get current user's rides (must be before /:id)
router.get('/my-rides', getMyRides);

// GET /api/rides - Get all active rides (excluding user's own)
router.get('/', getRides);

// POST /api/rides/search - Search rides by pickup location
router.post('/search', searchRides);

// GET /api/rides/:id - Get a specific ride
router.get('/:id', getRideById);

export default router;
