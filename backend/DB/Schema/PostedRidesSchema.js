import mongoose, { Schema } from "mongoose";

const PointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },
  name: {
    type: String,
    required: false,
    default: ""
  },
  coordinates: {
    type: [Number], 
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
    type: [[Number]], 
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
    type: [[[Number]]], 
    required: true
  }
});





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
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true
    },

    
    origin: {
      type: PointSchema,
      required: true
    },

    
    destination: {
      type: PointSchema,
      required: true
    },

    
    route: {
      type: LineStringSchema,
      required: true
    },

    
    simplifiedRoute: {
      type: LineStringSchema,
      required: false
    },

    
    bbox: {
      type: PolygonSchema,
      required: false
    },

    
    distanceMeters: {
      type: Number,
      required: true
    },

    durationSeconds: {
      type: Number,
      required: true
    },

    
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

    
    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active"
    }
  },
  {
    timestamps: true 
  }
);

RideSchema.index({ origin: "2dsphere" });
RideSchema.index({ route: "2dsphere" });
RideSchema.index({ bbox: "2dsphere" });
RideSchema.index({ departureTime: 1 });

export default mongoose.model("Ride", RideSchema);
