import ChallengeCard from '@/components/dashboard/ChallengeCard';
import SearchAndFilter from '@/components/dashboard/SearchAndFilter';
import useChallenges from '@/components/dashboard/useChallenges';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { useState } from 'react';
import { Trophy } from 'lucide-react';

export default function ChallengesTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');

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
  return (
    <div className="space-y-4 sm:space-y-6 mt-5">
    <div className="flex flex-col space-y-4">
      <WelcomeSection title="Your Challenges" subtitle="Manage and track your innovation challenges" />
        <SearchAndFilter 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
        />
      
    </div>

    <div className="space-y-3">
      {filteredChallenges.map((challenge, index) => (
        <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
      ))}
    </div>

    {filteredChallenges.length === 0 && (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
          <Trophy className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium mb-1">No challenges found</h3>
        <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
      </div>
    )}
  </div>
  )
};
