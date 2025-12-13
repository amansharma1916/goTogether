# goTogether Frontend

A modern React + TypeScript rideshare platform for students built with Vite, featuring interactive maps, real-time ride search, and comprehensive booking management.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **React Router v6** - Client-side routing
- **MapLibre GL JS** - Interactive maps with OpenStreetMap
- **OpenRouteService** - Route calculation and directions
- **Nominatim API** - Location search & geocoding
- **OpenStreetMap** - Map tiles and geospatial data

## Features

### Authentication
- 🔐 User registration and login
- 🔒 Protected routes with authentication guard
- 💾 localStorage-based session management

### Map & Location
- 🗺️ Interactive map with MapLibre GL
- 📍 Click-to-mark location functionality
- 🔍 Autocomplete location search with Nominatim
- 🛣️ Route visualization on map
- 📏 Distance and duration display
- 🎯 Meeting point calculation and display

### Ride Management
- ➕ Post new rides with complete route information
- 👁️ View all available rides (excludes own rides)
- 🚗 "My Rides" - View own posted rides separately
- 🔄 Toggle between "All Rides" and "My Rides" views
- 📏 Sort rides by distance, time, or price
- 👤 Driver information display
- 💰 Price per seat and total calculation
- 💺 Real-time seat availability
- 👀 Click ride card to view route on map

### Search & Discovery
- 🔍 Proximity-based ride search
- 📍 Search rides from specific pickup location
- 🎯 Calculate nearest meeting point on route
- 📊 Distance to meeting point calculation (Haversine)
- 📅 Filter by departure time
- 📍 Geolocation support for user location

### Booking System
- 📲 Book rides with one click
- ✅ View booking requests (received and sent)
- 🔄 Booking status tracking (pending/confirmed/completed/cancelled)
- 👨‍⚖️ Driver actions: Confirm, Cancel, Complete bookings
- 👥 Rider actions: Cancel bookings
- 💳 Payment method selection
- ⭐ Rating and review system (post-ride)
- 📊 Booking history with detailed information
- 📍 Pickup location and meeting point tracking

### User Interface
- 🎨 Modern dark-themed gradient UI
- 💎 Glassmorphism effects with backdrop blur
- 📱 Fully responsive design (mobile-first)
- 🎭 Smooth animations and transitions
- 🧩 Navigation bar with active route highlighting
- 🟣 Status badges with color coding
- ⚡ Loading states and error handling

### Pages
- 🏠 **Home** - Hero section with search and quick actions
- 🗺️ **Map** - Search rides by location with map view
- 🚗 **Rides** - Browse all rides with filters and booking
- ➕ **Join (Post Ride)** - Create new ride with route selection
- 📲 **Bookings** - Manage received/sent booking requests
- 🔐 **Login/Register** - Authentication pages

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000
VITE_ORS_API_KEY=your_openrouteservice_api_key
```

**Required API Keys:**
- OpenRouteService API key (free tier available at [openrouteservice.org](https://openrouteservice.org/))

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Default/           # Public pages
│   │   │   ├── LandingPage.tsx  # Marketing landing page
│   │   │   ├── LoginPage.tsx    # User login
│   │   │   ├── RegisterPage.tsx # User registration
│   │   │   └── Switcher.tsx     # Auth page switcher
│   │   └── User/              # Protected pages
│   │       ├── HomePage.tsx     # Hero with search
│   │       ├── Map.tsx          # Ride search with map
│   │       ├── Rides.tsx        # Browse all rides
│   │       ├── Join.tsx         # Post new ride
│   │       ├── Bookings.tsx     # Booking management
│   │       ├── Dashboard.tsx    # User dashboard
│   │       └── Assets/
│   │           ├── Navbar.tsx       # Navigation bar
│   │           └── MapComponent.tsx # Reusable map
│   ├── Styles/              # CSS modules
│   │   ├── Default/
│   │   │   ├── LandingPage.css
│   │   │   └── LoginPage.css
│   │   └── User/
│   │       ├── HomePage.css
│   │       ├── Map.css
│   │       ├── Rides.css
│   │       ├── Join.css
│   │       ├── Bookings.css
│   │       └── Assets/
│   │           └── Navbar.css
│   ├── images/              # Static assets
│   │   └── logo/
│   ├── App.tsx              # Main app with routes
│   ├── main.tsx             # Entry point
│   └── ProtectedRoute.tsx   # Auth guard
├── public/                  # Public assets
├── .env                     # Environment variables
├── vercel.json              # Vercel deployment config
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript config
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
