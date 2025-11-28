export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'invite'
  | 'achievement'
  | 'update';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  actionLabel?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  teamInvites: boolean;
  challengeUpdates: boolean;
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  preferences?: NotificationPreferences;
}
