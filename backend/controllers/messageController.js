import Message from "../DB/Schema/MessageSchema.js";
import { findBookingByIdOrCode } from "../utils/bookingLookup.js";

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { bookingId, recipientId, messageText, messageType = "text" } = req.body;
    const senderId = req.userId || req.user?.userId || req.user?.id || req.user?._id;

    if (!bookingId || !recipientId || !messageText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId, recipientId, messageText"
      });
    }

    if (messageText.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message exceeds 500 character limit"
      });
    }

    // Verify booking exists and user is part of it
    const booking = await findBookingByIdOrCode(bookingId, ["riderId", "driverId"]);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if user is rider or driver
    const isRider = booking.riderId._id.toString() === senderId;
    const isDriver = booking.driverId._id.toString() === senderId;
    console.log("isRider:", isRider, "isDriver:", isDriver);
    console.log("booking.riderId:", booking.riderId._id.toString(), "booking.driverId:", booking.driverId._id.toString(), "senderId:", senderId);
    console.log("Booking : ", booking);

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this booking"
      });
    }

    // Create message
    const message = new Message({
      bookingId: booking._id,
      rideId: booking.rideId,
      senderId,
      senderName: isRider ? booking.riderId.fullname : booking.driverId.fullname,
      recipientId,
      messageText,
      messageType
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message: " + error.message
    });
  }
};

// Get chat history for a booking
export const getChatHistory = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId || req.user?.userId || req.user?.id || req.user?._id;

    // Verify user is part of booking
    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const isRider = booking.riderId.toString() === userId;
    const isDriver = booking.driverId.toString() === userId;

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this chat"
      });
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({ bookingId: booking._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalMessages = await Message.countDocuments({ bookingId: booking._id });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Return in chronological order
      pagination: {
        total: totalMessages,
        pages: Math.ceil(totalMessages / limit),
        currentPage: page
      }
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chat history: " + error.message
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId || req.user?.userId || req.user?.id || req.user?._id;

    // Update all unread messages for this user in this booking
    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const result = await Message.updateMany(
      {
        bookingId: booking._id,
        recipientId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Error marking messages as read: " + error.message
    });
  }
};

// Get unread message count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId || req.user?.userId || req.user?.id || req.user?._id;

    const unreadCount = await Message.countDocuments({
      recipientId: userId,
      isRead: false
    });

    // Get unread messages grouped by booking
    const unreadByBooking = await Message.aggregate([
      {
        $match: {
          recipientId: userId,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$bookingId",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      totalUnread: unreadCount,
      unreadByBooking
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting unread count: " + error.message
    });
  }
};

// Delete a message (soft delete - just mark as deleted)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId || req.user?.userId || req.user?.id || req.user?._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Only sender can delete their own message
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages"
      });
    }

    await Message.findByIdAndUpdate(messageId, {
      messageText: "[Message deleted]",
      messageType: "system"
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message: " + error.message
    });
  }
};
