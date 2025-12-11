import Ride from '../DB/Schema/PostedRidesSchema.js';
import Registration from '../DB/Schema/registrationSchema.js';
import simplify from '@turf/simplify';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';

const ORS_API_KEY = process.env.ORS_API_KEY || '';

/**
 * POST /api/rides
 * Create a new ride posting
 */
export const createRide = async (req, res) => {
  try {
    const {
      origin,           // { lat, lng, name }
      destination,      // { lat, lng, name }
      selectedRouteIndex = 0,
      departureDate,
      departureTime,
      seats,
      pricePerSeat,
      vehicle,
      notes
    } = req.body;

    // 1. Validate required fields
    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination with lat/lng are required"
      });
    }

    if (!seats || seats < 1) {
      return res.status(400).json({
        success: false,
        message: "Seats available must be at least 1"
      });
    }

    if (!pricePerSeat || pricePerSeat < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid price per seat is required"
      });
    }

    // 2. Combine date and time into departureTime
    let departureDateTimeObj;
    if (departureDate && departureTime) {
      departureDateTimeObj = new Date(`${departureDate}T${departureTime}`);
    } else if (departureDate) {
      departureDateTimeObj = new Date(departureDate);
    } else {
      return res.status(400).json({
        success: false,
        message: "Departure date is required"
      });
    }

    // Check if a ride with the same departure time already exists
    const existingRide = await Ride.findOne({
      driverId: req.user?.id || req.body.driverId,
      departureTime: departureDateTimeObj
    });

    if (existingRide) {
      return res.status(400).json({
        success: false,
        message: "Cannot create multiple rides with the same departure time"
      });
    }

    // 3. Fetch routes from OpenRouteService
    let routesData;
    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": ORS_API_KEY,
          },
          body: JSON.stringify({
            coordinates: [
              [origin.lng, origin.lat],
              [destination.lng, destination.lat]
            ],
            alternative_routes: {
              target_count: 3,
              share_factor: 0.6
            }
          }),
        }
      );

      routesData = await response.json();
      
      if (!routesData.features || routesData.features.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No routes found between origin and destination"
        });
      }
    } catch (error) {
      console.error('Error fetching routes from ORS:', error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch routes from OpenRouteService"
      });
    }

    // 4. Select the route based on selectedRouteIndex
    const selectedRoute = routesData.features[selectedRouteIndex] || routesData.features[0];
    const routeGeometry = selectedRoute.geometry;
    const routeProperties = selectedRoute.properties;

    // 5. Extract distance and duration from route properties
    const distanceMeters = routeProperties.segments?.[0]?.distance || routeProperties.summary?.distance || 0;
    const durationSeconds = routeProperties.segments?.[0]?.duration || routeProperties.summary?.duration || 0;

    // 6. Create simplified route for faster frontend rendering
    const simplifiedRouteGeometry = simplify(routeGeometry, {
      tolerance: 0.001,
      highQuality: false
    });

    // 7. Create bounding box polygon for spatial filtering
    const bboxArray = bbox(routeGeometry); // [minLng, minLat, maxLng, maxLat]
    const bboxPolygonGeometry = bboxPolygon(bboxArray).geometry;

    // 8. Create GeoJSON Point objects for origin and destination
    const originPoint = {
      type: "Point",
      coordinates: [origin.lng, origin.lat]
    };

    const destinationPoint = {
      type: "Point",
      coordinates: [destination.lng, destination.lat]
    };

    // 9. Create the ride document
    const newRide = new Ride({
      driverId: req.user?.id || req.body.driverId, // Get from auth middleware or body (for testing)
      vehicleId: req.body.vehicleId || null,
      fullName: req.user?.fullName || "Unknown Driver",
      origin: originPoint,
      destination: destinationPoint,
      route: routeGeometry,
      simplifiedRoute: simplifiedRouteGeometry,
      bbox: bboxPolygonGeometry,
      distanceMeters,
      durationSeconds,
      departureTime: departureDateTimeObj,
      seatsAvailable: seats,
      pricePerSeat: parseFloat(pricePerSeat),
      notes: notes || "",
      status: "active"
    });

    // 10. Save to database
    await newRide.save();

    // 11. Return success response
    return res.status(201).json({
      success: true,
      rideId: newRide._id,
      message: "Ride posted successfully",
      ride: {
        id: newRide._id,
        origin: origin.name,
        destination: destination.name,
        departureTime: newRide.departureTime,
        seatsAvailable: newRide.seatsAvailable,
        pricePerSeat: newRide.pricePerSeat,
        distance: (distanceMeters / 1000).toFixed(2) + " km",
        duration: Math.round(durationSeconds / 60) + " min"
      }
    });

  } catch (error) {
    console.error('Error creating ride:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/rides
 * Get all active rides (with optional filters)
 */
export const getRides = async (req, res) => {
  try {
    const { departureDate, maxDistance } = req.query;

    const filter = { status: "active" };

    // Filter by departure date if provided
    if (departureDate) {
      const startOfDay = new Date(departureDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(departureDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.departureTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const rides = await Ride.find(filter)
      .populate('driverId', 'fullName email')
      .sort({ departureTime: 1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides
    });

  } catch (error) {
    console.error('Error fetching rides:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * GET /api/rides/:id
 * Get a specific ride by ID
 */
export const getRideById = async (req, res) => {
  try {
    const { id } = req.params;

    const ride = await Ride.findById(id)
      .populate('driverId', 'fullName email');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    return res.status(200).json({
      success: true,
      ride
    });

  } catch (error) {
    console.error('Error fetching ride:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * POST /api/rides/search
 * Search for rides near a pickup location
 */
export const searchRides = async (req, res) => {
  try {
    const { pickup, radiusMeters = 800, timeWindow } = req.body;

    // Validate pickup location
    if (!pickup || typeof pickup.lat !== 'number' || typeof pickup.lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: "Valid pickup location with lat and lng is required"
      });
    }

    // Create GeoJSON Point for the pickup location
    const pickupPoint = {
      type: "Point",
      coordinates: [pickup.lng, pickup.lat] // GeoJSON uses [lng, lat]
    };

    // Build the query
    const query = {
      status: "active",
      origin: {
        $near: {
          $geometry: pickupPoint,
          $maxDistance: radiusMeters
        }
      }
    };

    // Add time window filter if provided
    if (timeWindow && timeWindow.from) {
      query.departureTime = query.departureTime || {};
      query.departureTime.$gte = new Date(timeWindow.from);
    }
    if (timeWindow && timeWindow.to) {
      query.departureTime = query.departureTime || {};
      query.departureTime.$lte = new Date(timeWindow.to);
    }

    // Execute the search
    const rides = await Ride.find(query)
      .populate('driverId', 'fullName email')
      .limit(30);

    return res.status(200).json({
      success: true,
      results: rides.length,
      rides
    });

  } catch (error) {
    console.error('Error searching rides:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

