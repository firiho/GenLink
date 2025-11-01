import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Team, TeamMember } from '@/types/team';
import { TeamService } from '@/services/teamService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Shield, 
  Crown, 
  Settings as SettingsIcon,
  Trophy,
  Link as LinkIcon,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface ManageTeamModalProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  onTeamUpdated: () => void;
}

interface PublicProfile {
  id: string;
  name: string;
  email: string;
  photo: string;
}

interface Challenge {
  id: string;
  title: string;
  organization: string;
}

export default function ManageTeamModal({ open, onClose, team, onTeamUpdated }: ManageTeamModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentUserMember, setCurrentUserMember] = useState<TeamMember | null>(null);
  const [members, setMembers] = useState<Array<TeamMember & { name: string; email: string; photo: string }>>([]);
  
  // Invite tab
  const [peopleSearchOpen, setPeopleSearchOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState('');
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  
  // Settings tab
  const [teamSettings, setTeamSettings] = useState({
    name: team.name,
    description: team.description,
    visibility: team.visibility,
    joinableEnabled: team.joinableEnabled,
    autoApprove: team.autoApprove,
    tags: team.tags.join(', '),
  });

  // Check if current user is admin/owner
  const isAdmin = currentUserMember?.role === 'admin' || currentUserMember?.role === 'owner';
  const isOwner = currentUserMember?.role === 'owner';

  useEffect(() => {
    if (open && user) {
      loadTeamData();
    }
  }, [open, user, team.id]);

  const loadTeamData = async () => {
    if (!user) return;
    
    try {
      // Get current user's member info
      const memberInfo = await TeamService.getTeamMember(team.id, user.uid);
      setCurrentUserMember(memberInfo);
      
      // Get all team members
      const teamMembers = await TeamService.getTeamMembersWithProfiles(team.id);
      setMembers(teamMembers);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast.error('Failed to load team data');
    }
  };

  // Load public profiles for inviting
  useEffect(() => {
    const loadProfiles = async () => {
      if (!user || members.length === 0) return;
      
      setLoadingProfiles(true);
      try {
        const { getDocs, collection, query: firestoreQuery } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Query all public profiles (searchable field might not exist on all profiles)
        const profilesQuery = firestoreQuery(
          collection(db, 'profiles')
        );
        
        const profilesSnap = await getDocs(profilesQuery);
        const profiles: PublicProfile[] = profilesSnap.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || data.displayName || 'Unknown User',
              email: data.email || '',
              photo: data.photo || '/placeholder-user.svg'
            };
          })
          // Exclude current members and current user
          .filter(profile => 
            profile.id !== user.uid && 
            !members.some(m => m.userId === profile.id)
          );
        
        console.log('Loaded profiles for invitation:', profiles.length);
        setPublicProfiles(profiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        toast.error('Failed to load profiles');
      } finally {
        setLoadingProfiles(false);
      }
    };

    if (open && members.length > 0) {
      loadProfiles();
    }
  }, [open, user, members.length]);

  const filteredProfiles = publicProfiles.filter(profile =>
    profile.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
    profile.email.toLowerCase().includes(profileSearch.toLowerCase())
  );

  const handleInviteMember = async (profile: PublicProfile) => {
    if (!user || !isAdmin) {
      toast.error('Only admins can invite members');
      return;
    }

    if (members.length >= team.maxMembers) {
      toast.error(`Team is at maximum capacity (${team.maxMembers} members)`);
      return;
    }

    setLoading(true);
    try {
      await TeamService.inviteFromPublicProfile(team.id, profile.id, user.uid, inviteMessage);
      toast.success(`Invitation sent to ${profile.name}`);
      setPeopleSearchOpen(false);
      setInviteMessage('');
      setProfileSearch('');
      
      // Remove from available profiles
      setPublicProfiles(prev => prev.filter(p => p.id !== profile.id));
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!user || !isAdmin) {
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

    setLoading(true);
    try {
      await TeamService.removeTeamMember(team.id, memberId);
      toast.success(`${memberName} removed from team`);
      await loadTeamData();
      onTeamUpdated();
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!user || !isAdmin) {
      toast.error('Only admins can update team settings');
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<Team> = {
        name: teamSettings.name,
        description: teamSettings.description,
        visibility: teamSettings.visibility as 'public' | 'invite-only',
        joinableEnabled: teamSettings.joinableEnabled,
        autoApprove: teamSettings.autoApprove,
        tags: teamSettings.tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: new Date(),
      };

      await TeamService.updateTeam(team.id, updates);
      toast.success('Team settings updated');
      onTeamUpdated();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error(error.message || 'Failed to update team settings');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJoinLink = async () => {
    if (!user || !isAdmin) {
      toast.error('Only admins can generate join links');
      return;
    }

    setLoading(true);
    try {
      const link = await TeamService.generateJoinableLink(team.id, user.uid);
      await navigator.clipboard.writeText(link);
      toast.success('Join link copied to clipboard!');
      onTeamUpdated();
    } catch (error: any) {
      console.error('Error generating join link:', error);
      toast.error(error.message || 'Failed to generate join link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!user || !isOwner) {
      toast.error('Only the team owner can delete the team');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await TeamService.deleteTeam(team.id);
      toast.success('Team deleted successfully');
      onClose();
      onTeamUpdated();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast.error(error.message || 'Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUserMember) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Manage Team
          </DialogTitle>
          <DialogDescription>
            {team.name} - {team.challengeTitle}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invite" disabled={!isAdmin}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </TabsTrigger>
            <TabsTrigger value="settings" disabled={!isAdmin}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({members.length}/{team.maxMembers})</CardTitle>
                <CardDescription>Manage your team members and their roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photo} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
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
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    {isAdmin && member.userId !== team.createdBy && member.userId !== user?.uid && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId, member.name)}
                        disabled={loading}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invite Tab */}
          <TabsContent value="invite" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <CardDescription>
                  Invite people to join your team ({members.length}/{team.maxMembers} slots filled)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {members.length >= team.maxMembers ? (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Team is at maximum capacity. Remove a member to invite someone new.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Search People</Label>
                      <Popover open={peopleSearchOpen} onOpenChange={setPeopleSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between bg-white dark:bg-slate-900"
                          >
                            <span>Search for people to invite...</span>
                            <Search className="h-4 w-4 ml-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-white dark:bg-slate-900" align="start">
                          <Command className="bg-white dark:bg-slate-900">
                            <CommandInput
                              placeholder="Search by name or email..."
                              value={profileSearch}
                              onValueChange={setProfileSearch}
                              className="bg-white dark:bg-slate-900"
                            />
                            <CommandList className="bg-white dark:bg-slate-900">
                              <CommandEmpty className="text-slate-500 dark:text-slate-400">
                                {loadingProfiles ? "Loading..." : "No people found"}
                              </CommandEmpty>
                              <CommandGroup>
                                {filteredProfiles.slice(0, 10).map((profile) => (
                                  <CommandItem
                                    key={profile.id}
                                    value={profile.id}
                                    onSelect={() => handleInviteMember(profile)}
                                    className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={profile.photo} alt={profile.name} />
                                        <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{profile.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Invitation Message (Optional)</Label>
                      <Textarea
                        placeholder="Add a personal message to your invitation..."
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {team.visibility === 'public' && (
                      <div className="pt-4 border-t">
                        <Label>Join Link</Label>
                        <p className="text-sm text-slate-500 mb-2">Generate a shareable link for people to join</p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleGenerateJoinLink}
                          disabled={loading || members.length >= team.maxMembers}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {team.joinableLink ? 'Copy Join Link' : 'Generate Join Link'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
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

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-approve applications</Label>
                    <p className="text-sm text-slate-500">Automatically accept join requests</p>
                  </div>
                  <Switch
                    checked={teamSettings.autoApprove}
                    onCheckedChange={(checked) => setTeamSettings({ ...teamSettings, autoApprove: checked })}
                  />
                </div>

                {team.visibility === 'public' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable join link</Label>
                      <p className="text-sm text-slate-500">Allow people to join via shareable link</p>
                    </div>
                    <Switch
                      checked={teamSettings.joinableEnabled}
                      onCheckedChange={(checked) => setTeamSettings({ ...teamSettings, joinableEnabled: checked })}
                    />
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg space-y-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium">Challenge</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{team.challengeTitle}</p>
                    <p className="text-xs text-slate-500">Max {team.maxMembers} members</p>
                  </div>
                </div>

                <Button
                  onClick={handleUpdateSettings}
                  disabled={loading}
                  className="w-full"
                >
                  Save Changes
                </Button>

                {isOwner && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteTeam}
                      disabled={loading}
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

