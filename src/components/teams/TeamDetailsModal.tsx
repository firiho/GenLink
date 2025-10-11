import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Trophy, 
  Target, 
  Crown, 
  Calendar, 
  MessageSquare, 
  Settings, 
  X,
  UserPlus,
  LogOut,
  ExternalLink,
  CheckCircle,
  Clock,
  MapPin,
  Globe
} from 'lucide-react';
import { Team, TeamMember } from '@/types/team';
import { TeamService } from '@/services/teamService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ManageTeamModal from './ManageTeamModal';

interface TeamDetailsModalProps {
  team: Team;
  onClose: () => void;
  onUpdate?: () => void;
  isMember?: boolean;
}

export default function TeamDetailsModal({ team, onClose, onUpdate, isMember = false }: TeamDetailsModalProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Array<TeamMember & { name: string; email: string; photo: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isUserMember, setIsUserMember] = useState(isMember);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [creatorName, setCreatorName] = useState<string>(team.createdBy);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    checkMembership();
    fetchCreatorName();
    fetchMembers();
  }, [team.id, user]);

  const checkMembership = async () => {
    if (!user) return;
    
    try {
      const member = await TeamService.getTeamMember(team.id, user.uid);
      setIsUserMember(!!member);
      setUserRole(member?.role || null);
    } catch (error) {
      console.error('Error checking membership:', error);
    }
  };

  const fetchCreatorName = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'public_profiles', team.createdBy));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setCreatorName(profileData.name || profileData.displayName || team.createdBy);
      }
    } catch (error) {
      console.error('Error fetching creator name:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const teamMembers = await TeamService.getTeamMembersWithProfiles(team.id);
      setMembers(teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (team.autoApprove) {
        await TeamService.addTeamMember(team.id, user.uid, 'member');
        toast.success('Successfully joined the team!');
        setIsUserMember(true);
        setUserRole('member');
        onUpdate?.();
      } else {
        await TeamService.createTeamApplication(team.id, user.uid, 'I would like to join this team');
        toast.success('Application submitted! Wait for team owner approval.');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!user) return;
    
    if (userRole === 'owner') {
      toast.error('Team owners cannot leave. Please transfer ownership first or delete the team.');
      return;
    }
    
    try {
      setLoading(true);
      await TeamService.removeTeamMember(team.id, user.uid);
      toast.success('Left the team successfully');
      setIsUserMember(false);
      setUserRole(null);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-16 w-16 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <Users className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-bold text-2xl text-slate-900 dark:text-white">
                    {team.name}
                  </h2>
                  {isUserMember && (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Member
                    </Badge>
                  )}
                  {userRole === 'owner' && <Crown className="h-5 w-5 text-amber-500" />}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  {team.description}
                </p>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{team.currentMembers}/{team.maxMembers} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {team.visibility}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {isUserMember && <TabsTrigger value="challenges">Challenges</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Members</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{team.currentMembers}/{team.maxMembers}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{team.status}</p>
                </div>
              </div>

              {/* Challenge Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Challenge</h3>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                  <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">{team.challengeTitle}</span>
                </div>
              </div>

              {/* Tags */}
              {team.tags && team.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Team Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Created by:</span>
                    <p className="font-medium text-slate-900 dark:text-white">{creatorName}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Last activity:</span>
                    <p className="font-medium text-slate-900 dark:text-white">{new Date(team.lastActivity).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-4">
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Loading members...</p>
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Team Members ({members.length}/{team.maxMembers})
                  </h3>
                  {members.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-100 dark:bg-slate-700">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                            {member.role === 'owner' && (
                              <Badge variant="default" className="text-xs gap-1">
                                <Crown className="h-3 w-3" />
                                Owner
                              </Badge>
                            )}
                            {member.role === 'admin' && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs mt-1 ${
                            member.status === 'active' 
                              ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20' 
                              : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p>No members found</p>
                </div>
              )}
            </TabsContent>

            {isUserMember && (
              <TabsContent value="challenges" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                    Active Challenge
                  </h3>
                  <div className="p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                          {team.challengeTitle}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{team.currentMembers} members participating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            <span>Max {team.maxMembers} members</span>
                          </div>
                        </div>
                        
                        {team.hasSubmitted && team.submittedAt && (
                          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <div>
                                <p className="font-medium text-green-900 dark:text-green-100">Submitted</p>
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  {new Date(team.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {team.submissionUrl && (
                              <a 
                                href={team.submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-300 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Submission
                              </a>
                            )}
                          </div>
                        )}

                        {!team.hasSubmitted && (
                          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              <div>
                                <p className="font-medium text-amber-900 dark:text-amber-100">Not yet submitted</p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">
                                  Complete your project and submit before the deadline
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{team.status}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Last Activity</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(team.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex gap-3 justify-end">
            {!isUserMember && team.visibility !== 'private' && (
              <Button 
                onClick={handleJoinTeam}
                disabled={loading || team.currentMembers >= team.maxMembers}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {team.autoApprove ? 'Join Team' : 'Apply to Join'}
              </Button>
            )}
            
            {isUserMember && !isOwner && (
              <Button 
                variant="outline"
                onClick={handleLeaveTeam}
                disabled={loading}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Team
              </Button>
            )}
            
            {isAdmin && (
              <Button 
                variant="outline"
                onClick={() => setShowManageModal(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            )}
            
            {isUserMember && (
              <Button onClick={() => toast.info('Team chat coming soon')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Team Chat
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Manage Team Modal */}
      {showManageModal && (
        <ManageTeamModal
          open={showManageModal}
          onClose={() => setShowManageModal(false)}
          team={team}
          onTeamUpdated={() => {
            onUpdate?.();
            setShowManageModal(false);
          }}
        />
      )}
    </div>
  );
}

