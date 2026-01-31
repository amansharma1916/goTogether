import { createContext, useContext } from 'react';

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

export interface ChatRoom {
  bookingId: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyPhone?: string;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

export interface ChatContextValue {
  // Active chat
  activeRoom: ChatRoom | null;
  
  // Chat rooms list
  chatRooms: Map<string, ChatRoom>;
  totalUnread: number;
  
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'offline';
  
  // Actions
  openChat: (bookingId: string, otherPartyId: string, otherPartyName: string, otherPartyPhone?: string) => void;
  closeChat: () => void;
  sendMessage: (bookingId: string, messageText: string) => void;
  markAsRead: (bookingId: string) => void;
  
  // Status
  isTyping: boolean;
  setIsTyping: (isTyping: boolean, bookingId: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export default ChatContext;
