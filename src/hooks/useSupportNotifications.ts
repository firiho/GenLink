import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToTickets } from "@/services/supportService";
import { SupportTicket } from "@/types/support";

interface UseSupportNotificationsReturn {
  unreadCount: number;
  hasUnread: boolean;
  tickets: SupportTicket[];
  openTicketsCount: number;
}

/**
 * Hook to monitor support ticket notifications for the current user.
 * This runs even when the support chat is closed to track new admin responses.
 */
export function useSupportNotifications(): UseSupportNotificationsReturn {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousUnreadRef = useRef(0);

  // Subscribe to user's tickets - always active when user is logged in
  useEffect(() => {
    if (!user) {
      setTickets([]);
      setUnreadCount(0);
      previousUnreadRef.current = 0;
      return;
    }

    const unsubscribe = subscribeToTickets((updatedTickets) => {
      setTickets(updatedTickets);

      // Count tickets with unread messages from admin
      const unread = updatedTickets.filter(
        (ticket) => ticket.unreadByUser && ticket.status !== "closed"
      ).length;
      
      // Show browser notification for new messages if permission granted
      if (
        unread > previousUnreadRef.current &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("GenLink Support", {
          body: "You have a new response from support!",
          icon: "/favicons/favicon-32x32.png",
          tag: "support-notification", // Prevents duplicate notifications
        });
      }

      previousUnreadRef.current = unread;
      setUnreadCount(unread);
    }, user.id);

    return () => unsubscribe();
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if (
      user &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      // Only request if user has interacted with support before
      // We can check this by seeing if they have any tickets
      if (tickets.length > 0) {
        Notification.requestPermission();
      }
    }
  }, [user, tickets.length]);

  const openTicketsCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  ).length;

  return {
    unreadCount,
    hasUnread: unreadCount > 0,
    tickets,
    openTicketsCount,
  };
}
