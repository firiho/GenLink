import { useState, useMemo } from 'react';
import { Plus, Search, FileText, Eye, PenTool, Play, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WelcomeSection from '../dashboard/WelcomeSection';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, getDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

export const ChallengesView = ({
  challenges,
  setActiveView,
  refreshChallenges, // Optional prop to refresh challenges after status changes
  user // User object with organization info
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to publish a challenge (change status to active)
  const publishChallenge = async (challengeId) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Get the challenge data to get the prize amount
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeSnap = await getDoc(challengeRef);
      const challengeData = challengeSnap.data();
      const prizeAmount = challengeData?.total_prize || 0;
      const organizationId = challengeData?.organizationId || user?.organization?.id;
      
      // Update the challenge status in Firestore
      await updateDoc(challengeRef, {
        status: 'active',
        updatedAt: new Date()
      });
      
      // Update organization stats in stats collection - stats/org_{orgId}
      // Use arrayUnion for idempotent tracking of both active challenges and prize pool
      // Prize is only added if challengeId is not already in prizeAddedChallengeIds
      if (organizationId) {
        const orgStatsRef = doc(db, 'stats', `org_${organizationId}`);
        
        // First check if prize was already added for this challenge
        const orgStatsSnap = await getDoc(orgStatsRef);
        const orgStatsData = orgStatsSnap.data();
        const prizeAddedIds = orgStatsData?.totalPrizePool?.prizeAddedChallengeIds || [];
        const prizeAlreadyAdded = prizeAddedIds.includes(challengeId);
        
        // Build update object - always add to active challenges (idempotent)
        const updateData: any = {
          'activeChallenges.activeChallengeIds': arrayUnion(challengeId)
        };
        
        // Only add prize if not already added for this challenge
        if (!prizeAlreadyAdded && prizeAmount > 0) {
          updateData['totalPrizePool.value'] = increment(prizeAmount);
          updateData['totalPrizePool.prizeAddedChallengeIds'] = arrayUnion(challengeId);
        }
        
        await setDoc(orgStatsRef, updateData, { merge: true });
      }
      
      toast.success('Challenge published successfully!');
      
      // Refresh the challenges list if the refreshChallenges function is provided
      if (typeof refreshChallenges === 'function') {
        await refreshChallenges();
      }
    } catch (error) {
      console.error('Error publishing challenge:', error);
      toast.error('Failed to publish challenge. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to archive a challenge (change status to completed)
  const archiveChallenge = async (challengeId) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Get the challenge data to get the organization ID
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeSnap = await getDoc(challengeRef);
      const challengeData = challengeSnap.data();
      const organizationId = challengeData?.organizationId || user?.organization?.id;
      
      // Update the challenge status in Firestore
      await updateDoc(challengeRef, {
        status: 'completed',
        updatedAt: new Date()
      });
      
      // Update organization stats in stats collection - stats/org_{orgId}
      // Note: We don't decrement prize pool since that money was already allocated
      if (organizationId) {
        const orgStatsRef = doc(db, 'stats', `org_${organizationId}`);
        await setDoc(orgStatsRef, {
          'activeChallenges.activeChallengeIds': arrayRemove(challengeId)
        }, { merge: true });
      }
      
      toast.success('Challenge archived successfully!');
      
      // Refresh the challenges list if the refreshChallenges function is provided
      if (typeof refreshChallenges === 'function') {
        await refreshChallenges();
      }
    } catch (error) {
      console.error('Error archiving challenge:', error);
      toast.error('Failed to archive challenge. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredChallenges = useMemo(() => {
    // Your existing filtering logic
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <WelcomeSection title={'Challenge Management'} subtitle={'Create and manage your innovation challenges'} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <Button 
          onClick={() => setActiveView('create-challenge')}
          className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 whitespace-nowrap"
          size="sm"
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Create Challenge
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedFilter}>
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full justify-start">
          <TabsTrigger 
            value="all" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            All Challenges
          </TabsTrigger>
          <TabsTrigger 
            value="active" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="draft" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Drafts
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onView={() => setActiveView('preview-challenge', { challenge })}
                onEdit={() => setActiveView('create-challenge', { challenge, editMode: true })}
                onPublish={() => publishChallenge(challenge.id)}
                onArchive={() => archiveChallenge(challenge.id)}
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
                onView={() => setActiveView('preview-challenge', { challenge })}
                onEdit={() => setActiveView('create-challenge', { challenge, editMode: true })}
                onPublish={() => publishChallenge(challenge.id)}
                onArchive={() => archiveChallenge(challenge.id)}
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
                onView={() => setActiveView('preview-challenge', { challenge })}
                onEdit={() => setActiveView('create-challenge', { challenge, editMode: true })}
                onPublish={() => publishChallenge(challenge.id)}
                onArchive={() => archiveChallenge(challenge.id)}
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
                onView={() => setActiveView('preview-challenge', { challenge })}
                onEdit={() => setActiveView('create-challenge', { challenge, editMode: true })}
                onPublish={() => publishChallenge(challenge.id)}
                onArchive={() => archiveChallenge(challenge.id)}
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
    <div
      className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {challenge.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {challenge.categories.map((category) => (
                <Badge 
                  key={category}
                  variant="secondary" 
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
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
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' 
                : challenge.status === 'draft'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            } rounded-lg px-3 py-1`}
          >
            {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
          </Badge>
          <p className="text-slate-900 dark:text-white font-semibold">
            ${challenge.total_prize}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Participants</p>
              <p className="font-semibold text-slate-900 dark:text-white">{challenge.participants}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Submissions</p>
              <p className="font-semibold text-slate-900 dark:text-white">{challenge.submissions}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Left</p>
              <p className="font-semibold text-slate-900 dark:text-white">{challenge.daysLeft} days</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onView}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <PenTool className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {challenge.status === 'draft' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" 
                onClick={onPublish}
              >
                <Play className="h-4 w-4 mr-1" />
                Publish
              </Button>
            ) : challenge.status !== 'completed' ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" 
                onClick={onArchive}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}; 