import express from 'express';
import { createRide, getRides, getRideById } from '../controllers/rideController.js';

const router = express.Router();

// POST /api/rides - Create a new ride
router.post('/', createRide);

// GET /api/rides - Get all active rides
router.get('/', getRides);

// GET /api/rides/:id - Get a specific ride
router.get('/:id', getRideById);

export default router;
