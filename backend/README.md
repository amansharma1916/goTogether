# goTogether Backend

Node.js + Express backend API for the goTogether student rideshare platform.

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** with **Mongoose** - Database
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens
- **CORS** - Cross-origin requests
- **dotenv** - Environment configuration

## Features

- 🔐 User authentication (register/login)
- 🗄️ MongoDB database integration
- 🔒 Secure password hashing
- 🎫 JWT token-based auth
- 🚀 RESTful API endpoints

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

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Rides (Future)
- `GET /api/rides` - Get available rides
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Delete ride

## Scripts

- `npm start` - Start server with nodemon (auto-restart)
- `npm test` - Run tests

## Database Models

### User
- fullName
- email (unique)
- password (hashed)
- college
- createdAt

## License

MIT
