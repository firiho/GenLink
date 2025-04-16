import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ChevronRight, FileText, Clock, UserPlus, Users, DollarSign, Award, Plus, InboxIcon, Settings, Activity, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { Stats } from './Stats';
import WelcomeSection from '../dashboard/WelcomeSection';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export const OverviewView = ({
  recentChallenges,
  recentSubmissions,
  setActiveView,
  user
}) => {
  const [statsData, setStatsData] = useState({
    active_challenges: '0',
    total_participants: '0',
    total_prize_pool: '$0',
    completion_rate: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    const fetchOrganizationStats = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        
        // Query organizations collection where id field matches user.uid
        const orgQuery = query(
          collection(db, 'organizations'),
          where('created_by', '==', user?.uid)
        );
        
        const querySnapshot = await getDocs(orgQuery);
        
        if (!querySnapshot.empty) {
          const orgData = querySnapshot.docs[0].data();
          setStatsData({
            active_challenges: orgData.active_challenges?.toString() || '0',
            total_participants: orgData.total_participants?.toString() || '0',
            total_prize_pool: `$${orgData.total_prize_pool?.toLocaleString() || '0'}`,
            completion_rate: `${orgData.completion_rate || 0}%`
          });
          setOrgName(orgData.name || 'Hey Partner!');
        } else {
          console.log("No organization found for this user");
        }
      } catch (error) {
        console.error("Error fetching organization stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchOrganizationStats();
    }
  }, [user]);

  const stats = [
    {
      label: 'Active Challenges',
      value: statsData.active_challenges,
      change: '+0 this month',
      icon: Trophy,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Total Participants',
      value: statsData.total_participants,
      change: '+0 this month',
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Total Prize Pool',
      value: statsData.total_prize_pool,
      change: '+$0 this month',
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Completion Rate',
      value: statsData.completion_rate,
      change: '+0% this month',
      icon: Award,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  const onViewAllChallenges = () => {
    setActiveView('challenges');
  };

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
      <WelcomeSection title={orgName} subtitle={'Here is what\'s happening with your GenLink'} />
      {/* Stats Grid */}
      <Stats stats={stats} loading={loading}/>

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
                  onClick={() => {}}
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

        {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Submissions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('submissions')}
              >
                View All <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.slice(0, 3).map((submission) => (
                <div 
                  key={submission.id} 
                  className="flex items-start p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {}}
                >
                  <div className="p-2 bg-primary/10 rounded-lg mr-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{submission.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{submission.participant.name}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {submission.status}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No submissions yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <Button 
                onClick={() => setActiveView('create-challenge')}
                className="w-full justify-start text-left"
                variant="outline"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Challenge
              </Button>
              <Button 
                onClick={() => setActiveView('submissions')}
                className="w-full justify-start text-left"
                variant="outline"
              >
                <InboxIcon className="mr-2 h-5 w-5" />
                Review Submissions ({recentSubmissions.filter(s => s.status === 'pending').length})
              </Button>
              <Button 
                onClick={() => setActiveView('settings')}
                className="w-full justify-start text-left"
                variant="outline"
              >
                <Settings className="mr-2 h-5 w-5" />
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

        {/* Recent Activity Section
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
      </div> */}
      </div>

      {/* Modals */}
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