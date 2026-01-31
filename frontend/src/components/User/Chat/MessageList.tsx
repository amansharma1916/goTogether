import React from 'react';
import type { Message } from '../../../context/ChatContext';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isTyping,
  isLoading,
  error,
  messagesEndRef
}) => {
  // Get current user from localStorage
  const userStr = localStorage.getItem('LoggedInUser');
  const currentUserId = userStr ? JSON.parse(userStr).id : null;

  if (isLoading) {
    return (
      <div className="messages-container loading">
        <div className="loader-spinner">
          <div className="bounce"></div>
          <div className="bounce"></div>
          <div className="bounce"></div>
        </div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-container error">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="messages-container empty">
        <div className="empty-state">
          <span className="empty-icon">💬</span>
          <p>No messages yet</p>
          <p className="empty-subtitle">Say hello to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">💬</span>
          <p>No messages yet</p>
        </div>
      ) : (
        <>
          {messages.map((message) => {
            const isSent = message.senderId === currentUserId;

            if (message.messageType === 'system') {
              return (
                <div key={message._id} className="message-system">
                  <p>{message.messageText}</p>
                  <span className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message._id}
                className={`message-group ${isSent ? 'sent' : 'received'}`}
              >
                {!isSent && (
                  <div className="message-avatar">
                    <div className="avatar-placeholder">
                      {message.senderName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                  </div>
                )}

                <div className="message-bubble">
                  <p className="message-text">{message.messageText}</p>
                  <div className="message-footer">
                    <span className="message-time">
                      {new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isSent && (
                      <span className={`read-status ${message.isRead ? 'read' : 'sent'}`}>
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && <TypingIndicator />}
        </>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
