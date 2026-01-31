import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="message-group received">
      <div className="message-avatar">
        <div className="avatar-placeholder">•••</div>
      </div>

      <div className="message-bubble typing">
        <div className="typing-indicator">
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
          <span className="typing-dot"></span>
        </div>
        <p className="typing-text">User is typing...</p>
      </div>
    </div>
  );
};

export default TypingIndicator;
