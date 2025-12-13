import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { Notification, NotificationState, NotificationPreferences } from '@/types/notification';

const notificationsFunction = httpsCallable(functions, 'notifications');

interface NotificationRequest {
  action: 'get' | 'markRead' | 'markAllRead' | 'delete' | 'getPreferences' | 'updatePreferences' | 'setForUsers';
  notificationId?: string;
  preferences?: NotificationPreferences;
  userIds?: string[];
  notificationData?: Omit<Notification, 'id' | 'createdAt' | 'read'>;
}

interface NotificationResponse {
  items?: Notification[];
  unreadCount?: number;
  preferences?: NotificationPreferences;
  success?: boolean;
  results?: Array<{ userId: string; success: boolean; error?: string }>;
  successCount?: number;
  failCount?: number;
  total?: number;
}

/**
 * Centralized Notifications Function
 * Calls the 'notifications' Cloud Function to manage user notifications.
 */
export const notifications = async (request: NotificationRequest): Promise<NotificationResponse> => {
  try {
    const result = await notificationsFunction(request);
    return result.data as NotificationResponse;
  } catch (error) {
    console.error('Error calling notifications function:', error);
    throw error;
  }
};

// Helper methods for easier usage
export const getNotifications = async (): Promise<NotificationState> => {
  const result = await notifications({ action: 'get' });
  return {
    items: result.items || [],
    unreadCount: result.unreadCount || 0,
    preferences: result.preferences
  };
};

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const result = await notifications({ action: 'getPreferences' });
  return result.preferences || {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    teamInvites: true,
    challengeUpdates: true
  };
};

export const updateNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  await notifications({ action: 'updatePreferences', preferences });
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await notifications({ action: 'markRead', notificationId });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await notifications({ action: 'markAllRead' });
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
    await notifications({ action: 'delete', notificationId });
};

/**
 * Set notifications for multiple users
 * Useful for team messages, announcements, etc.
 */
export const setNotificationsForUsers = async (
  userIds: string[],
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<NotificationResponse> => {
  return await notifications({ 
    action: 'setForUsers', 
    userIds,
    notificationData 
  });
};
