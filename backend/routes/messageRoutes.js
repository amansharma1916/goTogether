import express from "express";
import {
  createMessage,
  getChatHistory,
  markMessagesAsRead,
  getUnreadCount,
  deleteMessage
} from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Send a message
router.post("/send", createMessage);

// Get chat history for a booking
router.get("/history/:bookingId", getChatHistory);

// Mark messages as read for a booking
router.patch("/:bookingId/mark-read", markMessagesAsRead);

// Get unread message count
router.get("/unread/count", getUnreadCount);

// Delete a message
router.delete("/:messageId", deleteMessage);

export default router;
