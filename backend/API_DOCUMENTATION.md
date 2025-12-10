# Rides API Documentation

## Overview
The Rides API handles the creation, retrieval, and management of ride postings in the goTogether platform.

## Base URL
```
http://localhost:5000/api/rides
```

## Endpoints

### 1. POST /api/rides
Create a new ride posting.

**Request Body:**
```json
{
  "origin": {
    "lat": 23.334284328951455,
    "lng": 85.25833023900533,
    "name": "Main Street, Downtown"
  },
  "destination": {
    "lat": 23.334284328951455,
    "lng": 85.25833023900533,
    "name": "Amity University Ranchi"
  },
  "selectedRouteIndex": 0,
  "departureDate": "2025-12-15",
  "departureTime": "08:00",
  "seats": 3,
  "pricePerSeat": 5.00,
  "vehicle": "Toyota Camry (4 seats)",
  "notes": "Pick up from main gate",
  "driverId": "507f1f77bcf86cd799439011"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "rideId": "675a1b2c3d4e5f6g7h8i9j0k",
  "message": "Ride posted successfully",
  "ride": {
    "id": "675a1b2c3d4e5f6g7h8i9j0k",
    "origin": "Main Street, Downtown",
    "destination": "Amity University Ranchi",
    "departureTime": "2025-12-15T08:00:00.000Z",
    "seatsAvailable": 3,
    "pricePerSeat": 5,
    "distance": "12.45 km",
    "duration": "23 min"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Origin and destination with lat/lng are required"
}
```

---

### 2. GET /api/rides
Retrieve all active rides with optional filters.

**Query Parameters:**
- `departureDate` (optional): Filter by departure date (format: YYYY-MM-DD)
- `maxDistance` (optional): Maximum distance in kilometers

**Example Request:**
```
GET /api/rides?departureDate=2025-12-15
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "rides": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "driverId": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "origin": {
        "type": "Point",
        "coordinates": [85.25833023900533, 23.334284328951455]
      },
      "destination": {
        "type": "Point",
        "coordinates": [85.25833023900533, 23.334284328951455]
      },
      "route": {
        "type": "LineString",
        "coordinates": [[85.258, 23.334], [85.260, 23.336], ...]
      },
      "distanceMeters": 12450,
      "durationSeconds": 1380,
      "departureTime": "2025-12-15T08:00:00.000Z",
      "seatsAvailable": 3,
      "pricePerSeat": 5,
      "notes": "Pick up from main gate",
      "status": "active",
      "createdAt": "2025-12-10T10:30:00.000Z",
      "updatedAt": "2025-12-10T10:30:00.000Z"
    }
  ]
}
```

---

### 3. GET /api/rides/:id
Retrieve a specific ride by ID.

**Example Request:**
```
GET /api/rides/675a1b2c3d4e5f6g7h8i9j0k
```

**Response (200 OK):**
```json
{
  "success": true,
  "ride": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "driverId": {
      "_id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "origin": {
      "type": "Point",
      "coordinates": [85.25833023900533, 23.334284328951455]
    },
    "destination": {
      "type": "Point",
      "coordinates": [85.25833023900533, 23.334284328951455]
    },
    "route": {
      "type": "LineString",
      "coordinates": [[85.258, 23.334], ...]
    },
    "simplifiedRoute": {
      "type": "LineString",
      "coordinates": [[85.258, 23.334], ...]
    },
    "bbox": {
      "type": "Polygon",
      "coordinates": [[[...]]]
    },
    "distanceMeters": 12450,
    "durationSeconds": 1380,
    "departureTime": "2025-12-15T08:00:00.000Z",
    "seatsAvailable": 3,
    "pricePerSeat": 5,
    "notes": "Pick up from main gate",
    "status": "active"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Ride not found"
}
```

---

## Data Processing

### Route Processing Steps:
1. **Fetch Routes**: Call OpenRouteService API to get 3 alternative routes
2. **Route Selection**: Use `selectedRouteIndex` (0, 1, or 2) to pick the route
3. **Simplification**: Use Turf.js to simplify the route geometry (tolerance: 0.001)
4. **Bounding Box**: Calculate bbox polygon for spatial filtering
5. **Save to MongoDB**: Store all geospatial data with 2dsphere indexes

### Geospatial Fields:
- **origin**: GeoJSON Point (driver's starting location)
- **destination**: GeoJSON Point (college location)
- **route**: Full LineString from ORS (detailed path)
- **simplifiedRoute**: Simplified LineString (faster rendering)
- **bbox**: Bounding box Polygon (fast spatial queries)

### Indexes:
- `origin: "2dsphere"` - For proximity searches
- `route: "2dsphere"` - For route-based matching
- `bbox: "2dsphere"` - For fast area filtering
- `departureTime: 1` - For time-based queries

---

## Environment Variables

Add to `.env`:
```
ORS_API_KEY=your_openrouteservice_api_key_here
```

Get your free API key from: https://openrouteservice.org/

---

## Testing

### Test with cURL:
```bash
curl -X POST http://localhost:5000/api/rides \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"lat": 23.334, "lng": 85.258, "name": "Main St"},
    "destination": {"lat": 23.340, "lng": 85.265, "name": "College"},
    "selectedRouteIndex": 0,
    "departureDate": "2025-12-15",
    "departureTime": "08:00",
    "seats": 3,
    "pricePerSeat": 5.00,
    "driverId": "507f1f77bcf86cd799439011"
  }'
```

### Test with Postman:
1. Create a new POST request to `http://localhost:5000/api/rides`
2. Set Headers: `Content-Type: application/json`
3. Add the request body from above
4. Send request

---

## Error Codes

- **200 OK**: Request successful
- **201 Created**: Ride created successfully
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Ride not found
- **500 Internal Server Error**: Server error (check logs)

---

## Notes

- All coordinates are in [longitude, latitude] format for GeoJSON compliance
- Departure time is stored as ISO 8601 date string
- Distance is stored in meters, duration in seconds
- Route simplification uses tolerance of 0.001 degrees (~100m)
- Bounding box provides fast spatial filtering for ride matching
