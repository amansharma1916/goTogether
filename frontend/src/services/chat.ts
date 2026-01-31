import apiClient from './api';

export interface Message {
  _id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  messageType: 'text' | 'system' | 'location';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export const chatService = {
  // Send message via REST (for backup)
  sendMessage: async (
    bookingId: string,
    recipientId: string,
    messageText: string,
    messageType: string = 'text'
  ) => {
    return apiClient.post('/messages/send', {
      bookingId,
      recipientId,
      messageText,
      messageType
    });
  },

  // Get chat history
  getChatHistory: async (bookingId: string, page: number = 1, limit: number = 20) => {
    return apiClient.get(`/messages/history/${bookingId}`, {
      params: { page, limit }
    });
  },

  // Mark messages as read
  markMessagesAsRead: async (bookingId: string) => {
    return apiClient.patch(`/messages/${bookingId}/mark-read`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return apiClient.get('/messages/unread/count');
  },

  // Delete message
  deleteMessage: async (messageId: string) => {
    return apiClient.delete(`/messages/${messageId}`);
  }
};

export default chatService;
