import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Clock, UserPlus, Activity, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { Stats } from './Stats';
import { Challenge } from '@/types/user';

interface OverviewViewProps {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    icon: any;
    color: string;
    bg: string;
  }>;
  recentChallenges: Challenge[];
  onViewAllChallenges: () => void;
  onViewChallenge: (challenge: Challenge) => void;
}

const StatsCard = ({ stat, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-all"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2 sm:p-3 rounded-xl ${stat.bg}`}>
        <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
      </div>
      <TrendingUp className="h-4 w-4 text-green-500" />
    </div>
    <p className="text-gray-600 text-xs sm:text-sm mb-1">{stat.label}</p>
    <p className="text-2xl sm:text-3xl font-bold mb-2">{stat.value}</p>
    <p className="text-green-500 text-xs sm:text-sm flex items-center">
      <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
      {stat.change}
    </p>
  </motion.div>
);

export const OverviewView = ({
  stats,
  recentChallenges,
  onViewAllChallenges,
  onViewChallenge
}: OverviewViewProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <Stats stats={stats} />

      {/* Recent Sections - Updated for better mobile view */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Challenges Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Challenges</h3>
              <Button variant="ghost" size="sm" onClick={onViewAllChallenges}>
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {recentChallenges.slice(0, 3).map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => onViewChallenge(challenge)}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 truncate">
                        {challenge.title}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{challenge.participants} participants</span>
                        <span>•</span>
                        <span>{challenge.daysLeft} days left</span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        challenge.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {challenge.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  title: 'New submission received',
                  description: 'John Doe submitted a solution for AI Innovation Challenge',
                  time: '2 hours ago',
                  type: 'submission'
                },
                {
                  id: 2,
                  title: 'Challenge deadline approaching',
                  description: 'Tech Innovation Challenge ends in 2 days',
                  time: '5 hours ago',
                  type: 'deadline'
                },
                {
                  id: 3,
                  title: 'New participant joined',
                  description: 'Sarah Smith joined Rwanda Tech Challenge',
                  time: '1 day ago',
                  type: 'participant'
                }
              ].map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0",
                      activity.type === 'submission' ? 'bg-blue-50' : 
                      activity.type === 'deadline' ? 'bg-yellow-50' : 'bg-green-50'
                    )}>
                      <ActivityIcon type={activity.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'submission':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'deadline':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'participant':
      return <UserPlus className="h-4 w-4 text-green-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
  }
};