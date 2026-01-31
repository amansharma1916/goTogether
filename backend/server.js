import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './DB/db.js';
import authRoutes from './Auth/Routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import socketAuthMiddleware from './middleware/socketAuthMiddleware.js';
import { setupSocketEvents } from './socket/socketEvents.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);

// Socket.io Authentication Middleware
io.use(socketAuthMiddleware);

// Setup Socket.io Events
setupSocketEvents(io);

// Make io accessible to routes if needed
app.set('io', io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready at ws://localhost:${PORT}`);
});