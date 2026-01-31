import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ConnectionStatus from './ConnectionStatus';
import '../../../Styles/User/Chat/ChatWindow.css';
import '../../../Styles/User/Chat/ChatHeader.css';
import '../../../Styles/User/Chat/MessageList.css';
import '../../../Styles/User/Chat/ChatInput.css';

interface ChatWindowProps {
  onClose?: () => void;
  isMobile?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, isMobile = false }) => {
  const { activeRoom, connectionStatus, isConnected } = useChatContext();
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages.length]);

  if (!activeRoom || !showChat) {
    return null;
  }

  const handleClose = () => {
    setShowChat(false);
    onClose?.();
  };

  return (
    <div className={`chat-window ${isMobile ? 'chat-mobile' : 'chat-desktop'}`}>
      <ConnectionStatus status={connectionStatus} />
      
      <ChatHeader
        otherPartyName={activeRoom.otherPartyName}
        otherPartyPhone={activeRoom.otherPartyPhone}
        isOnline={isConnected}
        onClose={handleClose}
      />

      <MessageList
        messages={activeRoom.messages}
        isTyping={activeRoom.isTyping}
        isLoading={activeRoom.isLoading}
        error={activeRoom.error}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
      />

      {isConnected ? (
        <ChatInput bookingId={activeRoom.bookingId} />
      ) : (
        <div className="chat-offline-notice">
          <span>You are offline. Messages will be sent when connection is restored.</span>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
