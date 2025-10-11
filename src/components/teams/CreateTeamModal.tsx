import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Users, Globe, Lock, Settings, Search } from 'lucide-react';
import { CreateTeamData, Team } from '@/types/team';
import { Challenge } from '@/types/user';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CreateTeamModalProps {
  onClose: () => void;
  onSubmit: (teamData: CreateTeamData) => void;
}

interface PublicProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export default function CreateTeamModal({ onClose, onSubmit }: CreateTeamModalProps) {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState<CreateTeamData>({
    name: '',
    description: '',
    challengeId: '',
    challengeTitle: '',
    maxMembers: 5,
    visibility: 'public',
    joinableEnabled: false,
    autoApprove: false,
    initialMembers: [],
    tags: [],
    permissions: {
      canInviteMembers: true,
      canRemoveMembers: true,
      canEditTeam: true,
      canManageChallenges: true
    }
  });

  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Challenge selection
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challengeSearchOpen, setChallengeSearchOpen] = useState(false);
  
  // People search
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [peopleSearchOpen, setPeopleSearchOpen] = useState(false);
  const [profileSearch, setProfileSearch] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<PublicProfile[]>([]);

  const commonTags = [
    'Startup', 'Enterprise', 'Open Source', 'Fintech', 'Healthcare', 'Education',
    'E-commerce', 'Gaming', 'Social Media', 'IoT', 'AR/VR', 'Cloud', 'Mobile',
    'Web', 'Desktop', 'API', 'Microservices', 'Agile', 'Remote', 'Local'
  ];

  // Fetch user's challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user?.uid) return;
      
      setLoadingChallenges(true);
      try {
        // Get challenges the user has joined
        const userChallengesRef = collection(db, 'profiles', user.uid, 'challenges');
        const userChallengesSnap = await getDocs(userChallengesRef);
        
        const challengesData: Challenge[] = [];
        
        for (const challengeDoc of userChallengesSnap.docs) {
          const challengeId = challengeDoc.id;
          const challengeRef = doc(db, 'challenges', challengeId);
          const challengeSnap = await getDoc(challengeRef);
          
          if (challengeSnap.exists()) {
            const data = challengeSnap.data();
            challengesData.push({
              id: challengeSnap.id,
              title: data.title || 'Unnamed Challenge',
              description: data.description || '',
              organization: data.companyInfo?.name || 'Unknown',
              participants: data.participants || 0,
              status: data.status || 'active',
              submissions: data.submissions || 0,
              progress: 0,
              daysLeft: 0,
              prize: data.total_prize ? `$${data.total_prize}` : 'No prize',
              deadline: data.deadline || '',
              categories: data.categories || [],
              createdAt: data.createdAt || '',
              updatedAt: data.updatedAt || '',
              allowTeams: data.allowTeams !== false,
              maxTeamSize: data.maxTeamSize || 5
            });
          }
        }
        
        setChallenges(challengesData);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoadingChallenges(false);
      }
    };

    fetchChallenges();
  }, [user]);

  // Fetch public profiles for people search
  useEffect(() => {
    const fetchPublicProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const profilesQuery = query(
          collection(db, 'public_profiles'),
          where('userId', '!=', user?.uid || '')
        );
        
        const profilesSnap = await getDocs(profilesQuery);
        const profiles: PublicProfile[] = [];
        
        profilesSnap.forEach((doc) => {
          const data = doc.data();
          profiles.push({
            id: doc.id,
            name: data.name || data.displayName || 'Unknown',
            email: data.email || '',
            photo: data.photo || '/placeholder user.svg'
          });
        });
        
        setPublicProfiles(profiles);
      } catch (error) {
        console.error('Error fetching public profiles:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    if (user?.uid) {
      fetchPublicProfiles();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamData.name.trim() || !teamData.description.trim() || !teamData.challengeId) {
      return;
    }

    // Prevent double submission
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(teamData);
      onClose(); // Close modal after successful creation
    } catch (error) {
      console.error('Error creating team:', error);
      setLoading(false); // Only reset loading on error, not success
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    const selectedChallenge = challenges.find(c => c.id === challengeId);
    if (selectedChallenge) {
      setTeamData(prev => ({
        ...prev,
        challengeId: selectedChallenge.id,
        challengeTitle: selectedChallenge.title,
        maxMembers: selectedChallenge.maxTeamSize || 5
      }));
    }
    setChallengeSearchOpen(false);
  };

  const handleAddPerson = (profile: PublicProfile) => {
    // Check if adding this person would exceed max team size (including the creator)
    if (selectedProfiles.length + 1 >= teamData.maxMembers) {
      setPeopleSearchOpen(false);
      return;
    }
    
    if (!selectedProfiles.find(p => p.id === profile.id)) {
      const updatedProfiles = [...selectedProfiles, profile];
      setSelectedProfiles(updatedProfiles);
      setTeamData(prev => ({
        ...prev,
        initialMembers: updatedProfiles.map(p => p.id)
      }));
    }
    setPeopleSearchOpen(false);
  };

  const handleRemovePerson = (profileId: string) => {
    const updatedProfiles = selectedProfiles.filter(p => p.id !== profileId);
    setSelectedProfiles(updatedProfiles);
    setTeamData(prev => ({
      ...prev,
      initialMembers: updatedProfiles.map(p => p.id)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !teamData.tags.includes(newTag.trim())) {
      setTeamData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTeamData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const filteredProfiles = publicProfiles.filter(profile => 
    profile.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
    profile.email.toLowerCase().includes(profileSearch.toLowerCase())
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Team
          </DialogTitle>
          <DialogDescription>
            Set up your team with the right settings and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Challenge *</h3>
            
            <div className="space-y-2">
              <Label htmlFor="challenge">Select Challenge</Label>
              <Popover open={challengeSearchOpen} onOpenChange={setChallengeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={challengeSearchOpen}
                    className="w-full justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    {teamData.challengeId 
                      ? teamData.challengeTitle
                      : "Select a challenge..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" align="start">
                  <Command className="bg-white dark:bg-slate-900">
                    <CommandInput placeholder="Search challenges..." className="bg-white dark:bg-slate-900" />
                    <CommandList className="bg-white dark:bg-slate-900">
                      <CommandEmpty className="text-slate-500 dark:text-slate-400">
                        {loadingChallenges ? "Loading challenges..." : "No challenges found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {challenges.map((challenge) => (
                          <CommandItem
                            key={challenge.id}
                            value={challenge.id}
                            onSelect={() => handleChallengeSelect(challenge.id)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 dark:text-white">{challenge.title}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{challenge.organization}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {teamData.challengeId && (
              <div className="text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                Max team size for this challenge: {teamData.maxMembers} members
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={teamData.name}
                onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={teamData.description}
                onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your team's goals and focus"
                rows={3}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                required
              />
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visibility & Access
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="visibility">Team Visibility</Label>
              <Select 
                value={teamData.visibility} 
                onValueChange={(value: 'public' | 'invite-only') => setTeamData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectItem value="public" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public - Anyone can discover and request to join
                    </div>
                  </SelectItem>
                  <SelectItem value="invite-only" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Invite Only - Members invite others
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {teamData.visibility === 'public' && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="joinableEnabled" 
                    checked={teamData.joinableEnabled}
                    onCheckedChange={(checked) => setTeamData(prev => ({ 
                      ...prev, 
                      joinableEnabled: checked === true 
                    }))}
                  />
                  <Label htmlFor="joinableEnabled" className="text-sm font-medium">
                    Enable joinable link
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoApprove" 
                    checked={teamData.autoApprove}
                    onCheckedChange={(checked) => setTeamData(prev => ({ 
                      ...prev, 
                      autoApprove: checked === true 
                    }))}
                  />
                  <Label htmlFor="autoApprove" className="text-sm">
                    Auto-approve join requests
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Invite People */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Invite Team Members (Optional)
              </h3>
              {teamData.challengeId && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedProfiles.length + 1} / {teamData.maxMembers} members
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Search and add people</Label>
              <Popover open={peopleSearchOpen} onOpenChange={setPeopleSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    disabled={!teamData.challengeId || selectedProfiles.length + 1 >= teamData.maxMembers}
                  >
                    {selectedProfiles.length + 1 >= teamData.maxMembers 
                      ? "Team is full" 
                      : "Search people..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800" align="start">
                  <Command className="bg-white dark:bg-slate-900">
                    <CommandInput 
                      placeholder="Search by name or email..." 
                      value={profileSearch}
                      onValueChange={setProfileSearch}
                      className="bg-white dark:bg-slate-900"
                    />
                    <CommandList className="bg-white dark:bg-slate-900">
                      <CommandEmpty className="text-slate-500 dark:text-slate-400">
                        {loadingProfiles ? "Loading profiles..." : "No profiles found."}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredProfiles.slice(0, 10).map((profile) => (
                          <CommandItem
                            key={profile.id}
                            value={profile.id}
                            onSelect={() => handleAddPerson(profile)}
                            disabled={selectedProfiles.some(p => p.id === profile.id)}
                            className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={profile.photo} 
                                alt={profile.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900 dark:text-white">{profile.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{profile.email}</span>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {!teamData.challengeId && (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Please select a challenge first to invite team members
                </p>
              )}
              
              {teamData.challengeId && selectedProfiles.length + 1 >= teamData.maxMembers && (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Team is at maximum capacity ({teamData.maxMembers} members including you)
                </p>
              )}
              
              {teamData.challengeId && selectedProfiles.length + 1 < teamData.maxMembers && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You can invite up to {teamData.maxMembers - selectedProfiles.length - 1} more {teamData.maxMembers - selectedProfiles.length - 1 === 1 ? 'person' : 'people'}
                </p>
              )}
            </div>

            {selectedProfiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProfiles.map(profile => (
                  <Badge key={profile.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                    <img 
                      src={profile.photo} 
                      alt={profile.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span>{profile.name}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleRemovePerson(profile.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tags</h3>
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {teamData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400">
              Popular tags:
            </div>
            <div className="flex flex-wrap gap-2">
              {commonTags.slice(0, 8).map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    if (!teamData.tags.includes(tag)) {
                      setTeamData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Member Permissions
            </h3>
            
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canInviteMembers" 
                  checked={teamData.permissions.canInviteMembers}
                  onCheckedChange={(checked) => setTeamData(prev => ({ 
                    ...prev, 
                    permissions: { ...prev.permissions, canInviteMembers: checked === true }
                  }))}
                />
                <Label htmlFor="canInviteMembers" className="text-sm">
                  Members can invite others
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canRemoveMembers" 
                  checked={teamData.permissions.canRemoveMembers}
                  onCheckedChange={(checked) => setTeamData(prev => ({ 
                    ...prev, 
                    permissions: { ...prev.permissions, canRemoveMembers: checked === true }
                  }))}
                />
                <Label htmlFor="canRemoveMembers" className="text-sm">
                  Members can remove others
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canEditTeam" 
                  checked={teamData.permissions.canEditTeam}
                  onCheckedChange={(checked) => setTeamData(prev => ({ 
                    ...prev, 
                    permissions: { ...prev.permissions, canEditTeam: checked === true }
                  }))}
                />
                <Label htmlFor="canEditTeam" className="text-sm">
                  Members can edit team info
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canManageChallenges" 
                  checked={teamData.permissions.canManageChallenges}
                  onCheckedChange={(checked) => setTeamData(prev => ({ 
                    ...prev, 
                    permissions: { ...prev.permissions, canManageChallenges: checked === true }
                  }))}
                />
                <Label htmlFor="canManageChallenges" className="text-sm">
                  Members can manage challenges
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !teamData.name.trim() || !teamData.description.trim() || !teamData.challengeId}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
