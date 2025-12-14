import mongoose, { Schema } from "mongoose";




const PointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point"
  },
  coordinates: {
    type: [Number], 
    required: true
  }
});




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

    
    riderNotes: {
      type: String,
      maxlength: 500,
      default: ""
    },

    
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
    timestamps: true 
  }
);






BookedRideSchema.index({ riderId: 1, status: 1 });


BookedRideSchema.index({ driverId: 1, status: 1 });


BookedRideSchema.index({ rideId: 1, status: 1 });


BookedRideSchema.index({ bookedAt: -1 });


BookedRideSchema.index({ pickupLocation: "2dsphere" });






BookedRideSchema.methods.calculateRefundAmount = function() {
  if (this.status !== 'cancelled') return 0;
  if (this.payment.paymentStatus !== 'paid') return 0;
  return this.payment.totalAmount; 
};






BookedRideSchema.statics.findActiveBookingsForRide = function(rideId) {
  return this.find({
    rideId: rideId,
    status: { $in: ['pending', 'confirmed'] }
  }).populate('riderId', 'fullName email phone');
};


BookedRideSchema.statics.findUserBookings = function(userId, status = null) {
  const query = { riderId: userId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('rideId')
    .populate('driverId', 'fullName email phone')
    .sort({ bookedAt: -1 });
};


BookedRideSchema.statics.findDriverBookings = function(driverId, status = null) {
  const query = { driverId: driverId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('rideId')
    .populate('riderId', 'fullName email phone')
    .sort({ bookedAt: -1 });
};



BookedRideSchema.pre('save', function() {
  
  if (this.isModified('status') && this.status === 'confirmed' && !this.confirmedAt) {
    this.confirmedAt = new Date();
  }
  
  
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancellation.cancelledAt) {
    this.cancellation.cancelledAt = new Date();
  }
});





const BookedRide = mongoose.model("BookedRide", BookedRideSchema);

export default BookedRide;
