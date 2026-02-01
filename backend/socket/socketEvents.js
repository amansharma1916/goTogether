import Message from "../DB/Schema/MessageSchema.js";
import BookedRide from "../DB/Schema/BookedRideSchema.js";

export const setupSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

     
    socket.on("join_room", async (data) => {
      try {
        const { bookingId } = data;
        const userId = socket.userId;

         
        const booking = await BookedRide.findById(bookingId);
        if (!booking) {
          socket.emit("error", { message: "Booking not found" });
          return;
        }

        const isParticipant =
          booking.riderId.toString() === userId || booking.driverId.toString() === userId;

        if (!isParticipant) {
          socket.emit("error", { message: "Not authorized for this booking" });
          return;
        }

         
        const roomName = `booking_${bookingId}`;
        socket.join(roomName);
        socket.currentRoom = roomName;
        socket.currentBookingId = bookingId;

         
        await Message.updateMany(
          {
            bookingId,
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

         
        const booking = await BookedRide.findById(bookingId).populate("riderId driverId");
        if (!booking) {
          socket.emit("error", { message: "Booking not found" });
          return;
        }

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
          bookingId,
          rideId: booking.rideId,
          senderId,
          senderName,
          recipientId,
          messageText: messageText.trim(),
          messageType
        });

        await message.save();

        const roomName = `booking_${bookingId}`;
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

     socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);

      if (socket.currentRoom) {
        const roomName = socket.currentRoom;
        io.to(roomName).emit("user_disconnected", {
          userId: socket.userId
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
