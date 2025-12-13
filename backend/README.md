# goTogether Backend

Node.js + Express backend API for the goTogether student rideshare platform with advanced ride-sharing and booking capabilities.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** with **Mongoose** - Database with GeoJSON support
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens
- **CORS** - Cross-origin requests
- **dotenv** - Environment configuration

## Features

### Authentication & User Management
- 🔐 User registration and login
- 🔒 Secure password hashing with bcrypt
- 🎫 JWT token-based authentication
- 👤 User profile management

### Ride Management
- 🚗 Post rides with route information
- 📍 GeoJSON Point storage for origin/destination
- 🗺️ GeoJSON LineString for complete route coordinates
- 🔍 Geospatial proximity search (within radius)
- 👥 Real-time seat availability management
- 💰 Dynamic pricing per seat
- 📅 Scheduled departure times
- 🚦 Ride status management (active/completed/cancelled)
- 📝 Driver notes and vehicle information

### Booking System
- 📲 Create booking requests for rides
- ✅ Booking confirmation by drivers
- 🎯 Automatic meeting point calculation (nearest route coordinate)
- 💺 Seat availability validation
- 🚫 Self-booking prevention
- 🔄 Booking lifecycle: pending → confirmed → completed
- ❌ Booking cancellation with reason tracking
- 💳 Payment tracking (cash/card/UPI/wallet)
- ⭐ Driver rating and review system
- 📊 Booking history for riders and drivers

### Geospatial Features
- 🌍 2dsphere indexes for location queries
- 📏 Distance calculations with Haversine formula
- 🎯 Meeting point optimization
- 📍 Pickup location tracking with GeoJSON

### Data Management
- 🔢 Automatic seat count updates on booking/cancellation
- ⏰ Automatic timestamp management
- 🔗 Population of related documents (user/ride references)
- 📈 Compound indexes for optimized queries

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server with nodemon
npm start
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gotogether
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Project Structure

```
backend/
├── models/          # Mongoose schemas
├── routes/          # API endpoints
├── controllers/     # Request handlers
├── middleware/      # Auth & validation
├── config/          # Configuration files
└── server.js        # Entry point
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
  - Body: `{ fullName, email, password, college, phone }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: User data with JWT token

### Rides (`/api/rides`)
- `GET /api/rides?userId={id}` - Get all active rides (excludes user's own)
- `GET /api/rides/my-rides?userId={id}` - Get user's posted rides
- `POST /api/rides/search` - Search rides by proximity
  - Body: `{ pickupLocation: { lat, lng }, radiusMeters, userId }`
- `POST /api/rides` - Create new ride
  - Body: `{ userId, origin, destination, route, departureTime, seatsAvailable, pricePerSeat, vehicle, notes }`
- `GET /api/rides/:id` - Get specific ride details
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create booking request
  - Body: `{ rideId, riderId, seatsBooked, pickupLocation, meetingPoint, distanceToMeetingPoint, paymentMethod }`
- `GET /api/bookings/my-bookings?userId={id}` - Get user's bookings (as rider)
  - Query: `status` (optional filter)
- `GET /api/bookings/received?userId={id}` - Get received booking requests (as driver)
  - Query: `status` (optional filter)
- `GET /api/bookings/ride/:rideId` - Get all bookings for specific ride
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/confirm` - Confirm booking (driver only)
  - Body: `{ userId }`
- `PATCH /api/bookings/:id/cancel` - Cancel booking (rider or driver)
  - Body: `{ userId, cancelledBy, cancellationReason }`
- `PATCH /api/bookings/:id/complete` - Mark booking as completed (driver only)
  - Body: `{ userId }`
- `PATCH /api/bookings/:id/rate` - Rate driver (rider only, after completion)
  - Body: `{ userId, ratingForDriver, reviewForDriver }`
- `PATCH /api/bookings/:id/payment` - Update payment status
  - Body: `{ paymentStatus, transactionId }`

## Scripts

- `npm start` - Start server with nodemon (auto-restart)
- `npm test` - Run tests

## Database Models

### User (Registration Schema)
- `fullName` - String (required)
- `email` - String (unique, required)
- `password` - String (hashed, required)
- `college` - String (required)
- `phone` - String (required)
- `createdAt` - Timestamp (auto)
- `updatedAt` - Timestamp (auto)

### Posted Ride
- `userId` - Reference to User (driver)
- `origin` - GeoJSON Point `{ type: 'Point', coordinates: [lng, lat] }`
- `destination` - GeoJSON Point
- `route` - GeoJSON LineString `{ type: 'LineString', coordinates: [[lng, lat], ...] }`
- `departureTime` - DateTime
- `seatsAvailable` - Number (auto-updates on booking)
- `pricePerSeat` - Number
- `distanceMeters` - Number
- `durationSeconds` - Number
- `vehicle` - String
- `notes` - String (optional)
- `status` - Enum: 'active', 'completed', 'cancelled'
- **Indexes**: 2dsphere on origin, compound on userId+status

### Booked Ride
- `rideId` - Reference to Posted Ride
- `riderId` - Reference to User (rider)
- `driverId` - Reference to User (driver)
- `seatsBooked` - Number (default: 1)
- `pickupLocation` - GeoJSON Point
- `pickupLocationName` - String
- `meetingPoint` - GeoJSON Point (calculated)
- `distanceToMeetingPoint` - Number (meters)
- `status` - Enum: 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'
- `payment` - Object:
  - `totalAmount` - Number
  - `paymentStatus` - Enum: 'pending', 'paid', 'refunded', 'failed'
  - `paymentMethod` - Enum: 'cash', 'card', 'upi', 'wallet'
  - `transactionId` - String
  - `paidAt` - DateTime
- `cancellation` - Object (if cancelled):
  - `cancelledBy` - Enum: 'rider', 'driver', 'system'
  - `cancellationReason` - String
  - `cancelledAt` - DateTime
- `rating` - Object (after completion):
  - `ratingForDriver` - Number (1-5)
  - `reviewForDriver` - String
  - `ratedAt` - DateTime
- `bookedAt` - DateTime (default: now)
- `confirmedAt` - DateTime (auto-set)
- `completedAt` - DateTime (auto-set)
- **Indexes**: 2dsphere on pickupLocation, compound on riderId+status, driverId+status
- **Static Methods**: findActiveBookingsForRide, findUserBookings, findDriverBookings
- **Instance Methods**: calculateRefundAmount

## License

MIT
