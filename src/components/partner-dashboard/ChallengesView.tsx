import { motion } from 'framer-motion';
import { Plus, Search, FileText, Eye, PenTool, Play, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Challenge } from '@/types/user';

interface ChallengesViewProps {
  challenges: Challenge[];
  searchQuery: string;
  selectedFilter: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onCreateChallenge: () => void;
  onViewChallenge: (challenge: Challenge) => void;
  onEditChallenge: (challenge: Challenge) => void;
  onPublishChallenge: (challenge: Challenge) => void;
  onArchiveChallenge: (challenge: Challenge) => void;
}

export const ChallengesView = ({
  challenges,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterChange,
  onCreateChallenge,
  onViewChallenge,
  onEditChallenge,
  onPublishChallenge,
  onArchiveChallenge
}: ChallengesViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Challenge Management</h2>
          <p className="text-gray-600">Create and manage your innovation challenges</p>
        </div>
        <Button 
          onClick={onCreateChallenge}
          className="bg-primary text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all" className="flex-1">All Challenges</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="draft" className="flex-1">Drafts</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6">
            {challenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => onViewChallenge(challenge)}
                onEdit={() => onEditChallenge(challenge)}
                onPublish={() => onPublishChallenge(challenge)}
                onArchive={() => onArchiveChallenge(challenge)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ChallengeCardProps {
  challenge: Challenge;
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