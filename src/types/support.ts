import { Timestamp } from "firebase/firestore";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "general" | "technical" | "billing" | "account" | "feature_request" | "bug_report" | "other";

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  
  // User info
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  userType: "participant" | "partner" | "admin";
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  
  // Admin info
  assignedTo?: string;
  assignedToName?: string;
  
  // Metadata
  lastMessageAt: Timestamp;
  lastMessageBy: "user" | "admin";
  messageCount: number;
  unreadByAdmin: boolean;
  unreadByUser: boolean;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderType: "user" | "admin";
  createdAt: Timestamp;
  read: boolean;
  attachments?: {
    url: string;
    name: string;
    type: string;
    size: number;
  }[];
}

export interface CreateTicketData {
  subject: string;
  category: TicketCategory;
  initialMessage: string;
}

export interface SendMessageData {
  ticketId: string;
  content: string;
  senderType: "user" | "admin";
}
