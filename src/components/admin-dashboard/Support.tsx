import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Search,
  CheckCircle,
  MoreVertical,
  MessageCircle,
  Timer,
  BarChart,
  Send,
  Loader2,
  CheckCheck,
  ArrowLeft,
  Inbox,
} from "lucide-react";
import {
  subscribeToTickets,
  subscribeToMessages,
  sendMessage,
  sendSupportNotification,
  updateTicketStatus,
  updateTicketPriority,
  markTicketReadByAdmin,
  getSupportStats,
} from "@/services/supportService";
import { SupportTicket, SupportMessage, TicketStatus, TicketPriority } from "@/types/support";
import { Timestamp } from "firebase/firestore";

const Support = () => {
  const { user } = useAuth();
  const { actualTheme } = useTheme();

  // State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    openTickets: 0,
    inProgressTickets: 0,
    resolvedToday: 0,
    avgResponseTime: "< 2h",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load tickets
  useEffect(() => {
    const unsubscribe = subscribeToTickets((updatedTickets) => {
      setTickets(updatedTickets);
      setIsLoading(false);
    });

    // Load stats
    getSupportStats().then(setStats);

    return () => unsubscribe();
  }, []);

  // Filter tickets
  useEffect(() => {
    let result = [...tickets];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(query) ||
          t.userName.toLowerCase().includes(query) ||
          t.userEmail.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    setFilteredTickets(result);
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  // Subscribe to messages when ticket is selected
  useEffect(() => {
    if (!selectedTicket) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedTicket.id, (updatedMessages) => {
      setMessages(updatedMessages);
      scrollToBottom();
    });

    // Mark as read
    markTicketReadByAdmin(selectedTicket.id);

    return () => unsubscribe();
  }, [selectedTicket]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
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

  const formatFullDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    return timestamp.toDate().toLocaleString();
  };

  // Send message
  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(selectedTicket.id, newMessage, {
        id: user.id,
        name: "Support Team",
        avatar: "",
        type: "admin",
      });
      
      // Send notification to user
      await sendSupportNotification(
        selectedTicket.id,
        selectedTicket.userId,
        selectedTicket.subject
      );
      
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Update status
  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, status);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  // Update priority
  const handlePriorityChange = async (ticketId: string, priority: TicketPriority) => {
    try {
      await updateTicketPriority(ticketId, priority);
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority });
      }
    } catch (error) {
      console.error("Failed to update priority:", error);
    }
  };

  // Status and priority colors
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: actualTheme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700",
      in_progress:
        actualTheme === "dark"
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-yellow-100 text-yellow-700",
      resolved:
        actualTheme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700",
      closed:
        actualTheme === "dark" ? "bg-slate-500/20 text-slate-400" : "bg-slate-100 text-slate-700",
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: actualTheme === "dark" ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-700",
      high: actualTheme === "dark" ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700",
      medium:
        actualTheme === "dark"
          ? "bg-yellow-500/20 text-yellow-400"
          : "bg-yellow-100 text-yellow-700",
      low: actualTheme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700",
    };
    return colors[priority] || colors.medium;
  };

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

  const statCards = [
    {
      label: "Open Tickets",
      value: stats.openTickets.toString(),
      icon: MessageSquare,
      color: "text-blue-500",
      bg: actualTheme === "dark" ? "bg-blue-500/20" : "bg-blue-50",
    },
    {
      label: "In Progress",
      value: stats.inProgressTickets.toString(),
      icon: Timer,
      color: "text-yellow-500",
      bg: actualTheme === "dark" ? "bg-yellow-500/20" : "bg-yellow-50",
    },
    {
      label: "Resolved Today",
      value: stats.resolvedToday.toString(),
      icon: CheckCircle,
      color: "text-green-500",
      bg: actualTheme === "dark" ? "bg-green-500/20" : "bg-green-50",
    },
    {
      label: "Avg Response",
      value: stats.avgResponseTime,
      icon: BarChart,
      color: "text-purple-500",
      bg: actualTheme === "dark" ? "bg-purple-500/20" : "bg-purple-50",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1
          className={cn(
            "text-2xl font-semibold",
            actualTheme === "dark" ? "text-white" : "text-gray-900"
          )}
        >
          Support Dashboard
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "p-4 rounded-xl border",
              actualTheme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-xs",
                    actualTheme === "dark" ? "text-slate-400" : "text-gray-500"
                  )}
                >
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold mt-1",
                    actualTheme === "dark" ? "text-white" : "text-gray-900"
                  )}
                >
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex rounded-xl border overflow-hidden",
          actualTheme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        )}
        style={{ minHeight: "500px" }}
      >
        {/* Ticket List */}
        <div
          className={cn(
            "w-full md:w-96 flex-shrink-0 flex flex-col border-r",
            actualTheme === "dark" ? "border-slate-700" : "border-slate-200",
            selectedTicket ? "hidden md:flex" : "flex"
          )}
        >
          {/* Filters */}
          <div className={cn("p-4 border-b", actualTheme === "dark" ? "border-slate-700" : "border-slate-200")}>
            <div className="relative mb-3">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  actualTheme === "dark" ? "text-slate-400" : "text-gray-400"
                )}
              />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No tickets found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No support tickets yet"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      "w-full p-4 text-left transition-colors",
                      selectedTicket?.id === ticket.id
                        ? actualTheme === "dark"
                          ? "bg-slate-700"
                          : "bg-primary/5"
                        : "hover:bg-muted/50",
                      ticket.unreadByAdmin && "border-l-4 border-l-primary"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={ticket.userAvatar} />
                        <AvatarFallback>
                          {ticket.userName[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium truncate">{ticket.subject}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(ticket.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {ticket.userName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn("text-xs", getStatusColor(ticket.status))}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Badge className={cn("text-xs", getPriorityColor(ticket.priority))}>
                            {ticket.priority}
                          </Badge>
                          {ticket.unreadByAdmin && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={cn("flex-1 flex flex-col", !selectedTicket && "hidden md:flex")}>
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div
                className={cn(
                  "p-4 border-b flex items-center justify-between",
                  actualTheme === "dark" ? "border-slate-700" : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="md:hidden p-2 rounded-lg hover:bg-muted/50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedTicket.userAvatar} />
                    <AvatarFallback>
                      {selectedTicket.userName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedTicket.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.userName} • {selectedTicket.userEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => handleStatusChange(selectedTicket.id, v as TicketStatus)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View User Profile</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, "low")}>
                        Set Low Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, "medium")}>
                        Set Medium Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, "high")}>
                        Set High Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, "urgent")}>
                        Set Urgent Priority
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(selectedTicket.id, "closed")}
                        className="text-red-600"
                      >
                        Close Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Ticket Info Bar */}
              <div
                className={cn(
                  "px-4 py-2 border-b flex items-center gap-4 text-xs",
                  actualTheme === "dark"
                    ? "bg-slate-700/50 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                )}
              >
                <span>
                  <strong>Category:</strong> {getCategoryLabel(selectedTicket.category)}
                </span>
                <span>
                  <strong>Created:</strong> {formatFullDate(selectedTicket.createdAt)}
                </span>
                <span>
                  <strong>Messages:</strong> {selectedTicket.messageCount}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.senderType === "admin" ? "flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.senderAvatar} />
                      <AvatarFallback>
                        {message.senderType === "admin" ? "S" : message.senderName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        message.senderType === "admin"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : actualTheme === "dark"
                          ? "bg-slate-700 rounded-bl-md"
                          : "bg-slate-100 rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1",
                          message.senderType === "admin"
                            ? "justify-end text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        <span className="text-xs">{formatTime(message.createdAt)}</span>
                        {message.senderType === "admin" && (
                          <CheckCheck
                            className={cn("h-3 w-3", message.read ? "text-blue-400" : "")}
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
                      ? "border-slate-700 bg-slate-800"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your reply..."
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
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
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
                    actualTheme === "dark" ? "border-slate-700" : "border-slate-200"
                  )}
                >
                  This ticket has been closed. Change status to reopen.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2 text-lg">Select a ticket</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a support ticket from the list to view the conversation and respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
