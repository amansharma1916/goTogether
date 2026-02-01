import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import ChatContext, { type ChatRoom, type Message, type ChatContextValue } from './ChatContext';
import { createSocket, getSocket, disconnectSocket, isSocketConnected } from '../services/socket';
import chatService from '../services/chat';

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<Map<string, ChatRoom>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'offline'>('disconnected');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [authUserStr, setAuthUserStr] = useState<string | null>(() => localStorage.getItem('LoggedInUser'));
  const authUser = authUserStr ? JSON.parse(authUserStr) : null;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextToken = localStorage.getItem('token');
      const nextUserStr = localStorage.getItem('LoggedInUser');

      if (nextToken !== authToken) {
        setAuthToken(nextToken);
      }

      if (nextUserStr !== authUserStr) {
        setAuthUserStr(nextUserStr);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authToken, authUserStr]);

   useEffect(() => {
    if (!authToken || !authUser) return;

    try {
      setConnectionStatus('connecting');
      const socket = createSocket(authToken);

      socket.on('connect', () => {
        console.log('Chat connected');
        setIsConnected(true);
        setConnectionStatus('connected');
      });

      socket.on('disconnect', () => {
        console.log('Chat disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionStatus('offline');
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      setConnectionStatus('offline');
    }
  }, [authToken, authUser]);

   const openChat = useCallback(
    async (
      bookingId: string,
      otherPartyId: string,
      otherPartyName: string,
      otherPartyPhone?: string
    ) => {
      const latestToken = localStorage.getItem('token') || authToken;
      if (!latestToken) {
        console.error('Missing auth token');
        return;
      }

      const socket = createSocket(latestToken);
      if (!socket || !isSocketConnected()) {
        console.error('Socket not connected');
        return;
      }

      try {
         const newRoom: ChatRoom = {
          bookingId,
          otherPartyId,
          otherPartyName,
          otherPartyPhone,
          messages: [],
          unreadCount: 0,
          isLoading: true,
          error: null,
          isTyping: false
        };

        setActiveRoom(newRoom);

         try {
          const response = await chatService.getChatHistory(bookingId, 1, 20);
          if (response.data.success) {
            newRoom.messages = response.data.data || [];
            newRoom.isLoading = false;
            setActiveRoom({ ...newRoom });
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          newRoom.isLoading = false;
          newRoom.error = 'Failed to load chat history';
          setActiveRoom({ ...newRoom });
        }

         socket.emit('join_room', { bookingId });

         setChatRooms((prev) => new Map(prev).set(bookingId, newRoom));

         try {
          await chatService.markMessagesAsRead(bookingId);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      } catch (error) {
        console.error('Error opening chat:', error);
      }
    },
    [authToken]
  );

   const closeChat = useCallback(() => {
      const socket = getSocket();
    if (socket && activeRoom?.bookingId) {
      socket.emit('leave_room', { bookingId: activeRoom.bookingId });
    }
    setActiveRoom(null);
    setIsTyping(false);
  }, [activeRoom?.bookingId]);

   const sendMessage = useCallback(
    (bookingId: string, messageText: string) => {
      const latestToken = localStorage.getItem('token') || authToken;
      if (!latestToken) {
        console.error('Missing auth token');
        return;
      }

      const socket = createSocket(latestToken);
      if (!socket || !isSocketConnected()) {
        console.error('Socket not connected');
        return;
      }

      const room = chatRooms.get(bookingId);
      if (!room) {
        console.error('Chat room not found');
        return;
      }

      socket.emit('send_message', {
        bookingId,
        recipientId: room.otherPartyId,
        messageText,
        messageType: 'text'
      });
    },
    [chatRooms, authToken]
  );

   const markAsRead = useCallback((bookingId: string) => {
    const socket = getSocket();
    if (socket && activeRoom?.bookingId === bookingId) {
     }
  }, [activeRoom?.bookingId]);

   const handleSetIsTyping = useCallback((typing: boolean, bookingId: string) => {
    const socket = getSocket();
    if (!socket) return;

    if (typing) {
      socket.emit('typing', { bookingId });
      setIsTyping(true);

       if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

       const timeout = setTimeout(() => {
        socket.emit('stop_typing', { bookingId });
        setIsTyping(false);
      }, 3000);

      setTypingTimeout(timeout);
    } else {
      socket.emit('stop_typing', { bookingId });
      setIsTyping(false);
    }
  }, [typingTimeout]);

   useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

     socket.on('new_message', (data: any) => {
      const { senderId, senderName, messageText, timestamp, isRead, _id, messageType } = data;
      
       chatRooms.forEach((_room, bookingId) => {
        const message: Message = {
          _id,
          bookingId,
          senderId,
          senderName,
          messageText,
          messageType,
          isRead,
          createdAt: timestamp
        };

        if (activeRoom?.bookingId === bookingId) {
          setActiveRoom((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          });
        }

         setChatRooms((prev) => {
          const updated = new Map(prev);
          const currentRoom = updated.get(bookingId);
          if (currentRoom) {
            updated.set(bookingId, {
              ...currentRoom,
              messages: [...currentRoom.messages, message]
            });
          }
          return updated;
        });
      });
    });

     socket.on('user_typing', (data: any) => {
      const { userId } = data;
      setActiveRoom((prev) => {
        if (!prev || prev.otherPartyId !== userId) return prev;
        return { ...prev, isTyping: true };
      });
    });

     socket.on('user_stopped_typing', (data: any) => {
      const { userId } = data;
      setActiveRoom((prev) => {
        if (!prev || prev.otherPartyId !== userId) return prev;
        return { ...prev, isTyping: false };
      });
    });

     socket.on('message_read', (data: any) => {
      const { messageId } = data;
      setActiveRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        };
      });
    });

     socket.on('user_joined', () => {
     });

     socket.on('room_joined', () => {
      setIsConnected(true);
    });

     socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      if (activeRoom) {
        setActiveRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            error: error.message || 'An error occurred'
          };
        });
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
      socket.off('message_read');
      socket.off('user_joined');
      socket.off('room_joined');
      socket.off('error');
    };
  }, [chatRooms, activeRoom?.bookingId, activeRoom?.otherPartyId, authToken]);

   useEffect(() => {
    if (!authToken || !authUser) {
      disconnectSocket();
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setActiveRoom(null);
      setChatRooms(new Map());
    }
  }, [authToken, authUser]);

  const value: ChatContextValue = {
    activeRoom,
    chatRooms,
    totalUnread: 0,
    isConnected,
    connectionStatus,
    openChat,
    closeChat,
    sendMessage,
    markAsRead,
    isTyping,
    setIsTyping: handleSetIsTyping
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
