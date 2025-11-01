import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  MessageCircle,
  Timer,
  BarChart
} from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";

const MOCK_TICKETS = [
  {
    id: 'TCK-001',
    subject: 'Payment Processing Issue',
    user: 'John Smith',
    email: 'john@example.com',
    status: 'open',
    priority: 'high',
    category: 'Payment',
    created: '2024-03-20T10:30:00',
    lastUpdate: '2024-03-20T11:45:00',
    responses: 2
  },
  {
    id: 'TCK-002',
    subject: 'Account Access Problem',
    user: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'in_progress',
    priority: 'medium',
    category: 'Account',
    created: '2024-03-20T09:15:00',
    lastUpdate: '2024-03-20T10:30:00',
    responses: 1
  }
];

const Support = () => {
  const { actualTheme } = useTheme();
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const stats = [
    {
      label: 'Open Tickets',
      value: '28',
      change: '+4 today',
      icon: MessageSquare,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      label: 'Average Response Time',
      value: '2.4h',
      change: '-30m from last week',
      icon: Timer,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      label: 'Resolution Rate',
      value: '94%',
      change: '+2% this week',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      label: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+0.2 this month',
      icon: BarChart,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  const statusColors = {
    open: 'text-yellow-500 bg-yellow-50',
    in_progress: 'text-blue-500 bg-blue-50',
    resolved: 'text-green-500 bg-green-50',
    closed: 'text-gray-500 bg-gray-50'
  };

  const priorityColors = {
    high: 'text-red-500 bg-red-50',
    medium: 'text-yellow-500 bg-yellow-50',
    low: 'text-blue-500 bg-blue-50'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className={cn(
          "text-2xl font-semibold",
          actualTheme === 'dark' ? "text-white" : "text-gray-900"
        )}>Support Dashboard</h1>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-xl shadow-sm",
              actualTheme === 'dark' ? "bg-slate-800" : "bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>{stat.label}</p>
                <p className={cn(
                  "text-2xl font-semibold mt-1",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{stat.value}</p>
                <p className={cn(
                  "text-sm mt-1",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
            actualTheme === 'dark' ? "text-slate-400" : "text-gray-400"
          )} />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
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
          <SelectTrigger className="w-[180px]">
            <AlertCircle className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Table */}
      <div className={cn(
        "rounded-xl shadow-sm overflow-hidden",
        actualTheme === 'dark' ? "bg-slate-800" : "bg-white"
      )}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(
                "border-b",
                actualTheme === 'dark' 
                  ? "border-slate-700 bg-slate-800" 
                  : "border-gray-200 bg-gray-50"
              )}>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Ticket</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Status</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Priority</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Last Update</th>
                <th className={cn(
                  "px-6 py-4 text-right text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Actions</th>
              </tr>
            </thead>
            <tbody className={cn(
              "divide-y",
              actualTheme === 'dark' ? "divide-slate-700" : "divide-gray-200"
            )}>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "hover:bg-opacity-50",
                    actualTheme === 'dark' ? "hover:bg-slate-700" : "hover:bg-gray-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className={cn(
                        "font-medium",
                        actualTheme === 'dark' ? "text-white" : "text-gray-900"
                      )}>{ticket.subject}</div>
                      <div className={cn(
                        "text-sm",
                        actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                      )}>
                        {ticket.user} • {ticket.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                      {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {new Date(ticket.lastUpdate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Button variant="outline" size="sm" className="mr-2">
                      Reply
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Change Priority</DropdownMenuItem>
                        <DropdownMenuItem>Assign Agent</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Close Ticket</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Support;