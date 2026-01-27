import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ReactNode = import('react').ReactNode;

export type NotificationKind = 'success' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationKind;
  timestamp: number;
  read: boolean;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (input: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { id?: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const LEGACY_STORAGE_KEY = 'GoTogetherNotifications';
const STORAGE_KEY_PREFIX = 'GoTogetherNotifications:';

function getUserIdentifier(): string | null {
  try {
    const raw = localStorage.getItem('LoggedInUser');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id ?? user?.email ?? null;
  } catch {
    return null;
  }
}

function getStorageKeyForUser(userId: string | null): string {
  return `${STORAGE_KEY_PREFIX}${userId ?? 'anonymous'}`;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [storageKey, setStorageKey] = useState<string>(() => getStorageKeyForUser(getUserIdentifier()));

  // Load on mount and whenever the user changes
  useEffect(() => {
    const uid = getUserIdentifier();
    setCurrentUserId(uid);
    const key = getStorageKeyForUser(uid);
    setStorageKey(key);

    try {
      // One-time legacy migration: move generic list into namespaced key for current user, if needed
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      const existing = localStorage.getItem(key);
      if (legacy && !existing) {
        localStorage.setItem(key, legacy);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationItem[];
        setNotifications(parsed);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // React to user changes via custom event or storage event (cross-tab)
  useEffect(() => {
    const handleUserChanged = () => {
      const uid = getUserIdentifier();
      setCurrentUserId(uid);
      const key = getStorageKeyForUser(uid);
      setStorageKey(key);
      try {
        const stored = localStorage.getItem(key);
        setNotifications(stored ? (JSON.parse(stored) as NotificationItem[]) : []);
      } catch {
        setNotifications([]);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'LoggedInUser') {
        handleUserChanged();
      }
      if (e.key === storageKey) {
        try {
          const stored = localStorage.getItem(storageKey);
          setNotifications(stored ? (JSON.parse(stored) as NotificationItem[]) : []);
        } catch {
          /* noop */
        }
      }
    };

    window.addEventListener('user-changed', handleUserChanged as EventListener);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('user-changed', handleUserChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, [storageKey]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    }
  }, [notifications, isInitialized, storageKey]);

  const addNotification: NotificationContextValue['addNotification'] = ({ id, title, message, type }) => {
    const newNotification: NotificationItem = {
      id: id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => setNotifications([]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification, clearNotifications }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
