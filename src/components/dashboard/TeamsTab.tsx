import { Search, Plus, Users, Trophy, Target, ArrowRight, Filter, Grid, List, Settings, UserPlus, Crown, Calendar, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TeamService } from '@/services/teamService';
import { Team, TeamInvitation } from '@/types/team';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import TeamDiscovery from '@/components/teams/TeamDiscovery';
import TeamCard from '@/components/teams/TeamCard';
import InvitationList from '@/components/teams/InvitationList';
import TeamDetailsModal from '@/components/teams/TeamDetailsModal';
import ManageTeamModal from '@/components/teams/ManageTeamModal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface TeamsTabProps {
  initialTab?: 'my-teams' | 'discover' | 'invitations';
}

export default function TeamsTab({ initialTab = 'my-teams' }: TeamsTabProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

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

  const handleViewTeamDetails = (team: Team, isMember: boolean = false) => {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  };

  const handleCloseTeamDetails = () => {
    setShowTeamDetails(false);
    setSelectedTeam(null);
  };

  const handleTeamUpdate = async () => {
    // Refresh teams list after any updates
    if (user) {
      const userTeams = await TeamService.getUserTeams(user.uid);
      setTeams(userTeams);
    }
  };

  const handleManageTeam = (team: Team) => {
    setSelectedTeam(team);
    setShowManageModal(true);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedTeam(null);
  };

  const handleJoinTeam = (team: Team) => {
    handleViewTeamDetails(team, false);
  };

  const handleInviteToTeam = (team: Team) => {
    // This would open an invite modal
    toast.info('Team invitations coming soon');
  };

  const handleJoinByCode = async (code: string) => {
    if (!user) return;
    
    const result = await TeamService.joinTeamByLink(code, user.uid);
    if (result.success) {
      // Refresh teams
      const userTeams = await TeamService.getUserTeams(user.uid);
      setTeams(userTeams);
      toast.success(result.message);
    } else {
      throw new Error(result.message);
    }
  };

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
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-teams' | 'discover' | 'invitations')} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto mb-6">
          <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
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
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
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
                    onClick={() => setActiveTab('discover')}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Discover Teams
                  </Button>
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              {/* Header with stats and create button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Your Teams
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {teams.length} {teams.length === 1 ? 'team' : 'teams'} across different challenges
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

              {/* Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team, index) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TeamCard 
                      team={team}
                      isMember={true}
                      onViewDetails={(t) => handleViewTeamDetails(t, true)}
                      onChat={(t) => toast.info('Team chat coming soon')}
                      onManage={handleManageTeam}
                    />
                  </motion.div>
                ))}
              </div>

            </>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-0">
          <TeamDiscovery 
            onJoinTeam={handleJoinTeam}
            onInviteToTeam={handleInviteToTeam}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-0">
          <InvitationList 
            invitations={invitations}
            onRespond={handleInvitationResponse}
            onJoinByCode={handleJoinByCode}
          />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}

      {showTeamDetails && selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          isMember={teams.some(t => t.id === selectedTeam.id)}
          onClose={handleCloseTeamDetails}
          onUpdate={handleTeamUpdate}
        />
      )}

      {showManageModal && selectedTeam && (
        <ManageTeamModal
          open={showManageModal}
          onClose={handleCloseManageModal}
          team={selectedTeam}
          onTeamUpdated={async () => {
            await handleTeamUpdate();
            handleCloseManageModal();
          }}
        />
      )}
    </div>
  );
}
