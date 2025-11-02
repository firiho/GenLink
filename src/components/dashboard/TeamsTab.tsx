import { Plus, Users, Trophy, Crown, Calendar, Search } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TeamService } from '@/services/teamService';
import { Team, TeamInvitation } from '@/types/team';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import InvitationList from '@/components/teams/InvitationList';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TeamsTabProps {
  initialTab?: 'my-teams' | 'invitations';
  setActiveView?: (view: string, data?: any) => void;
}

export default function TeamsTab({ initialTab = 'my-teams', setActiveView }: TeamsTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'archived', 'closed'
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'public', 'invite-only'
  const [challengeFilter, setChallengeFilter] = useState('all'); // 'all' or challengeId

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || user.userType !== 'participant') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [userTeams, userInvitations] = await Promise.all([
          TeamService.getUserTeams(user.uid),
          TeamService.getUserInvitations(user.uid)
        ]);
        setTeams(userTeams);
        setInvitations(userInvitations);
        
        // Only fetch challenges if there are teams
        if (userTeams.length > 0) {
          // Collect unique challenge IDs from teams
          const challengeIds = new Set(userTeams.map(team => team.challengeId));
          
          // Fetch challenge titles in batch (only if we have challenge IDs)
          if (challengeIds.size > 0) {
            const challengePromises = Array.from(challengeIds).map(async (challengeId) => {
              const challengeRef = doc(db, 'challenges', challengeId);
              const challengeSnap = await getDoc(challengeRef);
              return challengeSnap.exists() ? { id: challengeId, title: challengeSnap.data().title || 'Unknown' } : null;
            });
            
            const challenges = (await Promise.all(challengePromises)).filter(Boolean);
            setAllChallenges(challenges);
          } else {
            setAllChallenges([]);
          }
        } else {
          // No teams, set empty challenges
          setAllChallenges([]);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load team data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleCreateTeam = async (teamData: any) => {
    try {
      const teamId = await TeamService.createTeam({
        ...teamData,
        createdBy: user!.uid
      });
      
      // Refresh teams list
      const userTeams = await TeamService.getUserTeams(user!.uid);
      setTeams(userTeams);
      setShowCreateModal(false);
      toast.success('Team created successfully!');
    } catch (error: any) {
      console.error('Error creating team:', error);
      const errorMessage = error?.message || 'Failed to create team';
      toast.error(errorMessage);
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleInvitationResponse = async (invitationId: string, status: 'accepted' | 'declined', message?: string) => {
    try {
      await TeamService.respondToInvitation(invitationId, status, message);
      
      // Refresh data
      const [userTeams, userInvitations] = await Promise.all([
        TeamService.getUserTeams(user!.uid),
        TeamService.getUserInvitations(user!.uid)
      ]);
      setTeams(userTeams);
      setInvitations(userInvitations);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    }
  };

  const handleViewTeamDetails = (team: Team) => {
    if (setActiveView) {
      setActiveView('team-manage', team.id);
    } else {
      navigate(`/dashboard/teams/${team.id}`);
    }
  };

  const handleTeamUpdate = async () => {
    // Refresh teams list after any updates
    if (user) {
      const userTeams = await TeamService.getUserTeams(user.uid);
      setTeams(userTeams);
      
      // Update challenges list (only if there are teams)
      if (userTeams.length > 0) {
        const challengeIds = new Set(userTeams.map(team => team.challengeId));
        if (challengeIds.size > 0) {
          const challengePromises = Array.from(challengeIds).map(async (challengeId) => {
            const challengeRef = doc(db, 'challenges', challengeId);
            const challengeSnap = await getDoc(challengeRef);
            return challengeSnap.exists() ? { id: challengeId, title: challengeSnap.data().title || 'Unknown' } : null;
          });
          const challenges = (await Promise.all(challengePromises)).filter(Boolean);
          setAllChallenges(challenges);
        } else {
          setAllChallenges([]);
        }
      } else {
        setAllChallenges([]);
      }
    }
  };

  // Filter teams
  const filteredTeams = teams.filter(team => {
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    const matchesVisibility = visibilityFilter === 'all' || team.visibility === visibilityFilter;
    const matchesChallenge = challengeFilter === 'all' || team.challengeId === challengeFilter;
    return matchesStatus && matchesVisibility && matchesChallenge;
  });


  // Only show team functionality for participants
  if (user?.userType !== 'participant') {
    return (
      <div className="space-y-6 sm:space-y-8">
        <WelcomeSection 
          title="Team Collaboration" 
          subtitle="Build, manage, and collaborate with teams on innovation challenges" 
        />
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
            <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Team Access Restricted</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Team functionality is only available for participants. Please sign up as a participant to create and join teams.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 sm:space-y-8">
      <WelcomeSection 
        title="Team Collaboration" 
        subtitle="Build, manage, and collaborate with teams on innovation challenges" 
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-teams' | 'invitations')} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto mb-6">
          <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitations.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                {invitations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-teams" className="space-y-6 mt-0">
          {/* Header with stats and create button - Always visible */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Your Teams
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {loading ? (
                    <span className="inline-block h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></span>
                  ) : (
                    <>
                      {teams.length} {teams.length === 1 ? 'team' : 'teams'} across different challenges
                    </>
                  )}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>

          {/* Filters - Compact, grouped on same row */}
          {activeTab === 'my-teams' && (
            <div className="flex flex-wrap items-center gap-3 pb-2">
              {/* Status Filter Group */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      statusFilter === 'active'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setStatusFilter('archived')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      statusFilter === 'archived'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Archived
                  </button>
                </div>
              </div>
              
              {/* Visibility Filter Group */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Visibility:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setVisibilityFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      visibilityFilter === 'all'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setVisibilityFilter('public')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      visibilityFilter === 'public'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setVisibilityFilter('invite-only')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      visibilityFilter === 'invite-only'
                        ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Invite Only
                  </button>
                </div>
              </div>
              
              {/* Challenge Filter Group - Dropdown */}
              {allChallenges.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Challenge:</span>
                  <select
                    value={challengeFilter}
                    onChange={(e) => setChallengeFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 min-w-[150px]"
                  >
                    <option value="all">All Challenges</option>
                    {allChallenges.map(challenge => (
                      <option key={challenge.id} value={challenge.id}>
                        {challenge.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              {Array.from({ length: Math.min(5, teams.length || 3) }).map((_, i) => (
                <div key={i} className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 animate-pulse last:border-b-0">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center border-2 border-blue-100 dark:border-blue-800">
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start Your Team Journey</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Create your first team to collaborate on challenges or discover existing teams to join
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Team
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/community/teams')}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Discover Teams
                </Button>
              </div>
            </div>
          ) : (
            /* Teams List - Table-like */
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              {filteredTeams.length > 0 ? (
                filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="group border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer last:border-b-0"
                  onClick={() => handleViewTeamDetails(team)}
                >
                  <div className="px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{team.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20 flex-shrink-0"
                        >
                          {team.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{team.challengeTitle}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {team.currentMembers}/{team.maxMembers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(team.lastActivity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="px-4 py-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">No teams found matching filters</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <InvitationList 
            invitations={invitations}
            onRespond={handleInvitationResponse}
          />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
}
