# 🚗 goTogether - Student Rideshare Platform

<div align="center">

![goTogether Logo](./frontend/src/images/logo/gotogetherLogo.png)

**A modern, full-stack rideshare platform designed specifically for students**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://gotogetherv1.vercel.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue?style=for-the-badge&logo=react)](./frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?style=for-the-badge&logo=node.js)](./backend)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

</div>

---


## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**goTogether** is a comprehensive rideshare platform built for students to connect and share rides efficiently. With real-time geospatial searches, interactive maps, and a complete booking system, students can easily find rides or offer rides to fellow students heading in the same direction.

### Why goTogether?

- 💰 **Save Money** - Split fuel costs with other students
- 🌍 **Eco-Friendly** - Reduce carbon footprint by carpooling
- 🤝 **Build Community** - Connect with fellow students
- 🔒 **Safe & Secure** - Student-verified platform with ratings
- 📱 **Easy to Use** - Intuitive interface with real-time updates

---

## ✨ Features

### 🗺️ **Interactive Mapping**
- Real-time route visualization with MapLibre GL
- Click-to-select locations on map
- Autocomplete location search powered by Nominatim
- Meeting point calculation for convenient pickup

### 🚗 **Ride Management**
- Post rides with complete route information
- View all available rides with filters
- Separate "My Rides" view for posted rides
- Real-time seat availability updates
- Sort by distance, time, or price
- Geospatial proximity search (find rides near you)

### 📱 **Booking System**
- One-click booking with validation
- Booking lifecycle: Pending → Confirmed → Completed
- Driver dashboard to manage received requests
- Rider dashboard to track sent requests
- Cancel bookings with reason tracking
- Payment method selection (Cash/Card/UPI/Wallet)
- Automatic seat count management

### ⭐ **Rating & Reviews**
- Rate drivers after ride completion
- Leave detailed reviews
- 5-star rating system

### 🔐 **Authentication & Security**
- Secure JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints
- Session management with localStorage

### 🎨 **Modern UI/UX**
- Dark-themed gradient design
- Glassmorphism effects with backdrop blur
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions
- Status badges with color coding
- Loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Maps:** MapLibre GL JS
- **Styling:** Custom CSS with modern effects
- **APIs:** OpenRouteService, Nominatim (OpenStreetMap)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + bcryptjs
- **Geospatial:** MongoDB GeoJSON with 2dsphere indexes
- **API Architecture:** RESTful

### DevOps & Deployment
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Heroku/Railway/Render
- **Database:** MongoDB Atlas (Cloud)
- **Version Control:** Git & GitHub

---

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/landing.png)
![Login Page](./screenshots/login.png)
![Register Page](./screenshots/register.png)
*Modern hero section with search functionality*

### Home Page
![Home Page](./screenshots/home.png)

### Interactive Map
![Map View](./screenshots/map.png)
*Search rides with interactive map visualization*

### Browse Rides
![Rides Page](./screenshots/rides.png)
*Browse all available rides with filters and sorting*

### Post New Ride
![Post Ride](./screenshots/join.png)
*Create rides with route selection on map*

### Booking Management
![Bookings](./screenshots/bookings.png)
*Manage received and sent booking requests*
![Bookings](./screenshots/bookings2.png)
*Manage received and sent booking requests*

### Mobile Responsive
<div align="center">
<img src="./screenshots/mobile.png" alt="Mobile View" width="300">
</div>

*Fully responsive design for all devices*

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goTogether.git
   cd goTogether
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start backend server
   npm start
   ```

3. **Set up Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Environment Variables

#### Backend `.env`
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gotogether
VITE_ORS_API_KEY=your_openrouteservice_api_key
# OR use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gotogether
VITE_ORS_API_KEY=your_openrouteservice_api_key
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000
VITE_ORS_API_KEY=your_openrouteservice_api_key
```

