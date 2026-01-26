import express from 'express';
import { createRide, getRides, getRideById, searchRides, getMyRides } from '../controllers/rideController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


router.post('/', authMiddleware, createRide);


router.get('/my-rides', authMiddleware, getMyRides);


router.get('/', getRides);


router.post('/search', searchRides);


router.get('/:id', getRideById);

export default router;
