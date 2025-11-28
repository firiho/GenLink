import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead as serviceMarkAllRead, deleteNotification as serviceDelete, updateNotificationPreferences as serviceUpdatePreferences } from '@/services/notificationService';
import { Notification, NotificationState, NotificationPreferences } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  updatePreferences: (prefs: NotificationPreferences) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setPreferences(null);
        setLoading(false);
        return;
    }

    try {
      const { items, unreadCount, preferences } = await getNotifications();
      setNotifications(items);
      setUnreadCount(unreadCount);
      if (preferences) setPreferences(preferences);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // Revert on error would be complex, assuming success for now or could refetch
      await fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await serviceMarkAllRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      await fetchNotifications();
    }
  };

  const removeNotification = async (id: string) => {
    // Optimistic update
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await serviceDelete(id);
    } catch (err) {
      console.error('Failed to delete notification:', err);
      await fetchNotifications();
    }
  };

  const updatePreferences = async (prefs: NotificationPreferences) => {
    setPreferences(prefs);
    try {
      await serviceUpdatePreferences(prefs);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      await fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      preferences,
      loading,
      error,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      updatePreferences
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
