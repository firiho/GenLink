import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Flag,
  Shield,
  MoreVertical,
  Eye,
  Ban,
  Settings,
  AlertTriangle
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

const MOCK_COMMUNITIES = [
  {
    id: '1',
    name: 'Tech Innovators',
    members: 1250,
    posts: 3420,
    reports: 12,
    status: 'active',
    lastActive: '2024-03-20',
    moderators: 3
  },
  {
    id: '2',
    name: 'Digital Artists',
    members: 850,
    posts: 2800,
    reports: 5,
    status: 'active',
    lastActive: '2024-03-19',
    moderators: 2
  }
];

const Communities = () => {
  const { actualTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);

  const stats = [
    {
      label: 'Total Communities',
      value: communities.length,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Users',
      value: '5.2k',
      icon: MessageSquare,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      label: 'Pending Reports',
      value: '28',
      icon: Flag,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      label: 'Active Moderators',
      value: '45',
      icon: Shield,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className={cn(
          "text-2xl font-semibold",
          actualTheme === 'dark' ? "text-white" : "text-gray-900"
        )}>Community Management</h1>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          New Community
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div
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
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
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
            placeholder="Search communities..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Communities List */}
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
                )}>Community</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Members</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Posts</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Reports</th>
                <th className={cn(
                  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Last Active</th>
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
              {filteredCommunities.map((community) => (
                <motion.tr
                  key={community.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "hover:bg-opacity-50",
                    actualTheme === 'dark' ? "hover:bg-slate-700" : "hover:bg-gray-50"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">{community.name[0]}</span>
                      </div>
                      <div className="ml-4">
                        <div className={cn(
                          "font-medium",
                          actualTheme === 'dark' ? "text-white" : "text-gray-900"
                        )}>{community.name}</div>
                        <div className={cn(
                          "text-sm",
                          actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                        )}>{community.moderators} moderators</div>
                      </div>
                    </div>
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
                  )}>
                    {community.members.toLocaleString()}
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
                  )}>
                    {community.posts.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {community.reports > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        {community.reports}
                      </span>
                    ) : (
                      <span className={cn(
                        "text-sm",
                        actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                      )}>None</span>
                    )}
                  </td>
                  <td className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm",
                    actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {new Date(community.lastActive).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="mr-2 h-4 w-4" />
                          Restrict Community
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Communities;