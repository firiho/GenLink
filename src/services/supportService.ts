import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
  limit,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import {
  SupportTicket,
  SupportMessage,
  CreateTicketData,
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "@/types/support";

const TICKETS_COLLECTION = "support_tickets";
const MESSAGES_SUBCOLLECTION = "messages";

// Cloud function for sending notifications
const supportFunction = httpsCallable(functions, "support");

// ============================================
// TICKET OPERATIONS
// ============================================

/**
 * Create a new support ticket with initial message
 */
export async function createTicket(
  data: CreateTicketData,
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    userType: "participant" | "partner" | "admin";
  }
): Promise<string> {
  const now = Timestamp.now();

  // Create ticket document
  const ticketRef = await addDoc(collection(db, TICKETS_COLLECTION), {
    subject: data.subject,
    category: data.category,
    status: "open" as TicketStatus,
    priority: "medium" as TicketPriority,
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userAvatar: user.avatar || "",
    userType: user.userType,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    lastMessageBy: "user",
    messageCount: 1,
    unreadByAdmin: true,
    unreadByUser: false,
  });

  // Add initial message
  await addDoc(
    collection(db, TICKETS_COLLECTION, ticketRef.id, MESSAGES_SUBCOLLECTION),
    {
      ticketId: ticketRef.id,
      content: data.initialMessage,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar || "",
      senderType: "user",
      createdAt: now,
      read: false,
    }
  );

  return ticketRef.id;
}

/**
 * Get a single ticket by ID
 */
export async function getTicket(ticketId: string): Promise<SupportTicket | null> {
  const ticketDoc = await getDoc(doc(db, TICKETS_COLLECTION, ticketId));
  if (!ticketDoc.exists()) return null;
  return { id: ticketDoc.id, ...ticketDoc.data() } as SupportTicket;
}

/**
 * Get all tickets for a specific user
 */
export async function getUserTickets(userId: string): Promise<SupportTicket[]> {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportTicket));
}

/**
 * Get all tickets (for admin)
 */
export async function getAllTickets(
  status?: string,
  priority?: string
): Promise<SupportTicket[]> {
  let q = query(collection(db, TICKETS_COLLECTION), orderBy("updatedAt", "desc"));

  if (status && status !== "all") {
    q = query(
      collection(db, TICKETS_COLLECTION),
      where("status", "==", status),
      orderBy("updatedAt", "desc")
    );
  }

  const snapshot = await getDocs(q);
  let tickets = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportTicket));

  // Filter by priority in memory if needed
  if (priority && priority !== "all") {
    tickets = tickets.filter((t) => t.priority === priority);
  }

  return tickets;
}

/**
 * Subscribe to tickets (real-time)
 */
export function subscribeToTickets(
  callback: (tickets: SupportTicket[]) => void,
  userId?: string
): () => void {
  let q;
  if (userId) {
    q = query(
      collection(db, TICKETS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
  } else {
    q = query(collection(db, TICKETS_COLLECTION), orderBy("updatedAt", "desc"));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportTicket[];
      callback(tickets);
    },
    (error) => {
      console.error("Error subscribing to tickets:", error);
      // If there's an index error, the callback should still work for existing data
    }
  );
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === "resolved" || status === "closed") {
    updateData.resolvedAt = serverTimestamp();
  }

  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), updateData);
}

/**
 * Update ticket priority
 */
export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    priority,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Assign ticket to admin
 */
export async function assignTicket(
  ticketId: string,
  adminId: string,
  adminName: string
): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    assignedTo: adminId,
    assignedToName: adminName,
    status: "in_progress",
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark ticket as read by admin
 */
export async function markTicketReadByAdmin(ticketId: string): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    unreadByAdmin: false,
  });
}

/**
 * Mark ticket as read by user
 */
export async function markTicketReadByUser(ticketId: string): Promise<void> {
  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
    unreadByUser: false,
  });
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Send a message in a ticket
 */
export async function sendMessage(
  ticketId: string,
  content: string,
  sender: {
    id: string;
    name: string;
    avatar?: string;
    type: "user" | "admin";
  }
): Promise<string> {
  const now = Timestamp.now();

  // Add message
  const messageRef = await addDoc(
    collection(db, TICKETS_COLLECTION, ticketId, MESSAGES_SUBCOLLECTION),
    {
      ticketId,
      content,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar || "",
      senderType: sender.type,
      createdAt: now,
      read: false,
    }
  );

  // Update ticket
  const ticketUpdate: Record<string, unknown> = {
    updatedAt: now,
    lastMessageAt: now,
    lastMessageBy: sender.type,
  };

  // Get current message count
  const ticket = await getTicket(ticketId);
  if (ticket) {
    ticketUpdate.messageCount = ticket.messageCount + 1;
  }

  // Mark as unread for the other party
  if (sender.type === "user") {
    ticketUpdate.unreadByAdmin = true;
    // If it was closed/resolved, reopen it
    if (ticket?.status === "closed" || ticket?.status === "resolved") {
      ticketUpdate.status = "open";
    }
  } else {
    ticketUpdate.unreadByUser = true;
  }

  await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), ticketUpdate);

  return messageRef.id;
}

/**
 * Get all messages for a ticket
 */
export async function getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
  const q = query(
    collection(db, TICKETS_COLLECTION, ticketId, MESSAGES_SUBCOLLECTION),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportMessage));
}

/**
 * Subscribe to messages (real-time)
 */
export function subscribeToMessages(
  ticketId: string,
  callback: (messages: SupportMessage[]) => void
): () => void {
  const q = query(
    collection(db, TICKETS_COLLECTION, ticketId, MESSAGES_SUBCOLLECTION),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SupportMessage[];
    callback(messages);
  });
}

/**
 * Mark all messages as read
 */
export async function markMessagesAsRead(
  ticketId: string,
  readerType: "user" | "admin"
): Promise<void> {
  const q = query(
    collection(db, TICKETS_COLLECTION, ticketId, MESSAGES_SUBCOLLECTION),
    where("read", "==", false),
    where("senderType", "!=", readerType)
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();

  // Update ticket unread status
  if (readerType === "admin") {
    await markTicketReadByAdmin(ticketId);
  } else {
    await markTicketReadByUser(ticketId);
  }
}

// ============================================
// STATS
// ============================================

/**
 * Get support stats for admin dashboard
 */
export async function getSupportStats(): Promise<{
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
}> {
  const allTickets = await getAllTickets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openTickets = allTickets.filter((t) => t.status === "open").length;
  const inProgressTickets = allTickets.filter((t) => t.status === "in_progress").length;
  const resolvedToday = allTickets.filter((t) => {
    if (!t.resolvedAt) return false;
    const resolvedDate = t.resolvedAt.toDate();
    return resolvedDate >= today;
  }).length;

  return {
    openTickets,
    inProgressTickets,
    resolvedToday,
    avgResponseTime: "< 2h", // Placeholder - would need to calculate from message timestamps
  };
}

/**
 * Get unread ticket count for user
 */
export async function getUnreadTicketCount(userId: string): Promise<number> {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where("userId", "==", userId),
    where("unreadByUser", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Get unread ticket count for admin
 */
export async function getUnreadTicketCountForAdmin(): Promise<number> {
  const q = query(
    collection(db, TICKETS_COLLECTION),
    where("unreadByAdmin", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Send notification to user when admin responds
 */
export async function sendSupportNotification(
  ticketId: string,
  userId: string,
  subject: string
): Promise<void> {
  try {
    await supportFunction({ ticketId, userId, subject });
  } catch (error) {
    console.error("Failed to send support notification:", error);
    // Don't throw - notification failure shouldn't block the message
  }
}
