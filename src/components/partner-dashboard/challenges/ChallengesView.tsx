import { useState, useMemo, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, getDoc, getDocs, increment, arrayUnion, arrayRemove, collection, query, where } from 'firebase/firestore';
import { ChallengeCard } from './ChallengeCard';
import { ReleaseScoresModal } from './ReleaseScoresModal';
import { Skeleton } from '@/components/ui/skeleton';

export const ChallengesView = ({
  setActiveView,
  user // User object with organization info
}) => {
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Release Scores Modal State
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [selectedChallengeForRelease, setSelectedChallengeForRelease] = useState<any>(null);
  const [challengeSubmissions, setChallengeSubmissions] = useState<any[]>([]);
  const [specialAwardSelections, setSpecialAwardSelections] = useState<Record<string, string>>({});
  const [isReleasingScores, setIsReleasingScores] = useState(false);

  // Fetch challenges and submissions
  const fetchChallenges = async () => {
    const orgId = user?.organization?.id;
    if (!orgId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch challenge IDs from org subcollection
      const orgChallengesRef = collection(db, 'organizations', orgId, 'challenges');
      const orgChallengesSnapshot = await getDocs(orgChallengesRef);
      const challengeIds = orgChallengesSnapshot.docs.map(d => d.id);
      
      // Fetch full challenge data for each ID
      const challengesList = [];
      for (const challengeId of challengeIds) {
        const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
        if (challengeDoc.exists()) {
          const data = challengeDoc.data();
          const createdAt = data.createdAt?.toDate ? 
            data.createdAt.toDate().toISOString() : 
            data.createdAt;
          const updatedAt = data.updatedAt?.toDate ? 
            data.updatedAt.toDate().toISOString() : 
            data.updatedAt;
          const deadline = data.deadline;
          const daysLeft = deadline ? 
            Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
            'Unknown';
          challengesList.push({
            id: challengeDoc.id,
            ...data,
            createdAt,
            updatedAt,
            daysLeft,
            participants: data.participants || 0,
            submissions: data.submissions || 0,
          });
        }
      }
      setChallenges(challengesList);

      // Fetch submissions for these challenges
      if (challengesList.length > 0) {
        const challengeIds = challengesList.map(c => c.id);
        const allSubmissions = [];
        
        for (let i = 0; i < challengeIds.length; i += 10) {
          const batch = challengeIds.slice(i, i + 10);
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('challengeId', 'in', batch)
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);
          allSubmissions.push(...submissionsSnapshot.docs);
        }

        const submissionsList = await Promise.all(
          allSubmissions.map(async (submissionDoc) => {
            const data = submissionDoc.data();
            
            // Get project title
            let projectTitle = 'Untitled Project';
            if (data.projectId) {
              try {
                const projectRef = doc(db, 'projects', data.projectId);
                const projectSnap = await getDoc(projectRef);
                if (projectSnap.exists()) {
                  projectTitle = projectSnap.data().title || 'Untitled Project';
                }
              } catch (error) {
                console.error('Error fetching project:', error);
              }
            }

            // Get participant info
            let participant = { name: 'Anonymous User', type: 'individual', uid: data.userId };
            if (data.teamId) {
              try {
                const teamRef = doc(db, 'teams', data.teamId);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                  participant = { 
                    uid: data.teamId,
                    name: teamSnap.data().name || 'Unnamed Team', 
                    type: 'team' 
                  };
                }
              } catch (error) {
                console.error('Error fetching team:', error);
              }
            } else if (data.userId) {
              try {
                const profileRef = doc(db, 'profiles', data.userId);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                  const profileData = profileSnap.data();
                  participant = { 
                    uid: data.userId,
                    name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Anonymous User',
                    type: 'individual'
                  };
                }
              } catch (error) {
                console.error('Error fetching profile:', error);
              }
            }

            const submittedAt = data.createdAt?.toDate ? 
              data.createdAt.toDate().toISOString() : 
              data.createdAt;

            return {
              id: submissionDoc.id,
              projectId: data.projectId || null,
              title: projectTitle,
              challengeId: data.challengeId,
              participant,
              participantType: participant.type,
              teamId: data.teamId || null,
              status: data.status || 'pending',
              submittedAt,
              score: data.score !== undefined ? data.score : null,
            };
          })
        );

        submissionsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(submissionsList);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [user?.organization?.id]);

  // Function to refresh challenges (used after updates)
  const refreshChallenges = () => {
    fetchChallenges();
  };

  // Function to publish a challenge (change status to active)
  const publishChallenge = async (challengeId: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Get the challenge data to get the prize amount
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeSnap = await getDoc(challengeRef);
      const challengeData = challengeSnap.data();
      const prizeAmount = challengeData?.total_prize || 0;
      const organizationId = challengeData?.organizationId || user?.organization?.id;
      
      const now = new Date();
      
      // Update the challenge status in Firestore
      await updateDoc(challengeRef, {
        status: 'active',
        updatedAt: now
      });
      
      // Also update the org subcollection reference
      if (organizationId) {
        const orgChallengeRef = doc(db, 'organizations', organizationId, 'challenges', challengeId);
        await setDoc(orgChallengeRef, {
          status: 'active',
          updatedAt: now
        }, { merge: true });
      }
      
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
  const archiveChallenge = async (challengeId: string) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // Get the challenge data to get the organization ID
      const challengeRef = doc(db, 'challenges', challengeId);
      const challengeSnap = await getDoc(challengeRef);
      const challengeData = challengeSnap.data();
      const organizationId = challengeData?.organizationId || user?.organization?.id;
      
      const now = new Date();
      
      // Update the challenge status in Firestore
      await updateDoc(challengeRef, {
        status: 'completed',
        updatedAt: now
      });
      
      // Also update the org subcollection reference
      if (organizationId) {
        const orgChallengeRef = doc(db, 'organizations', organizationId, 'challenges', challengeId);
        await setDoc(orgChallengeRef, {
          status: 'completed',
          updatedAt: now
        }, { merge: true });
      }
      
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

  // Function to open the release scores modal
  const openReleaseModal = async (challenge: any) => {
    setSelectedChallengeForRelease(challenge);
    
    // Get submissions for this challenge from the submissions prop
    const challengeSubs = submissions
      .filter((sub: any) => sub.challengeId === challenge.id)
      .sort((a: any, b: any) => (b.score ?? -1) - (a.score ?? -1)); // Sort by score descending
    
    setChallengeSubmissions(challengeSubs);
    
    // Initialize special award selections
    const initialSelections: Record<string, string> = {};
    if (challenge.prizeDistribution?.additional) {
      challenge.prizeDistribution.additional.forEach((_award: any, index: number) => {
        initialSelections[`award_${index}`] = '';
      });
    }
    setSpecialAwardSelections(initialSelections);
    
    setReleaseModalOpen(true);
  };

  // Function to release scores and awards
  const releaseScoresAndAwards = async () => {
    if (!selectedChallengeForRelease || isReleasingScores) return;
    
    try {
      setIsReleasingScores(true);
      
      // Get top 3 winners based on score
      const winners = challengeSubmissions.slice(0, 3);
      
      // Helper to build winner data without undefined values
      const buildWinnerData = (submission: any, prize: number) => {
        if (!submission) return null;
        const data: any = {
          submissionId: submission.id,
          projectTitle: submission.title || '',
          score: submission.score ?? null,
          prize: prize
        };
        // Only include fields that have values
        if (submission.participant?.name) data.participantName = submission.participant.name;
        if (submission.participantId) data.participantId = submission.participantId;
        if (submission.participantType) data.participantType = submission.participantType;
        if (submission.teamId) data.teamId = submission.teamId;
        return data;
      };
      
      // Build the awards data
      const awardsData = {
        first: buildWinnerData(winners[0], selectedChallengeForRelease.prizeDistribution?.first || 0),
        second: buildWinnerData(winners[1], selectedChallengeForRelease.prizeDistribution?.second || 0),
        third: buildWinnerData(winners[2], selectedChallengeForRelease.prizeDistribution?.third || 0),
        specialAwards: [] as any[]
      };
      
      // Add special awards
      if (selectedChallengeForRelease.prizeDistribution?.additional) {
        selectedChallengeForRelease.prizeDistribution.additional.forEach((award: any, index: number) => {
          const selectedSubmissionId = specialAwardSelections[`award_${index}`];
          const selectedSubmission = challengeSubmissions.find((s: any) => s.id === selectedSubmissionId);
          
          if (selectedSubmission) {
            const specialAwardData: any = {
              awardName: award.name || `Special Award ${index + 1}`,
              prize: award.amount || 0,
              submissionId: selectedSubmission.id,
              projectTitle: selectedSubmission.title || '',
              score: selectedSubmission.score ?? null
            };
            // Only include fields that have values
            if (selectedSubmission.participant?.name) specialAwardData.participantName = selectedSubmission.participant.name;
            if (selectedSubmission.participantId) specialAwardData.participantId = selectedSubmission.participantId;
            if (selectedSubmission.participantType) specialAwardData.participantType = selectedSubmission.participantType;
            if (selectedSubmission.teamId) specialAwardData.teamId = selectedSubmission.teamId;
            
            awardsData.specialAwards.push(specialAwardData);
          }
        });
      }
      
      // Update the challenge with released scores
      const challengeRef = doc(db, 'challenges', selectedChallengeForRelease.id);
      await updateDoc(challengeRef, {
        scoresReleased: true,
        scoresReleasedAt: new Date(),
        awards: awardsData,
        updatedAt: new Date()
      });
      
      toast.success('Scores and awards saved successfully!');
      toast.success('Participants will be notified at midnight!');
      handleCloseReleaseModal();
      
      // Refresh the challenges list
      if (typeof refreshChallenges === 'function') {
        await refreshChallenges();
      }
    } catch (error) {
      console.error('Error releasing scores:', error);
      toast.error('Failed to release scores. Please try again.');
    } finally {
      setIsReleasingScores(false);
    }
  };

  const handleCloseReleaseModal = () => {
    setReleaseModalOpen(false);
    setSelectedChallengeForRelease(null);
    setChallengeSubmissions([]);
    setSpecialAwardSelections({});
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter((challenge: any) => {
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
        challenge.categories.some((cat: string) => cat.toLowerCase().includes(searchLower))
      );
    });
  }, [challenges, searchQuery, selectedFilter]);

  const renderChallengesList = () => {
    if (loading) {
      return (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid gap-6">
        {filteredChallenges.map((challenge: any) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onView={() => setActiveView('preview-challenge', { challenge })}
            onEdit={() => setActiveView('create-challenge', { challenge, editMode: true })}
            onPublish={() => publishChallenge(challenge.id)}
            onArchive={() => archiveChallenge(challenge.id)}
            onReleaseScores={() => openReleaseModal(challenge)}
          />
        ))}
      </div>
    );
  };

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
            value="judging" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Judging
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="flex-1 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderChallengesList()}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {renderChallengesList()}
        </TabsContent>
        
        <TabsContent value="draft" className="mt-6">
          {renderChallengesList()}
        </TabsContent>
        
        <TabsContent value="judging" className="mt-6">
          {renderChallengesList()}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {renderChallengesList()}
        </TabsContent>
      </Tabs>

      {/* Release Scores Modal */}
      <ReleaseScoresModal
        open={releaseModalOpen}
        onOpenChange={setReleaseModalOpen}
        challenge={selectedChallengeForRelease}
        submissions={challengeSubmissions}
        specialAwardSelections={specialAwardSelections}
        onSpecialAwardChange={setSpecialAwardSelections}
        onRelease={releaseScoresAndAwards}
        isReleasing={isReleasingScores}
        onCancel={handleCloseReleaseModal}
      />
    </div>
  );
};
