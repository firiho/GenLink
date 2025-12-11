import { onCall, HttpsError } from "firebase-functions/v2/https";
import { config } from "../config";
import { addNotification } from "../notifications";

interface SupportNotificationRequest {
  ticketId: string;
  userId: string;
  subject: string;
}

/**
 * Callable function to send a notification when an admin responds to a support ticket.
 */
export const support = onCall({ region: config.region }, async (request) => {
  // Verify the caller is authenticated
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be authenticated.");
  }

  const data = request.data as SupportNotificationRequest;

  if (!data.ticketId || !data.userId || !data.subject) {
    throw new HttpsError("invalid-argument", "ticketId, userId, and subject are required.");
  }

  try {
    await addNotification(data.userId, {
      type: "info",
      title: "New Support Response",
      message: `You have a new response on your ticket: "${data.subject}"`,
      link: "/help",
      actionLabel: "View Message",
      metadata: {
        ticketId: data.ticketId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending support notification:", error);
    throw new HttpsError("internal", "Failed to send notification.");
  }
});
