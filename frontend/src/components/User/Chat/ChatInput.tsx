import React, { useState, useRef } from 'react';
import { useChatContext } from '../../../context/ChatContext';

interface ChatInputProps {
  bookingId: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ bookingId }) => {
  const { sendMessage, setIsTyping } = useChatContext();
  const [messageText, setMessageText] = useState('');
  const [isTyping, setLocalIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessageText(text);

    // Auto-adjust textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }

    // Typing indicator
    if (!isTyping) {
      setLocalIsTyping(true);
      setIsTyping(true, bookingId);
    }

    // Reset typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setLocalIsTyping(false);
      setIsTyping(false, bookingId);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      return;
    }

    if (messageText.length > 500) {
      alert('Message exceeds 500 character limit');
      return;
    }

    sendMessage(bookingId, messageText.trim());
    setMessageText('');
    setLocalIsTyping(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false, bookingId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type your message..."
          value={messageText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          maxLength={500}
          rows={1}
        />

        {messageText.length > 450 && (
          <div className="character-counter">
            {messageText.length}/500
          </div>
        )}

        <button
          className={`send-button ${messageText.trim() ? 'active' : 'disabled'}`}
          onClick={handleSendMessage}
          disabled={!messageText.trim()}
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
