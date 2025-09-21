import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  BarChart as BarChartIcon,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const mockData = {
  userGrowth: [
    { date: '2024-01', users: 1200, partners: 45, communities: 28 },
    { date: '2024-02', users: 1850, partners: 52, communities: 35 },
    { date: '2024-03', users: 2400, partners: 60, communities: 42 }
  ],
  revenue: [
    { month: 'Jan', value: 28000 },
    { month: 'Feb', value: 35000 },
    { month: 'Mar', value: 42000 }
  ]
};

export default function Analytics() {
  const { actualTheme } = useTheme();
  const [timeRange, setTimeRange] = useState('3m');

  const stats = [
    {
      label: 'Total Users',
      value: '2,456',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Partners',
      value: '60',
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      label: 'Monthly Revenue',
      value: '$42,000',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className={cn(
          "text-2xl font-semibold",
          actualTheme === 'dark' ? "text-white" : "text-gray-900"
        )}>Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className={`flex items-center mt-1 ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm">{stat.change}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className={cn(
          "p-6",
          actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
        )}>
          <h3 className={cn(
            "text-lg font-semibold mb-4",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>User Growth</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={actualTheme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="date" stroke={actualTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={actualTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                    border: actualTheme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    color: actualTheme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="partners"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className={cn(
          "p-6",
          actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
        )}>
          <h3 className={cn(
            "text-lg font-semibold mb-4",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={actualTheme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={actualTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={actualTheme === 'dark' ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                    border: actualTheme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                    color: actualTheme === 'dark' ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add more detailed metric cards here */}
      </div>
    </div>
  );
}