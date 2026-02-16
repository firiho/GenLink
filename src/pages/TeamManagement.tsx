import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Team, TeamMember } from '@/types/team';
import { TeamService } from '@/services/teamService';
import { toast } from 'sonner';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Shield, 
  Crown, 
  Settings as SettingsIcon,
  Trophy,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Target,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle,
  ExternalLink,
  LogOut,
  Info,
  Copy,
  Share2,
  FileText,
  CheckCircle2,
  XCircle,
  FolderOpen
} from 'lucide-react';
import TeamChat from '@/components/teams/TeamChat';

interface PublicProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
  username?: string;
}

interface Challenge {
  id: string;
  title: string;
  organization: string;
  description?: string;
  deadline?: string;
  prize?: string;
  total_prize?: number;
}

interface TeamManagementProps {
  teamId: string | null;
}

export default function TeamManagement({ teamId }: TeamManagementProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [currentUserMember, setCurrentUserMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<Array<TeamMember & { name: string; email: string; photo: string }>>([]);
  const [challengeData, setChallengeData] = useState<Challenge | null>(null);
  
  // Invite tab state
  const [peopleSearchOpen, setPeopleSearchOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState('');
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  
  // Settings tab state
  const [teamSettings, setTeamSettings] = useState({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'invite-only',
    tags: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Applications tab state
  const [applications, setApplications] = useState<Array<any>>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [teamProjects, setTeamProjects] = useState<Array<any>>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Check permissions - now implicit based on admins array
  // Admin: user ID in team.admins array
  // Member: user is in members subcollection with active status
  const isAdmin = team?.admins?.includes(user?.uid || '') || false;
  const isOwner = team?.createdBy === user?.uid;
  const isMember = !!currentUserMember;

  useEffect(() => {
    if (!user || !teamId) {
      navigate('/dashboard/teams');
      return;
    }
    loadTeamData();
  }, [teamId, user]);

  const loadTeamProjects = async () => {
    if (!teamId) return;
    
    try {
      setLoadingProjects(true);
      const projectsQuery = query(
        collection(db, 'projects'),
        where('teamId', '==', teamId)
      );
      const projectsSnap = await getDocs(projectsQuery);
      
      const projectsData = [];
      for (const projectDoc of projectsSnap.docs) {
        const projectData = projectDoc.data();
        // Get challenge title
        let challengeTitle = 'Unknown Challenge';
        if (projectData.challengeId) {
          try {
            const challengeRef = doc(db, 'challenges', projectData.challengeId);
            const challengeSnap = await getDoc(challengeRef);
            if (challengeSnap.exists()) {
              challengeTitle = challengeSnap.data().title || challengeTitle;
            }
          } catch (error) {
            console.error('Error fetching challenge:', error);
          }
        }
        
        projectsData.push({
          id: projectDoc.id,
          ...projectData,
          challengeTitle,
          createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : new Date(projectData.createdAt),
          updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : new Date(projectData.updatedAt),
        });
      }
      
      setTeamProjects(projectsData);
    } catch (error) {
      console.error('Error loading team projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadTeamData = async () => {
    if (!user || !teamId) return;
    
    try {
      setLoading(true);
      
      // Get team document
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      
      if (!teamDoc.exists()) {
        toast.error('Team not found');
        navigate('/dashboard/teams');
        return;
      }
      
      const data = teamDoc.data();
      const teamData: Team = {
        id: teamDoc.id,
        name: data.name,
        description: data.description || '',
        challengeId: data.challengeId,
        challengeTitle: data.challengeTitle,
        maxMembers: data.maxMembers,
        currentMembers: data.currentMembers || 0,
        status: data.status,
        visibility: data.visibility,
        tags: data.tags || [],
        admins: data.admins || [data.createdBy], // Ensure admins array exists
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        lastActivity: data.lastActivity?.toDate?.() || data.updatedAt?.toDate?.() || new Date(),
        createdBy: data.createdBy,
        joinableEnabled: data.joinableEnabled || false,
        autoApprove: data.autoApprove || false,
        joinableLink: data.joinableLink,
        hasSubmitted: data.hasSubmitted || false,
        submittedAt: data.submittedAt?.toDate?.(),
        submissionUrl: data.submissionUrl,
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
      
      setTeam(teamData);
      
      // Initialize settings
      setTeamSettings({
        name: teamData.name,
        description: teamData.description,
        visibility: teamData.visibility,
        tags: teamData.tags.join(', '),
      });
      
      // Get current user's member info
      const memberInfo = await TeamService.getTeamMember(teamId, user.uid);
      
      if (!memberInfo) {
        toast.error('You do not have access to this team');
        navigate('/dashboard/teams');
        return;
      }
      
      setCurrentUserMember(memberInfo);
      
      // Get all team members
      const teamMembers = await TeamService.getTeamMembersWithProfiles(teamId);
      setMembers(teamMembers);
      
      // Load challenge data
      if (data.challengeId) {
        try {
          const challengeDoc = await getDoc(doc(db, 'challenges', data.challengeId));
          if (challengeDoc.exists()) {
            const chalData = challengeDoc.data();
            setChallengeData({
              id: challengeDoc.id,
              title: chalData.title,
              organization: chalData.companyInfo?.name || chalData.organization,
              description: chalData.description,
              deadline: chalData.deadline,
              prize: chalData.prize,
              total_prize: chalData.total_prize,
            });
          }
        } catch (err) {
          console.error('Error fetching challenge:', err);
        }
      }
      
      // Load team projects
      await loadTeamProjects();
      
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
      navigate('/dashboard/teams');
    } finally {
      setLoading(false);
    }
  };

  // Load applications
  const loadApplications = async () => {
    if (!teamId || !isAdmin) return;
    
    try {
      setLoadingApplications(true);
      const status = applicationFilter === 'all' ? undefined : applicationFilter;
      const apps = await TeamService.getTeamApplications(teamId, status);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  // Handle approve application
  const handleApproveApplication = async (applicationId: string) => {
    if (!user || !teamId) return;
    
    try {
      await TeamService.approveTeamApplication(teamId, applicationId, user.uid);
      toast.success('Application approved! User added to team.');
      
      // Reload applications and team data
      await loadApplications();
      await loadTeamData();
    } catch (error: any) {
      console.error('Error approving application:', error);
      toast.error(error.message || 'Failed to approve application');
    }
  };

  // Handle decline application
  const handleDeclineApplication = async (applicationId: string) => {
    if (!user || !teamId) return;
    
    try {
      await TeamService.declineTeamApplication(teamId, applicationId, user.uid);
      toast.success('Application declined.');
      await loadApplications();
    } catch (error: any) {
      console.error('Error declining application:', error);
      toast.error(error.message || 'Failed to decline application');
    }
  };

  // Load applications when filter or team changes
  useEffect(() => {
    if (teamId && isAdmin) {
      loadApplications();
    }
  }, [teamId, applicationFilter, isAdmin]);

  // Load public profiles for inviting
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user || !isAdmin || members.length === 0) return;
      
      setLoadingProfiles(true);
      try {
        const { getDocs, collection, query: firestoreQuery } = await import('firebase/firestore');
        
        const profilesQuery = firestoreQuery(collection(db, 'profiles'));
        const profilesSnap = await getDocs(profilesQuery);
        
        const profiles: PublicProfile[] = profilesSnap.docs
          .map(doc => {
            const data = doc.data();
            const firstName = data.firstName || '';
            const lastName = data.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || data.name || data.username || 'Unknown User';
            
            return {
              id: doc.id,
              name: fullName,
              email: data.email || '',
              photo: data.photo || '/placeholder-user.svg',
              username: data.username || undefined
            };
          })
          .filter(profile => 
            profile.id !== user.uid && 
            !members.some(m => m.userId === profile.id)
          );
        
        setPublicProfiles(profiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, [members.length, isAdmin, user]);

  const filteredProfiles = publicProfiles.filter(profile => {
    const searchLower = profileSearch.toLowerCase();
    return (
      profile.name.toLowerCase().includes(searchLower) ||
      profile.email.toLowerCase().includes(searchLower) ||
      (profile.username && profile.username.toLowerCase().includes(searchLower))
    );
  });

  const handleInviteMember = async (profile: PublicProfile) => {
    if (!user || !isAdmin || !team) {
      toast.error('Only admins can invite members');
      return;
    }

    if (members.length >= team.maxMembers) {
      toast.error(`Team is at maximum capacity (${team.maxMembers} members)`);
      return;
    }

    setInviting(true);
    try {
      await TeamService.inviteFromPublicProfile(team.id, profile.id, user.uid, inviteMessage);
      toast.success(`Invitation sent to ${profile.name}`);
      setPeopleSearchOpen(false);
      setInviteMessage('');
      setProfileSearch('');
      setPublicProfiles(prev => prev.filter(p => p.id !== profile.id));
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!user || !isAdmin || !team) {
      toast.error('Only admins can remove members');
      return;
    }

    if (memberId === team.createdBy) {
      toast.error('Cannot remove team owner');
      return;
    }

    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      await TeamService.removeTeamMember(team.id, memberId);
      toast.success(`${memberName} removed from team`);
      await loadTeamData();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleUpdateSettings = async () => {
    if (!user || !isAdmin || !team) {
      toast.error('Only admins can update team settings');
      return;
    }

    setSavingSettings(true);
    try {
      const updates: Partial<Team> = {
        name: teamSettings.name,
        description: teamSettings.description,
        visibility: teamSettings.visibility,
        tags: teamSettings.tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date(),
      };

      await TeamService.updateTeam(team.id, updates);
      toast.success('Team settings updated');
      await loadTeamData();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error(error.message || 'Failed to update team settings');
    } finally {
      setSavingSettings(false);
    }
  };


  const handleDeleteTeam = async () => {
    if (!user || !isOwner || !team) {
      toast.error('Only the team owner can delete the team');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await TeamService.deleteTeam(team.id);
      toast.success('Team deleted successfully');
      navigate('/dashboard/teams');
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'Failed to delete team');
    }
  };

  const handleLeaveTeam = async () => {
    if (!user || !team) return;
    
    if (isOwner) {
      toast.error('Team owners cannot leave. Please transfer ownership first or delete the team.');
      return;
    }
    
    if (!confirm('Are you sure you want to leave this team?')) {
      return;
    }
    
    try {
      await TeamService.leaveTeam(team.id, user.uid);
      toast.success('Left the team successfully');
      navigate('/dashboard/teams');
    } catch (error: any) {
      console.error('Error leaving team:', error);
      toast.error(error.message || 'Failed to leave team');
    }
  };

  const handleCopyTeamLink = async () => {
    if (!team) return;
    
    const teamLink = `https://genlink.africa/t/${team.id}`;
    
    try {
      await navigator.clipboard.writeText(teamLink);
      toast.success('Team link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShareTeamLink = async () => {
    if (!team) return;
    
    const teamLink = `https://genlink.africa/t/${team.id}`;
    const shareData = {
      title: `Join ${team.name} on GenLink`,
      text: team.description,
      url: teamLink
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        await handleCopyTeamLink();
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to copy on error
        await handleCopyTeamLink();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!team || !currentUserMember) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          You don't have permission to view this team.
        </p>
        <Button onClick={() => navigate('/dashboard/teams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard/teams')}
            className="mt-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
              <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <Users className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {team.name}
                </h1>
                {isOwner && <Crown className="h-5 w-5 text-amber-500" />}
                {isMember && (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Member
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                {team.description}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{team.currentMembers}/{team.maxMembers} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>{team.challengeTitle}</span>
                </div>
                <Badge variant="outline" className="text-xs capitalize">
                  {team.visibility}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleCopyTeamLink}
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
          {navigator.share && (
            <Button 
              variant="outline"
              onClick={handleShareTeamLink}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {!isOwner && (
            <Button 
              variant="outline"
              onClick={handleLeaveTeam}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <TabsTrigger value="overview">
            <Trophy className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="invite">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="applications">
              <FileText className="h-4 w-4 mr-2" />
              Applications
              {applications.filter((app: any) => app.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                  {applications.filter((app: any) => app.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Members</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {team.currentMembers}/{team.maxMembers}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Status</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{team.status}</p>
              </CardContent>
            </Card>
          </div>

          {/* Challenge Info */}
          {challengeData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Challenge Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">{challengeData.title}</h3>
                  {challengeData.organization && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">by {challengeData.organization}</p>
                  )}
                </div>
                {challengeData.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{challengeData.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {challengeData.total_prize && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Prize Pool</p>
                      <p className="font-semibold">{formatCurrency(challengeData.total_prize, challengeData.currency)}</p>
                    </div>
                  )}
                  {challengeData.deadline && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Deadline</p>
                      <p className="font-semibold">
                        {new Date(challengeData.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/challenge/${team.challengeId}`)}
                  className="w-full"
                >
                  View Challenge
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Team Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Team Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="space-y-3">
                  <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              ) : teamProjects.length > 0 ? (
                <div className="space-y-3">
                  {teamProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {project.title}
                          </h4>
                          <Badge variant="outline" className={project.status === 'submitted' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : ''}>
                            {project.status === 'submitted' ? 'Submitted' : project.status === 'in-progress' ? 'In Progress' : 'Draft'}
                          </Badge>
                          {project.visibility === 'private' && (
                            <Badge variant="outline" className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                              Private
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                          {project.description}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {project.challengeTitle}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                      >
                        View
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No projects yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/dashboard/projects/create`)}
                  >
                    Create Project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {team.tags && team.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {team.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Status */}
          {team.hasSubmitted && team.submittedAt && (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">Submitted</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {new Date(team.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {team.submissionUrl && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(team.submissionUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Submission
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({members.length}/{team.maxMembers})</CardTitle>
              <CardDescription>View all team members and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{member.name}</span>
                        {member.role === 'owner' && (
                          <Badge variant="default" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                        {member.role === 'admin' && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isAdmin && member.userId !== team.createdBy && member.userId !== user?.uid && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId, member.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="invite" className="space-y-6 mt-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Team Capacity</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {members.length}/{team.maxMembers}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800/50 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Available Slots</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {Math.max(0, team.maxMembers - members.length)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800/50 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Searchable</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {publicProfiles.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-200 dark:bg-emerald-800/50 flex items-center justify-center">
                      <Search className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {members.length >= team.maxMembers ? (
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Team at Capacity</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Your team has reached the maximum capacity of {team.maxMembers} members. Remove a member from the Members tab to invite someone new.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Search Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle>Find People</CardTitle>
                        <CardDescription>Search for people to invite to your team</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative w-full">
                      <Popover open={peopleSearchOpen} onOpenChange={setPeopleSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="people-search-trigger"
                            variant="outline"
                            className="w-full justify-between h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                          >
                            <span className="text-slate-600 dark:text-slate-400">
                              {profileSearch || 'Search by name, email, or username...'}
                            </span>
                            <Search className="h-4 w-4 ml-2 text-slate-400" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[var(--radix-popover-trigger-width)] p-0" 
                          align="start"
                          sideOffset={4}
                        >
                          <Command className="rounded-lg border-0 shadow-lg">
                            <CommandInput
                              placeholder="Search by name, email, or username..."
                              value={profileSearch}
                              onValueChange={setProfileSearch}
                              className="h-12"
                            />
                            <CommandList className="max-h-[300px]">
                              <CommandEmpty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                {loadingProfiles ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                    <span>Loading profiles...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-2">
                                    <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                    <span>No people found</span>
                                    <span className="text-xs">Try a different search term</span>
                                  </div>
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredProfiles.slice(0, 10).map((profile) => (
                                  <CommandItem
                                    key={profile.id}
                                    value={profile.id}
                                    onSelect={() => handleInviteMember(profile)}
                                    disabled={inviting}
                                    className="cursor-pointer px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                                        <AvatarImage src={profile.photo} alt={profile.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                                          {profile.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                          {profile.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {profile.email}
                                          </p>
                                          {profile.username && (
                                            <>
                                              <span className="text-slate-300 dark:text-slate-600">•</span>
                                              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                                @{profile.username}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <UserPlus className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {profileSearch && filteredProfiles.length > 0 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Found {filteredProfiles.length} {filteredProfiles.length === 1 ? 'person' : 'people'}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Invitation Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <CardTitle>Invitation Message</CardTitle>
                        <CardDescription>Add a personal touch to your invitation</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Hi! I'd like to invite you to join our team for this challenge. We're looking for someone with your skills and expertise..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={6}
                      className="resize-none border-2 focus:border-blue-300 dark:focus:border-blue-700"
                    />
                    <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Adding a personal message increases the chances of acceptance. Share why you think they'd be a great fit!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        )}

        {/* Applications Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="applications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Applications</CardTitle>
                    <CardDescription>Review and manage join requests from users</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={applicationFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplicationFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={applicationFilter === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplicationFilter('pending')}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </Button>
                    <Button
                      variant={applicationFilter === 'accepted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplicationFilter('accepted')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Accepted
                    </Button>
                    <Button
                      variant={applicationFilter === 'declined' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setApplicationFilter('declined')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Declined
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                      <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      No {applicationFilter === 'all' ? '' : applicationFilter} applications
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {applicationFilter === 'all' 
                        ? 'No one has applied to join this team yet.' 
                        : `No ${applicationFilter} applications found.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app: any) => (
                      <Card key={app.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={app.applicantPhoto} alt={app.applicantName} />
                              <AvatarFallback>
                                {app.applicantName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                  {app.applicantName}
                                </h3>
                                <Badge
                                  variant={
                                    app.status === 'accepted' 
                                      ? 'default' 
                                      : app.status === 'declined' 
                                      ? 'destructive' 
                                      : 'secondary'
                                  }
                                >
                                  {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {app.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                  {app.status === 'declined' && <XCircle className="h-3 w-3 mr-1" />}
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                {app.applicantEmail}
                              </p>
                              {app.message && (
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg mb-3">
                                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {app.message}
                                  </p>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span>
                                  Applied {new Date(app.createdAt).toLocaleDateString()}
                                </span>
                                {app.reviewedAt && (
                                  <span>
                                    Reviewed {new Date(app.reviewedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {app.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeclineApplication(app.id)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveApplication(app.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                  disabled={team && team.currentMembers >= team.maxMembers}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-6 mt-6">
          {teamId ? (
            <TeamChat teamId={teamId} />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Team Chat</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading chat...
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab (Admin only) */}
        {isAdmin && (
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
                <CardDescription>Update your team information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={teamSettings.name}
                    onChange={(e) => setTeamSettings({ ...teamSettings, name: e.target.value })}
                    placeholder="Enter team name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-description">Description</Label>
                  <Textarea
                    id="team-description"
                    value={teamSettings.description}
                    onChange={(e) => setTeamSettings({ ...teamSettings, description: e.target.value })}
                    placeholder="Describe your team..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-tags">Tags (comma separated)</Label>
                  <Input
                    id="team-tags"
                    value={teamSettings.tags}
                    onChange={(e) => setTeamSettings({ ...teamSettings, tags: e.target.value })}
                    placeholder="e.g. AI, Web3, Mobile"
                  />
                </div>


                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg space-y-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium">Challenge</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{team.challengeTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Max {team.maxMembers} members</p>
                  </div>
                </div>

                <Button
                  onClick={handleUpdateSettings}
                  disabled={savingSettings}
                  className="w-full"
                >
                  {savingSettings ? 'Saving...' : 'Save Changes'}
                </Button>

                {isOwner && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Once you delete a team, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteTeam}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

