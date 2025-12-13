import mongoose, { Schema } from "mongoose";

// ----------------------
// GeoJSON Point Schema for pickup location
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

// ----------------------
// Booked Ride Schema
// ----------------------
const BookedRideSchema = new Schema(
  {
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: true
    },
    
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true
    },

    driverId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true
    },

    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    pickupLocation: {
      type: PointSchema,
      required: true
    },

    pickupLocationName: {
      type: String,
      required: false
    },

    meetingPoint: {
      type: PointSchema,
      required: false
    },

    distanceToMeetingPoint: {
      type: Number,
      required: false
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending"
    },

    payment: {
      totalAmount: {
        type: Number,
        required: true
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending"
      },
      paymentMethod: {
        type: String,
        enum: ["cash", "card", "upi", "wallet"],
        default: "cash"
      },
      transactionId: {
        type: String,
        required: false
      },
      paidAt: {
        type: Date,
        required: false
      }
    },

    // Rider's special requests or notes
    riderNotes: {
      type: String,
      maxlength: 500,
      default: ""
    },

    // Cancellation information
    cancellation: {
      cancelledBy: {
        type: String,
        enum: ["rider", "driver", "system"],
        required: false
      },
      cancellationReason: {
        type: String,
        maxlength: 500,
        required: false
      },
      cancelledAt: {
        type: Date,
        required: false
      }
    },

    // Rating and review (after ride completion)
    rating: {
      ratingForDriver: {
        type: Number,
        min: 1,
        max: 5,
        required: false
      },
      reviewForDriver: {
        type: String,
        maxlength: 500,
        required: false
      },
      ratedAt: {
        type: Date,
        required: false
      }
    },

    // Timestamps for booking lifecycle
    bookedAt: {
      type: Date,
      default: Date.now
    },

    confirmedAt: {
      type: Date,
      required: false
    },

    completedAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// ----------------------
// Indexes for better query performance
// ----------------------

// Index for finding bookings by rider
BookedRideSchema.index({ riderId: 1, status: 1 });

// Index for finding bookings by driver
BookedRideSchema.index({ driverId: 1, status: 1 });

// Index for finding bookings by ride
BookedRideSchema.index({ rideId: 1, status: 1 });

// Index for finding bookings by booking date
BookedRideSchema.index({ bookedAt: -1 });

// Geospatial index for pickup location
BookedRideSchema.index({ pickupLocation: "2dsphere" });

// ----------------------
// Instance Methods
// ----------------------

// Calculate refund amount based on cancellation time
BookedRideSchema.methods.calculateRefundAmount = function() {
  if (this.status !== 'cancelled') return 0;
  if (this.payment.paymentStatus !== 'paid') return 0;

  // Example refund policy:
  // - More than 24 hours before ride: 100% refund
  // - 12-24 hours before ride: 50% refund
  // - Less than 12 hours: No refund
  
  // This would need the ride's departure time, so you'd need to populate rideId first
  return this.payment.totalAmount; // Placeholder
};

// ----------------------
// Static Methods
// ----------------------

// Find active bookings for a ride
BookedRideSchema.statics.findActiveBookingsForRide = function(rideId) {
  return this.find({
    rideId: rideId,
    status: { $in: ['pending', 'confirmed'] }
  }).populate('riderId', 'fullName email phone');
};

// Find user's booking history
BookedRideSchema.statics.findUserBookings = function(userId, status = null) {
  const query = { riderId: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('rideId')
    .populate('driverId', 'fullName email phone')
    .sort({ bookedAt: -1 });
};

// Find driver's received bookings
BookedRideSchema.statics.findDriverBookings = function(driverId, status = null) {
  const query = { driverId: driverId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('rideId')
    .populate('riderId', 'fullName email phone')
    .sort({ bookedAt: -1 });
};

// ----------------------
// Pre-save Middleware
// ----------------------

BookedRideSchema.pre('save', function() {
  // Set confirmed timestamp when status changes to confirmed
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  // Set completed timestamp when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Set cancellation timestamp when status changes to cancelled
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancellation.cancelledAt) {
    this.cancellation.cancelledAt = new Date();
  }
});

// ----------------------
// Export Model
// ----------------------

const BookedRide = mongoose.model("BookedRide", BookedRideSchema);

export default BookedRide;
