import React from 'react';

interface ChatHeaderProps {
  otherPartyName: string;
  otherPartyPhone?: string;
  isOnline: boolean;
  onClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  otherPartyName,
  otherPartyPhone,
  isOnline,
  onClose
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-content">
        <div className="chat-header-avatar">
          <div className="avatar-placeholder">
            {otherPartyName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <span className={`online-indicator ${isOnline ? 'online' : 'offline'}`}></span>
        </div>

        <div className="chat-header-info">
          <h3 className="other-party-name">{otherPartyName}</h3>
          <p className="online-status">{isOnline ? 'Online now' : 'Offline'}</p>
        </div>
      </div>

      <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
        ✕
      </button>
    </div>
  );
};

export default ChatHeader;
