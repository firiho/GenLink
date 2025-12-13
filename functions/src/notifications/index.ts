import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { config } from "../config";
import { v4 as uuidv4 } from "uuid";

// Types (mirroring src/types/notification.ts for backend usage)
export type NotificationType = 
  | "info"
  | "success"
  | "warning"
  | "error"
  | "invite"
  | "achievement"
  | "update";

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

interface NotificationRequest {
  action: "get" | "markRead" | "markAllRead" | "delete" | "getPreferences" | "updatePreferences" | "setForUsers";
  notificationId?: string;
  preferences?: NotificationPreferences;
  userIds?: string[];
  notificationData?: Omit<Notification, "id" | "createdAt" | "read">;
}

/**
 * Centralized Notifications Function
 * Handles getting and managing notifications for the authenticated user.
 */
export const notifications = onCall({ region: config.region }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = request.auth.uid;
  const data = request.data as NotificationRequest;
  const db = admin.firestore();
  const docRef = db.collection("notifications").doc(uid);

  try {
    if (data.action === "get") {
      const doc = await docRef.get();
      if (!doc.exists) {
        return { items: [], unreadCount: 0, preferences: {} };
      }
      const docData = doc.data();
      const items = (docData?.items || []) as Notification[];
      const preferences = (docData?.preferences || {}) as NotificationPreferences;
      const unreadCount = items.filter(n => !n.read).length;
      return { items, unreadCount, preferences };
    }

    if (data.action === "getPreferences") {
      const doc = await docRef.get();
      if (!doc.exists) {
        return { preferences: {} };
      }
      const preferences = (doc.data()?.preferences || {}) as NotificationPreferences;
      return { preferences };
    }

    if (data.action === "updatePreferences") {
      if (!data.preferences) {
        throw new HttpsError("invalid-argument", "Preferences are required for updatePreferences action.");
      }

      await docRef.set({ preferences: data.preferences }, { merge: true });
      return { success: true };
    }

    if (data.action === "markRead") {
      if (!data.notificationId) {
        throw new HttpsError("invalid-argument", "Notification ID is required for markRead action.");
      }
      
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) return;

        const items = (doc.data()?.items || []) as Notification[];
        const updatedItems = items.map(item => 
          item.id === data.notificationId ? { ...item, read: true } : item
        );

        transaction.update(docRef, { items: updatedItems });
      });
      
      return { success: true };
    }

    if (data.action === "markAllRead") {
      await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        if (!doc.exists) return;

        const items = (doc.data()?.items || []) as Notification[];
        const updatedItems = items.map(item => ({ ...item, read: true }));

        transaction.update(docRef, { items: updatedItems });
      });
      
      return { success: true };
    }

    if (data.action === "delete") {
        if (!data.notificationId) {
            throw new HttpsError("invalid-argument", "Notification ID is required for delete action.");
        }

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) return;

            const items = (doc.data()?.items || []) as Notification[];
            const updatedItems = items.filter(item => item.id !== data.notificationId);

            transaction.update(docRef, { items: updatedItems });
        });

        return { success: true };
    }

    if (data.action === "setForUsers") {
      if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
        throw new HttpsError("invalid-argument", "userIds array is required for setForUsers action.");
      }
      if (!data.notificationData) {
        throw new HttpsError("invalid-argument", "notificationData is required for setForUsers action.");
      }

      // Create notifications for all specified users
      const results = await Promise.all(
        data.userIds.map(async (userId) => {
          try {
            await addNotification(userId, data.notificationData!);
            return { userId, success: true };
          } catch (error) {
            console.error(`Failed to add notification for user ${userId}:`, error);
            return { userId, success: false, error: error instanceof Error ? error.message : "Unknown error" };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return { 
        success: true, 
        results,
        successCount,
        failCount,
        total: data.userIds.length
      };
    }

    throw new HttpsError("invalid-argument", "Invalid action specified.");

  } catch (error) {
    console.error("Error in notifications function:", error);
    throw new HttpsError("internal", "An error occurred while processing the notification request.");
  }
});

/**
 * Helper function to add a notification to a user's list.
 * This is used by other Cloud Functions to send notifications.
 * It ensures the new notification is at the top of the list.
 */
export const addNotification = async (
  userId: string, 
  notificationData: Omit<Notification, "id" | "createdAt" | "read">
) => {
  const db = admin.firestore();
  const docRef = db.collection("notifications").doc(userId);
  
  const newNotification: Notification = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    read: false,
    ...notificationData
  };

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      let items: Notification[] = [];
      
      if (doc.exists) {
        items = (doc.data()?.items || []) as Notification[];
      }

      // Add new notification to the top
      items.unshift(newNotification);

      // Optional: Limit the number of notifications to prevent document size issues (e.g., keep last 100)
      if (items.length > 100) {
        items = items.slice(0, 100);
      }

      transaction.set(docRef, { items }, { merge: true });
    });
    
    return newNotification;
  } catch (error) {
    console.error(`Failed to add notification for user ${userId}:`, error);
    throw error;
  }
};
