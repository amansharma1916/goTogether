import Message from "../DB/Schema/MessageSchema.js";
import { isRideToday } from "../utils/dateHelpers.js";
import { findBookingByIdOrCode } from "../utils/bookingLookup.js";
import {
  validateDriverLocationTracking,
  validateRiderLocationTracking,
  validateDriverAuthorization
} from "../utils/authorizationHelpers.js";
import {
  validateCoordinates,
  calculateDistance,
  estimateETA,
  extractCoordinatesFromGeoJSON
} from "../utils/locationHelpers.js";

// Helper function to validate coordinates
// Moved to locationHelpers.js but keeping reference for coordinate format
const isValidCoordinates = (latitude, longitude) => {
  const validation = validateCoordinates(latitude, longitude);
  return validation.isValid;
};

export const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

     
    socket.on("join_room", async (data) => {
      try {
        const { bookingId } = data;
        const userId = socket.userId;

         
        const booking = await findBookingByIdOrCode(bookingId);
        if (!booking) {
          socket.emit("error", { message: "Booking not found" });
          return;
        }

        const bookingKey = booking.bookingCode || booking._id.toString();
        const bookingDbId = booking._id.toString();

        const isParticipant =
          booking.riderId.toString() === userId || booking.driverId.toString() === userId;

        if (!isParticipant) {
          socket.emit("error", { message: "Not authorized for this booking" });
          return;
        }

         
        const roomName = `booking_${bookingKey}`;
        socket.join(roomName);
        socket.currentRoom = roomName;
        socket.currentBookingId = bookingKey;

         
        await Message.updateMany(
          {
            bookingId: bookingDbId,
            recipientId: userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: new Date()
          }
        );

         
        io.to(roomName).emit("user_joined", {
          userId,
          roomName
        });

        socket.emit("room_joined", { success: true, roomName });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Error joining room" });
      }
    });
 
    socket.on("send_message", async (data) => {
      try {
        const { bookingId, recipientId, messageText, messageType = "text" } = data;
        const senderId = socket.userId;

        if (!messageText || messageText.trim().length === 0) {
          socket.emit("error", { message: "Message cannot be empty" });
          return;
        }

        if (messageText.length > 500) {
          socket.emit("error", { message: "Message exceeds 500 character limit" });
          return;
        }

         
        const booking = await findBookingByIdOrCode(bookingId, ["riderId", "driverId"]);
        if (!booking) {
          socket.emit("error", { message: "Booking not found" });
          return;
        }

        const bookingKey = booking.bookingCode || booking._id.toString();

         let senderName = "";
        if (booking.riderId._id.toString() === senderId) {
          senderName = booking.riderId.fullname;
        } else if (booking.driverId._id.toString() === senderId) {
          senderName = booking.driverId.fullname;
        } else {
          socket.emit("error", { message: "Not authorized for this booking" });
          return;
        }

        const message = new Message({
          bookingId: booking._id,
          rideId: booking.rideId,
          senderId,
          senderName,
          recipientId,
          messageText: messageText.trim(),
          messageType
        });

        await message.save();

        const roomName = `booking_${bookingKey}`;
        io.to(roomName).emit("new_message", {
          _id: message._id,
          senderId,
          senderName,
          messageText: message.messageText,
          messageType,
          timestamp: message.createdAt,
          isRead: false
        });

        socket.emit("message_sent", { messageId: message._id, success: true });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Error sending message" });
      }
    });

     socket.on("typing", (data) => {
      try {
        const { bookingId } = data;
        const roomName = `booking_${bookingId}`;
        const userId = socket.userId;

        socket.to(roomName).emit("user_typing", {
          userId
        });
      } catch (error) {
        console.error("Error typing event:", error);
      }
    });

     socket.on("stop_typing", (data) => {
      try {
        const { bookingId } = data;
        const roomName = `booking_${bookingId}`;
        const userId = socket.userId;

        socket.to(roomName).emit("user_stopped_typing", {
          userId
        });
      } catch (error) {
        console.error("Error stop typing event:", error);
      }
    });

     socket.on("mark_read", async (data) => {
      try {
        const { messageId, bookingId } = data;
        const userId = socket.userId;

         const message = await Message.findByIdAndUpdate(
          messageId,
          { isRead: true, readAt: new Date() },
          { new: true }
        );

        if (message) {
          const roomName = `booking_${bookingId}`;
          io.to(roomName).emit("message_read", {
            messageId,
            readAt: message.readAt
          });
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

     socket.on("leave_room", (data) => {
      try {
        const { bookingId } = data;
        const roomName = `booking_${bookingId}`;

        socket.leave(roomName);
        socket.currentRoom = null;
        socket.currentBookingId = null;

        io.to(roomName).emit("user_left", {
          userId: socket.userId
        });
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // ===== LOCATION TRACKING EVENTS =====

    // Driver starts sharing location
    socket.on("driver_share_location", async (data) => {
      try {
        const { bookingId } = data;
        const driverId = socket.userId;

        // Comprehensive authorization check
        const authCheck = await validateDriverLocationTracking(bookingId, driverId);
        if (!authCheck.isAuthorized) {
          socket.emit("error", { message: authCheck.error });
          return;
        }

        const booking = authCheck.booking;

        // Join tracking room if not already there
        const trackingRoomName = `tracking_${bookingId}`;
        socket.join(trackingRoomName);
        socket.trackingBookingId = bookingId;

        // Notify rider that driver has started sharing location
        io.to(trackingRoomName).emit("driver_location_sharing_started", {
          bookingId,
          driverId,
          driverName: booking.driverId.fullname,
          timestamp: new Date()
        });

        socket.emit("location_sharing_started", { success: true, bookingId });
        console.log(`Driver ${driverId} started sharing location for booking ${bookingId}`);
      } catch (error) {
        console.error("Error starting location sharing:", error);
        socket.emit("error", { message: "Error starting location sharing" });
      }
    });

    // Driver sends location update
    socket.on("driver_location_update", async (data) => {
      try {
        const { bookingId, latitude, longitude, accuracy, timestamp } = data;
        const driverId = socket.userId;

        // Validate coordinates using centralized helper
        const coordinateValidation = validateCoordinates(latitude, longitude);
        if (!coordinateValidation.isValid) {
          socket.emit("error", { message: coordinateValidation.error });
          return;
        }

        // Comprehensive authorization check
        const authCheck = await validateDriverLocationTracking(bookingId, driverId);
        if (!authCheck.isAuthorized) {
          socket.emit("error", { message: authCheck.error });
          return;
        }

        const booking = authCheck.booking;

        // Extract destination coordinates from booking
        const destCoords = extractCoordinatesFromGeoJSON(booking.rideId.destination);
        if (destCoords.error) {
          socket.emit("error", { message: "Could not extract destination coordinates" });
          return;
        }

        // Calculate ETA based on current location and destination
        const etaData = estimateETA(
          latitude,
          longitude,
          [destCoords.longitude, destCoords.latitude]
        );

        // Broadcast location and ETA to rider in tracking room
        const trackingRoomName = `tracking_${bookingId}`;
        io.to(trackingRoomName).emit("driver_location_updated", {
          bookingId,
          driverId,
          latitude,
          longitude,
          accuracy,
          etaMinutes: etaData.etaMinutes,
          distanceKm: etaData.distanceKm,
          timestamp: timestamp || new Date()
        });

        socket.emit("location_update_sent", { success: true });
        console.log(
          `Driver ${driverId} location updated - ETA: ${etaData.etaMinutes} mins`
        );
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", { message: "Error updating location" });
      }
    });

    // Driver stops sharing location
    socket.on("driver_stop_sharing_location", async (data) => {
      try {
        const { bookingId } = data;
        const driverId = socket.userId;

        // Verify driver authorization
        const authCheck = await validateDriverAuthorization(bookingId, driverId);
        if (!authCheck.isValid) {
          socket.emit("error", { message: authCheck.error });
          return;
        }

        const trackingRoomName = `tracking_${bookingId}`;

        // Notify rider that driver stopped sharing
        io.to(trackingRoomName).emit("driver_location_sharing_stopped", {
          bookingId,
          driverId,
          timestamp: new Date()
        });

        // Leave tracking room
        socket.leave(trackingRoomName);
        socket.trackingBookingId = null;

        socket.emit("location_sharing_stopped", { success: true, bookingId });
        console.log(`Driver ${driverId} stopped sharing location for booking ${bookingId}`);
      } catch (error) {
        console.error("Error stopping location sharing:", error);
        socket.emit("error", { message: "Error stopping location sharing" });
      }
    });

    // Rider requests location update (optional - can request if driver hasn't sent update recently)
    socket.on("rider_request_location", async (data) => {
      try {
        const { bookingId } = data;
        const riderId = socket.userId;

        // Verify rider authorization
        const authCheck = await validateRiderLocationTracking(bookingId, riderId);
        if (!authCheck.isAuthorized) {
          socket.emit("error", { message: authCheck.error });
          return;
        }

        const trackingRoomName = `tracking_${bookingId}`;

        // Send notification to driver
        io.to(trackingRoomName).emit("location_requested", {
          bookingId,
          riderId,
          timestamp: new Date()
        });

        socket.emit("location_request_sent", { success: true });
      } catch (error) {
        console.error("Error requesting location:", error);
        socket.emit("error", { message: "Error requesting location" });
      }
    });

    // Rider joins tracking room to receive driver updates
    socket.on("rider_join_tracking", async (data) => {
      try {
        const { bookingId } = data;
        const riderId = socket.userId;

        // Verify rider authorization
        const authCheck = await validateRiderLocationTracking(bookingId, riderId);
        if (!authCheck.isAuthorized) {
          socket.emit("error", { message: authCheck.error });
          return;
        }

        const trackingRoomName = `tracking_${bookingId}`;
        socket.join(trackingRoomName);
        socket.trackingBookingId = bookingId;

        socket.emit("tracking_room_joined", { success: true, bookingId });
        console.log(`Rider ${riderId} joined tracking room for booking ${bookingId}`);
      } catch (error) {
        console.error("Error joining tracking room:", error);
        socket.emit("error", { message: "Error joining tracking room" });
      }
    });

    // Rider leaves tracking room
    socket.on("rider_leave_tracking", async (data) => {
      try {
        const { bookingId } = data;
        const riderId = socket.userId;

        const trackingRoomName = `tracking_${bookingId}`;
        socket.leave(trackingRoomName);

        if (socket.trackingBookingId === bookingId) {
          socket.trackingBookingId = null;
        }

        socket.emit("tracking_room_left", { success: true, bookingId });
        console.log(`Rider ${riderId} left tracking room for booking ${bookingId}`);
      } catch (error) {
        console.error("Error leaving tracking room:", error);
        socket.emit("error", { message: "Error leaving tracking room" });
      }
    });

    // ===== END LOCATION TRACKING EVENTS =====

     socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);

      if (socket.currentRoom) {
        const roomName = socket.currentRoom;
        io.to(roomName).emit("user_disconnected", {
          userId: socket.userId
        });
      }

      // Notify tracking room if driver disconnected while sharing
      if (socket.trackingBookingId) {
        const trackingRoomName = `tracking_${socket.trackingBookingId}`;
        io.to(trackingRoomName).emit("driver_location_sharing_stopped", {
          bookingId: socket.trackingBookingId,
          driverId: socket.userId,
          reason: "driver_disconnected",
          timestamp: new Date()
        });
      }
    });

     socket.on("error", (error) => {
      console.error("Socket error:", error);
      socket.emit("error_response", { message: "An error occurred" });
    });
  });
};

export default setupSocketEvents;
