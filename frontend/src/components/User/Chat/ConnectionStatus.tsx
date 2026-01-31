import React from 'react';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'offline';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  if (status === 'connected') {
    return null; // Don't show when connected
  }

  const statusConfig = {
    connecting: {
      icon: '⟳',
      text: 'Connecting...',
      color: 'amber',
      animate: true
    },
    disconnected: {
      icon: '⊗',
      text: 'Disconnected',
      color: 'gray',
      animate: false
    },
    offline: {
      icon: '⊗',
      text: 'Offline',
      color: 'red',
      animate: false
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`connection-status ${config.color} ${config.animate ? 'animate' : ''}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.text}</span>
    </div>
  );
};

export default ConnectionStatus;
