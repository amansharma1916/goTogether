import mongoose, { Schema } from "mongoose";

// ----------------------
// GeoJSON Subschemas
// ----------------------

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true
  }
});

const LineStringSchema = new Schema({
  type: {
    type: String,
    enum: ["LineString"],
    required: true,
    default: "LineString"
  },
  coordinates: {
    type: [[Number]], // array of [lng, lat]
    required: true
  }
});

const PolygonSchema = new Schema({
  type: {
    type: String,
    enum: ["Polygon"],
    required: true,
    default: "Polygon"
  },
  coordinates: {
    type: [[[Number]]], // polygon array
    required: true
  }
});

// ----------------------
// Ride Schema
// ----------------------

const RideSchema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true
    },

    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: false
    },

    fullName: {
      type: String,
      required: true
    },

    // Origin selected by driver
    origin: {
      type: PointSchema,
      required: true
    },

    // Destination (fixed college)
    destination: {
      type: PointSchema,
      required: true
    },

    // FULL route selected by user (from ORS)
    route: {
      type: LineStringSchema,
      required: true
    },

    // Simplified polyline for fast frontend preview + matching
    simplifiedRoute: {
      type: LineStringSchema,
      required: false
    },

    // Bounding box polygon for fast DB spatial filtering
    bbox: {
      type: PolygonSchema,
      required: false
    },

    // Distance and Duration
    distanceMeters: {
      type: Number,
      required: true
    },

    durationSeconds: {
      type: Number,
      required: true
    },

    // Ride Form Fields
    departureTime: {
      type: Date,
      required: true
    },

    seatsAvailable: {
      type: Number,
      required: true,
      min: 1
    },

    pricePerSeat: {
      type: Number,
      required: true,
      min: 0
    },

    notes: {
      type: String,
      default: ""
    },

    // Ride lifecycle
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active"
    }
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

// ----------------------
// Indexes for fast search
// ----------------------

RideSchema.index({ origin: "2dsphere" });
RideSchema.index({ route: "2dsphere" });
RideSchema.index({ bbox: "2dsphere" });
RideSchema.index({ departureTime: 1 });

export default mongoose.model("Ride", RideSchema);
