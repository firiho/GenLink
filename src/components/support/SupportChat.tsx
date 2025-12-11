import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Send,
  MessageCircle,
  Plus,
  ArrowLeft,
  Clock,
  CheckCheck,
  Loader2,
  Minimize2,
  Maximize2,
} from "lucide-react";
import {
  createTicket,
  getUserTickets,
  getTicket,
  getTicketMessages,
  sendMessage,
  subscribeToMessages,
  subscribeToTickets,
  markTicketReadByUser,
} from "@/services/supportService";
import { SupportTicket, SupportMessage, TicketCategory } from "@/types/support";
import { Timestamp } from "firebase/firestore";

interface SupportChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // New ticket form
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState<TicketCategory>("general");
  const [newTicketMessage, setNewTicketMessage] = useState("");

  // Load user tickets
  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = subscribeToTickets((updatedTickets) => {
      setTickets(updatedTickets);
    }, user.id);

    return () => unsubscribe();
  }, [user, isOpen]);

  // Subscribe to messages when a ticket is selected
  useEffect(() => {
    if (!selectedTicket) return;

    const unsubscribe = subscribeToMessages(selectedTicket.id, (updatedMessages) => {
      setMessages(updatedMessages);
      scrollToBottom();
    });

    // Mark as read
    markTicketReadByUser(selectedTicket.id);

    return () => unsubscribe();
  }, [selectedTicket]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Create new ticket
  const handleCreateTicket = async () => {
    if (!user || !newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setIsLoading(true);
    try {
      const ticketId = await createTicket(
        {
          subject: newTicketSubject,
          category: newTicketCategory,
          initialMessage: newTicketMessage,
        },
        {
          id: user.id,
          email: user.email || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User",
          avatar: (user as any).avatar || "",
          userType: user.userType as "participant" | "partner" | "admin",
        }
      );

      // Reset form
      setNewTicketSubject("");
      setNewTicketCategory("general");
      setNewTicketMessage("");

      // Fetch the newly created ticket directly from Firestore
      const newTicket = await getTicket(ticketId);
      if (newTicket) {
        // Add to tickets list immediately so subscription can catch up
        setTickets((prev) => [newTicket, ...prev]);
        setSelectedTicket(newTicket);
        setView("chat");
      } else {
        // Fallback to list view
        setView("list");
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(selectedTicket.id, newMessage, {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User",
        avatar: (user as any).avatar || "",
        type: "user",
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Select a ticket
  const handleSelectTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setView("chat");
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  // Get category label
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: "General",
      technical: "Technical",
      billing: "Billing",
      account: "Account",
      feature_request: "Feature Request",
      bug_report: "Bug Report",
      other: "Other",
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300",
        isMinimized
          ? "bottom-4 right-4 w-80"
          : "bottom-4 right-4 w-96 h-[600px] max-h-[80vh]"
      )}
    >
      <div
        className={cn(
          "rounded-2xl shadow-2xl overflow-hidden flex flex-col border",
          actualTheme === "dark"
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200"
        )}
        style={{ height: isMinimized ? "auto" : "100%" }}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 border-b",
            actualTheme === "dark"
              ? "bg-slate-800 border-slate-700"
              : "bg-primary text-primary-foreground",
            isMinimized && "cursor-pointer"
          )}
          onClick={() => isMinimized && setIsMinimized(false)}
        >
          <div className="flex items-center gap-3">
            {view !== "list" && !isMinimized && (
              <button
                onClick={() => {
                  setView("list");
                  setSelectedTicket(null);
                }}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">
              {isMinimized
                ? "Support"
                : view === "list"
                ? "Support"
                : view === "new"
                ? "New Ticket"
                : selectedTicket?.subject || "Chat"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Ticket List View */}
            {view === "list" && (
              <>
                <div className="p-4 border-b border-border">
                  <Button
                    onClick={() => setView("new")}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    New Support Ticket
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No conversations yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Start a new support ticket to get help from our team.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket)}
                          className={cn(
                            "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                            ticket.unreadByUser && "bg-primary/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium truncate flex-1">
                              {ticket.subject}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTime(ticket.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "h-2 w-2 rounded-full",
                                getStatusColor(ticket.status)
                              )}
                            />
                            <span className="text-xs text-muted-foreground capitalize">
                              {ticket.status.replace("_", " ")}
                            </span>
                            {ticket.unreadByUser && (
                              <Badge
                                variant="default"
                                className="text-xs px-1.5 py-0"
                              >
                                New
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* New Ticket View */}
            {view === "new" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="What do you need help with?"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={newTicketCategory}
                    onValueChange={(v) => setNewTicketCategory(v as TicketCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Describe your issue or question..."
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleCreateTicket}
                  disabled={
                    isLoading || !newTicketSubject.trim() || !newTicketMessage.trim()
                  }
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  Send Message
                </Button>
              </div>
            )}

            {/* Chat View */}
            {view === "chat" && selectedTicket && (
              <>
                {/* Ticket Info */}
                <div
                  className={cn(
                    "px-4 py-2 border-b text-xs",
                    actualTheme === "dark"
                      ? "bg-slate-800/50 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(selectedTicket.category)}
                    </Badge>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        getStatusColor(selectedTicket.status)
                      )}
                    />
                    <span className="text-muted-foreground capitalize">
                      {selectedTicket.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.senderType === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback>
                          {message.senderName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          message.senderType === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : actualTheme === "dark"
                            ? "bg-slate-800 rounded-bl-md"
                            : "bg-slate-100 rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div
                          className={cn(
                            "flex items-center gap-1 mt-1",
                            message.senderType === "user"
                              ? "justify-end text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          <span className="text-xs">
                            {formatTime(message.createdAt)}
                          </span>
                          {message.senderType === "user" && (
                            <CheckCheck
                              className={cn(
                                "h-3 w-3",
                                message.read ? "text-blue-400" : ""
                              )}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {selectedTicket.status !== "closed" && (
                  <div
                    className={cn(
                      "p-4 border-t",
                      actualTheme === "dark"
                        ? "border-slate-700 bg-slate-800/50"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        size="icon"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === "closed" && (
                  <div
                    className={cn(
                      "p-4 border-t text-center text-sm text-muted-foreground",
                      actualTheme === "dark"
                        ? "border-slate-700 bg-slate-800/50"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    This ticket has been closed. Create a new ticket if you need more
                    help.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChat;
