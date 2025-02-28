import { ChevronRight, Star, Target, Trophy, Users } from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import SearchAndFilter from '@/components/dashboard/SearchAndFilter';
import ChallengeCard from '@/components/dashboard/ChallengeCard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import useChallenges from '@/components/dashboard/useChallenges';

export default function OverviewTab({setActiveView, user}) {
    const [showAllChallenges, setShowAllChallenges] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

    const stats = [
        { 
        label: 'Active Challenges', 
        value: '8', 
        change: '+2 this month',
        icon: Trophy,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
        },
        { 
        label: 'Team Members', 
        value: '24', 
        change: '+5 this month',
        icon: Users,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
        },
        { 
        label: 'Total Submissions', 
        value: '156', 
        change: '+32 this week',
        icon: Target,
        color: 'text-green-500',
        bg: 'bg-green-500/10'
        },
        { 
        label: 'Success Rate', 
        value: '92%', 
        change: '+8% this month',
        icon: Star,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10'
        }
    ];
    const allChallenges = [
        {
        id: '1',
        title: "Rwanda Tech Innovation Challenge",
        description: "Develop solutions for digital transformation in Rwanda",
        organization: "Rwanda ICT Chamber",
        participants: 450,
        status: "Active",
        submissions: 125,
        progress: 65,
        daysLeft: 14,
        prize: "$50,000",
        deadline: "2024-05-15"
        },
        // ... more challenges
    ];


  const filteredChallenges = useChallenges(allChallenges, searchQuery, selectedFilter);
  const displayedChallenges = showAllChallenges ? filteredChallenges : filteredChallenges.slice(0, 3);

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
        <WelcomeSection title={`Welcome ${user?.fullName || 'Admin'}!`} subtitle={"Here's what's happening with your challenges"} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
            <StatsCard key={stat.label} stat={stat} index={index} />
            ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4">
            <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Challenges</h2>
                <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:bg-primary/5"
                onClick={() => setActiveView('challenges')}
                >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
            
            <SearchAndFilter 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
            />
            </div>

            <div className="space-y-3">
            {displayedChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))}
            </div>
        </div>
    </div>
  )
};