import express from 'express';
import { createRide, getRides, getRideById, searchRides, getMyRides } from '../controllers/rideController.js';

const router = express.Router();


router.post('/', createRide);


router.get('/my-rides', getMyRides);


router.get('/', getRides);


router.post('/search', searchRides);


router.get('/:id', getRideById);

export default router;
