import type { NotificationItem } from '../../../context/NotificationContext';
import '../../../Styles/User/Assets/Navbar.css';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onMarkAll: () => void;
  onRemove: (id: string) => void;
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};

const NotificationPanel = ({ notifications, onMarkAll, onRemove }: NotificationPanelProps) => {
  return (
    <div className="notification-panel">
      <div className="notification-panel__header">
        <div>
          <p className="notification-panel__title">Notifications</p>
          <p className="notification-panel__subtitle">Stay up to date with your rides</p>
        </div>
        <button className="notification-panel__mark-all" onClick={onMarkAll} disabled={!notifications.length}>
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-panel__empty">No notifications yet</div>
      ) : (
        <div className="notification-panel__list">
          {notifications.slice(0, 20).map((notification) => (
            <div key={notification.id} className={`notification-panel__item ${notification.read ? 'read' : 'unread'}`}>
              <div className={`notification-panel__badge notification-${notification.type}`} />
              <div className="notification-panel__content">
                <div className="notification-panel__row">
                  <p className="notification-panel__item-title">{notification.title}</p>
                  <span className="notification-panel__time">{formatTime(notification.timestamp)}</span>
                </div>
                <p className="notification-panel__message">{notification.message}</p>
              </div>
              <button
                className="notification-panel__dismiss"
                aria-label="Dismiss notification"
                onClick={() => onRemove(notification.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