**Get API Keys:**
- [OpenRouteService API Key](https://openrouteservice.org/dev/#/signup) (Free tier available)

---

## 📁 Project Structure

```
goTogether/
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Default/    # Public pages (Landing, Login, Register)
│   │   │   └── User/       # Protected pages (Home, Map, Rides, Join, Bookings)
│   │   ├── Styles/         # CSS files
│   │   ├── images/         # Static assets
│   │   ├── App.tsx         # Main app with routing
│   │   └── main.tsx        # Entry point
│   ├── .env                # Environment variables
│   ├── vercel.json         # Vercel deployment config
│   └── vite.config.ts      # Vite configuration
│
├── backend/                 # Node.js + Express backend
│   ├── DB/
│   │   └── Schema/         # Mongoose schemas
│   │       ├── RegistrationSchema.js    # User model
│   │       ├── PostedRidesSchema.js     # Ride model
│   │       └── BookedRideSchema.js      # Booking model
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── rideController.js
│   │   └── bookingController.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── rideRoutes.js
│   │   └── bookingRoutes.js
│   ├── .env                # Environment variables
│   └── server.js           # Entry point
│
└── README.md               # This file
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "college": "Amity University",
  "phone": "1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Ride Endpoints

#### Get All Rides (excluding user's own)
```http
GET /api/rides?userId={userId}
```

#### Search Rides by Proximity
```http
POST /api/rides/search
Content-Type: application/json

{
  "pickupLocation": {
    "lat": 23.334284,
    "lng": 85.258330
  },
  "radiusMeters": 20000,
  "userId": "user_id_here"
}
```

#### Create Ride
```http
POST /api/rides
Content-Type: application/json

{
  "userId": "driver_user_id",
  "origin": {
    "type": "Point",
    "coordinates": [85.258330, 23.334284],
    "name": "Amity University"
  },
  "destination": {
    "type": "Point",
    "coordinates": [85.310320, 23.363790],
    "name": "Ranchi Railway Station"
  },
  "route": {
    "type": "LineString",
    "coordinates": [[85.258330, 23.334284], ...]
  },
  "departureTime": "2025-12-15T10:00:00Z",
  "seatsAvailable": 3,
  "pricePerSeat": 50,
  "vehicle": "Toyota Camry",
  "notes": "AC car, comfortable ride"
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "rideId": "ride_id_here",
  "riderId": "rider_user_id",
  "seatsBooked": 2,
  "pickupLocation": {
    "type": "Point",
    "coordinates": [85.280000, 23.340000]
  },
  "pickupLocationName": "Near College Gate",
  "meetingPoint": {
    "type": "Point",
    "coordinates": [85.270000, 23.335000]
  },
  "distanceToMeetingPoint": 1200,
  "paymentMethod": "upi"
}
```

#### Get My Bookings (as rider)
```http
GET /api/bookings/my-bookings?userId={userId}&status=pending
```

#### Get Received Bookings (as driver)
```http
GET /api/bookings/received?userId={userId}
```

#### Confirm Booking (driver only)
```http
PATCH /api/bookings/{bookingId}/confirm
Content-Type: application/json

{
  "userId": "driver_user_id"
}
```

#### Complete Booking (driver only)
```http
PATCH /api/bookings/{bookingId}/complete
Content-Type: application/json

{
  "userId": "driver_user_id"
}
```

#### Rate Driver (rider only, after completion)
```http
PATCH /api/bookings/{bookingId}/rate
Content-Type: application/json

{
  "userId": "rider_user_id",
  "ratingForDriver": 5,
  "reviewForDriver": "Great ride, very punctual!"
}
```

For complete API documentation, see [Backend README](./backend/README.md)

---

## 🌐 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set root directory to `frontend`
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Important: vercel.json Configuration**
   The `vercel.json` file is already configured to handle client-side routing:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Backend (Railway/Render/Heroku)

1. **Prepare for Deployment**
   - Ensure `package.json` has start script
   - Set up environment variables on hosting platform
   - Configure MongoDB Atlas connection string

2. **Deploy to Railway** (Recommended)
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   cd backend
   railway init
   
   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   Add the following in your hosting dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP addresses (or allow all for development)
4. Get connection string and add to backend `.env`

---

## 🔑 Key Features Explained

### Geospatial Search
goTogether uses MongoDB's geospatial queries with GeoJSON format:
- **2dsphere indexes** for efficient location-based searches
- **$near operator** to find rides within a radius
- **Haversine formula** for distance calculations
- **Meeting point optimization** finds the nearest point on the route

### Real-time Seat Management
- Seats automatically decrease when booking is created
- Seats restore when booking is cancelled
- Concurrent booking validation prevents overbooking
- Available seats displayed in real-time

### Booking Lifecycle
```
Pending → Confirmed (by driver) → Completed (by driver) → Rated (by rider)
   ↓
Cancelled (by rider or driver)
```

### Security Features
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with expiration
- Protected API routes with authentication middleware
- Input validation and sanitization
- Self-booking prevention
- Duplicate booking prevention

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developer:** Your Name
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) - Map data and tiles
- [OpenRouteService](https://openrouteservice.org/) - Route calculation
- [MapLibre GL JS](https://maplibre.org/) - Map rendering library
- [MongoDB](https://www.mongodb.com/) - Database platform
- [Vercel](https://vercel.com/) - Frontend hosting
- [Railway](https://railway.app/) - Backend hosting

---

## 📞 Support

If you have any questions or need support, please:
- Open an issue in the [GitHub repository](https://github.com/yourusername/goTogether/issues)
- Email: support@gotogether.com
- Join our community Discord: [discord.gg/gotogether](https://discord.gg/gotogether)

---

<div align="center">

**Made with ❤️ for Students by Students**

⭐ Star this repo if you find it helpful!

[Live Demo](YOUR_VERCEL_DEPLOYMENT_URL) • [Report Bug](https://github.com/yourusername/goTogether/issues) • [Request Feature](https://github.com/yourusername/goTogether/issues)

</div>
