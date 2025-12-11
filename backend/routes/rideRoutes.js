import express from 'express';
import { createRide, getRides, getRideById, searchRides } from '../controllers/rideController.js';

const router = express.Router();

// POST /api/rides - Create a new ride
router.post('/', createRide);

// GET /api/rides - Get all active rides
router.get('/', getRides);

// POST /api/rides/search - Search rides by pickup location
router.post('/search', searchRides);

// GET /api/rides/:id - Get a specific ride
router.get('/:id', getRideById);

export default router;
