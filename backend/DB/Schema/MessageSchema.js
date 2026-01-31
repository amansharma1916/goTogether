import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "BookedRide",
      required: true,
      index: true
    },
    rideId: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
      required: false
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true
    },
    senderName: {
      type: String,
      required: true
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      index: true
    },
    messageText: {
      type: String,
      required: true,
      maxlength: 500
    },
    messageType: {
      type: String,
      enum: ["text", "system", "location"],
      default: "text"
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      required: false
    },
    attachments: {
      type: Array,
      default: []
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fetching chat history
MessageSchema.index({ bookingId: 1, createdAt: -1 });

// Index for finding unread messages
MessageSchema.index({ recipientId: 1, isRead: 1, bookingId: 1 });

const Message = mongoose.model("Message", MessageSchema);

export default Message;
