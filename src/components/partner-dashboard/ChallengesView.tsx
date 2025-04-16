import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Plus, Search, FileText, Eye, PenTool, Play, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WelcomeSection from '../dashboard/WelcomeSection';
import { toast } from 'sonner';

export const ChallengesView = ({
  challenges,
  setActiveView
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      // First apply the status filter
      if (selectedFilter !== 'all' && challenge.status !== selectedFilter) {
        return false;
      }
      
      // Then apply the search filter
      if (searchQuery.trim() === '') {
        return true;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return (
        challenge.title.toLowerCase().includes(searchLower) ||
        challenge.description.toLowerCase().includes(searchLower) ||
        challenge.categories.some(cat => cat.toLowerCase().includes(searchLower))
      );
    });
  }, [challenges, searchQuery, selectedFilter]);

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
      <WelcomeSection title={'Challenge Management'} subtitle={'Create and manage your innovation challenges'} />

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => setActiveView('create-challenge')}
          className="bg-primary text-white whitespace-nowrap"
          size="sm"
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Create Challenge
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedFilter}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all" className="flex-1">All Challenges</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="draft" className="flex-1">Drafts</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => console.log('View Challenge', challenge.id)}
                onEdit={() => console.log('Edit Challenge', challenge.id)}
                onPublish={() => console.log('Publish Challenge', challenge.id)}
                onArchive={() => console.log('Archive Challenge', challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => console.log('View Challenge', challenge.id)}
                onEdit={() => console.log('Edit Challenge', challenge.id)}
                onPublish={() => console.log('Publish Challenge', challenge.id)}
                onArchive={() => console.log('Archive Challenge', challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          <div className="grid gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => console.log('View Challenge', challenge.id)}
                onEdit={() => console.log('Edit Challenge', challenge.id)}
                onPublish={() => console.log('Publish Challenge', challenge.id)}
                onArchive={() => console.log('Archive Challenge', challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => console.log('View Challenge', challenge.id)}
                onEdit={() => console.log('Edit Challenge', challenge.id)}
                onPublish={() => console.log('Publish Challenge', challenge.id)}
                onArchive={() => console.log('Archive Challenge', challenge.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ChallengeCardProps {
  challenge;
  onView: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
}

const ChallengeCard = ({
  challenge,
  onView,
  onEdit,
  onPublish,
  onArchive
}: ChallengeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {challenge.categories.map((category) => (
                <Badge 
                  key={category}
                  variant="secondary" 
                  className="bg-primary/10 text-primary"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge 
            variant="secondary"
            className={`${
              challenge.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : challenge.status === 'draft'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            } rounded-lg px-3 py-1`}
          >
            {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
          </Badge>
          <p className="text-primary font-semibold">
            {challenge.prize}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Participants</p>
              <p className="font-medium">{challenge.participants}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submissions</p>
              <p className="font-medium">{challenge.submissions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Left</p>
              <p className="font-medium">{challenge.daysLeft} days</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <PenTool className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {challenge.status === 'draft' ? (
              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={onPublish}>
                <Play className="h-4 w-4 mr-1" />
                Publish
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={onArchive}>
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 