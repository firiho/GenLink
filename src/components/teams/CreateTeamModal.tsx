import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, Users, Globe, Lock, Settings, Search, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Trophy, Info, Check } from 'lucide-react';
import { CreateTeamData, Team } from '@/types/team';
import { Challenge } from '@/types/user';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface CreateTeamModalProps {
  onClose: () => void;
  onSubmit: (teamData: CreateTeamData) => void;
}

type Step = 1 | 2 | 3 | 4;

interface PublicProfile {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

export default function CreateTeamModal({ onClose, onSubmit }: CreateTeamModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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

  const stepTitles = [
    { 
      number: 1, 
      title: 'Select Challenge', 
      description: 'Choose which challenge your team will participate in',
      icon: Trophy
    },
    { 
      number: 2, 
      title: 'Team Details', 
      description: 'Give your team a name and description',
      icon: Users
    },
    { 
      number: 3, 
      title: 'Invite Members', 
      description: 'Add team members (optional)',
      icon: Users
    },
    { 
      number: 4, 
      title: 'Review & Create', 
      description: 'Configure settings and review your team',
      icon: Settings
    }
  ];

  // Fetch user's challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user?.uid) return;
      
      setLoadingChallenges(true);
      try {
        // Get challenges the user has joined
        const userChallengesRef = collection(db, 'users', user.uid, 'challenges');
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
          collection(db, 'profiles'),
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

  // Validation functions
  const isStep1Valid = () => {
    return !!teamData.challengeId;
  };

  const isStep2Valid = () => {
    return teamData.name.trim().length >= 3 && 
           teamData.description.trim().length >= 10;
  };

  const isStep3Valid = () => {
    return true; // Optional step
  };

  const isStep4Valid = () => {
    return isStep1Valid() && isStep2Valid();
  };

  const canGoToNextStep = () => {
    switch (currentStep) {
      case 1:
        return isStep1Valid();
      case 2:
        return isStep2Valid();
      case 3:
        return isStep3Valid();
      case 4:
        return isStep4Valid();
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canGoToNextStep() && currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const getProgress = () => {
    return (currentStep / 4) * 100;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="space-y-4 pb-6 border-b border-border">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            Create New Team
          </DialogTitle>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress value={getProgress()} className="h-2" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {stepTitles.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                          isCompleted && "bg-primary border-primary text-primary-foreground",
                          isCurrent && "bg-primary/10 border-primary text-primary scale-110",
                          !isCompleted && !isCurrent && "bg-muted border-border text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={cn(
                          "text-xs font-medium transition-colors",
                          isCurrent && "text-primary",
                          !isCurrent && "text-muted-foreground"
                        )}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                    
                    {index < stepTitles.length - 1 && (
                      <div className={cn(
                        "h-0.5 flex-1 mx-2 transition-colors",
                        isCompleted ? "bg-primary" : "bg-border"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-6 px-1">
          <div className="space-y-6">
            {/* Step Header */}
            <div className="text-center space-y-2 pb-4">
              <h3 className="text-xl font-semibold">{stepTitles[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground">
                {stepTitles[currentStep - 1].description}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Challenge Selection */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      Selecting a challenge first helps us set the right team size and requirements for your team.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <Label htmlFor="challenge" className="text-base font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Select Your Challenge
                    </Label>
                    
                    <Popover open={challengeSearchOpen} onOpenChange={setChallengeSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={challengeSearchOpen}
                          className={cn(
                            "w-full justify-between h-auto py-4",
                            !teamData.challengeId && "text-muted-foreground",
                            teamData.challengeId && "border-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {teamData.challengeId ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Trophy className="h-5 w-5" />
                            )}
                            <div className="text-left">
                              <div className="font-medium">
                                {teamData.challengeId ? teamData.challengeTitle : "Select a challenge..."}
                              </div>
                              {teamData.challengeId && (
                                <div className="text-xs text-muted-foreground">
                                  Max {teamData.maxMembers} members
                                </div>
                              )}
                            </div>
                          </div>
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[600px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search challenges..." />
                          <CommandList>
                            <CommandEmpty>
                              {loadingChallenges ? "Loading challenges..." : "No challenges found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {challenges.map((challenge) => (
                                <CommandItem
                                  key={challenge.id}
                                  value={challenge.id}
                                  onSelect={() => handleChallengeSelect(challenge.id)}
                                  className="py-3"
                                >
                                  <div className="flex items-start gap-3 w-full">
                                    <Trophy className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">{challenge.title}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {challenge.organization} • Max {challenge.maxTeamSize} members
                                      </div>
                                    </div>
                                    {teamData.challengeId === challenge.id && (
                                      <CheckCircle2 className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {!teamData.challengeId && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>Choose the challenge your team will compete in. This determines team size limits and requirements.</p>
                      </div>
                    )}

                    {teamData.challengeId && (
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Challenge selected!</div>
                          <div className="text-xs opacity-80 mt-0.5">
                            Your team can have up to {teamData.maxMembers} members
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Team Details */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                        Team Name
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={teamData.name}
                        onChange={(e) => setTeamData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter a memorable team name"
                        className={cn(
                          "h-12 text-base",
                          teamData.name.trim().length >= 3 && "border-green-500"
                        )}
                      />
                      <div className="flex items-center justify-between text-xs">
                        {teamData.name.trim().length > 0 && teamData.name.trim().length < 3 ? (
                          <span className="text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            At least 3 characters required
                          </span>
                        ) : teamData.name.trim().length >= 3 ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Looking good!
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Minimum 3 characters</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                        Description
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={teamData.description}
                        onChange={(e) => setTeamData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your team's goals, focus areas, and what makes your team unique..."
                        rows={4}
                        className={cn(
                          "text-base resize-none",
                          teamData.description.trim().length >= 10 && "border-green-500"
                        )}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          {teamData.description.trim().length > 0 && teamData.description.trim().length < 10 ? (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              At least 10 characters required
                            </span>
                          ) : teamData.description.trim().length >= 10 ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Great description!
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Minimum 10 characters</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-muted-foreground",
                          teamData.description.length > 500 && "text-destructive"
                        )}>
                          {teamData.description.length} / 500
                        </span>
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="text-base font-semibold">Tags (Optional)</Label>
                      <p className="text-sm text-muted-foreground">
                        Add tags to help others discover your team
                      </p>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button type="button" onClick={addTag} size="default" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>

                      {teamData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                          {teamData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">
                              {tag}
                              <X 
                                className="h-3 w-3 ml-2 cursor-pointer hover:text-destructive transition-colors" 
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Popular tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {commonTags.filter(tag => !teamData.tags.includes(tag)).slice(0, 10).map(tag => (
                            <Badge 
                              key={tag} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => {
                                if (!teamData.tags.includes(tag)) {
                                  setTeamData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                                }
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Invite Members */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-300">
                      This step is optional. You can invite members now or add them later after creating the team.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2">
                      <Label className="text-base font-semibold">Team Members</Label>
                      {teamData.challengeId && (
                        <Badge variant="outline" className="text-sm">
                          {selectedProfiles.length + 1} / {teamData.maxMembers} members
                        </Badge>
                      )}
                    </div>

                    <Popover open={peopleSearchOpen} onOpenChange={setPeopleSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between h-auto py-4"
                          disabled={!teamData.challengeId || selectedProfiles.length + 1 >= teamData.maxMembers}
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            <span>
                              {selectedProfiles.length + 1 >= teamData.maxMembers 
                                ? "Team is at maximum capacity" 
                                : "Search and invite people..."}
                            </span>
                          </div>
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[600px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Search by name or email..." 
                            value={profileSearch}
                            onValueChange={setProfileSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {loadingProfiles ? "Loading profiles..." : "No profiles found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredProfiles.slice(0, 10).map((profile) => (
                                <CommandItem
                                  key={profile.id}
                                  value={profile.id}
                                  onSelect={() => handleAddPerson(profile)}
                                  disabled={selectedProfiles.some(p => p.id === profile.id)}
                                  className="py-3"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <img 
                                      src={profile.photo} 
                                      alt={profile.name}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium">{profile.name}</div>
                                      <div className="text-sm text-muted-foreground">{profile.email}</div>
                                    </div>
                                    {selectedProfiles.some(p => p.id === profile.id) && (
                                      <Badge variant="secondary">Added</Badge>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedProfiles.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">
                          Selected members ({selectedProfiles.length}):
                        </p>
                        <div className="grid gap-2">
                          {selectedProfiles.map(profile => (
                            <div 
                              key={profile.id}
                              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                              <img 
                                src={profile.photo} 
                                alt={profile.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-background"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{profile.name}</div>
                                <div className="text-sm text-muted-foreground truncate">{profile.email}</div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemovePerson(profile.id)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          No members invited yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Search and add people to build your dream team
                        </p>
                      </div>
                    )}

                    {teamData.challengeId && selectedProfiles.length + 1 < teamData.maxMembers && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                        <Info className="h-4 w-4 flex-shrink-0" />
                        <p>
                          You can invite {teamData.maxMembers - selectedProfiles.length - 1} more {teamData.maxMembers - selectedProfiles.length - 1 === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Settings */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Settings Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Team Settings
                    </Label>

                    <div className="space-y-4 p-4 border rounded-lg">
                      {/* Visibility */}
                      <div className="space-y-3">
                        <Label htmlFor="visibility" className="text-sm font-semibold">Team Visibility</Label>
                        <Select 
                          value={teamData.visibility} 
                          onValueChange={(value: 'public' | 'invite-only') => setTeamData(prev => ({ ...prev, visibility: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <div className="text-left">
                                  <div className="font-medium">Public</div>
                                  <div className="text-xs text-muted-foreground">Anyone can discover and request to join</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="invite-only">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                <div className="text-left">
                                  <div className="font-medium">Invite Only</div>
                                  <div className="text-xs text-muted-foreground">Only invited members can join</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Public Team Options */}
                      {teamData.visibility === 'public' && (
                        <div className="space-y-3 pt-3 border-t">
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              id="joinableEnabled" 
                              checked={teamData.joinableEnabled}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                joinableEnabled: checked === true 
                              }))}
                            />
                            <div className="space-y-1">
                              <Label htmlFor="joinableEnabled" className="text-sm font-medium cursor-pointer">
                                Enable joinable link
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Generate a shareable link for instant team joining
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              id="autoApprove" 
                              checked={teamData.autoApprove}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                autoApprove: checked === true 
                              }))}
                            />
                            <div className="space-y-1">
                              <Label htmlFor="autoApprove" className="text-sm font-medium cursor-pointer">
                                Auto-approve join requests
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                New members join instantly without approval
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Member Permissions */}
                      <div className="space-y-3 pt-3 border-t">
                        <Label className="text-sm font-semibold">Member Permissions</Label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="canInviteMembers" 
                              checked={teamData.permissions.canInviteMembers}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                permissions: { ...prev.permissions, canInviteMembers: checked === true }
                              }))}
                            />
                            <Label htmlFor="canInviteMembers" className="text-sm cursor-pointer">
                              Members can invite others
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="canRemoveMembers" 
                              checked={teamData.permissions.canRemoveMembers}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                permissions: { ...prev.permissions, canRemoveMembers: checked === true }
                              }))}
                            />
                            <Label htmlFor="canRemoveMembers" className="text-sm cursor-pointer">
                              Members can remove others
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="canEditTeam" 
                              checked={teamData.permissions.canEditTeam}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                permissions: { ...prev.permissions, canEditTeam: checked === true }
                              }))}
                            />
                            <Label htmlFor="canEditTeam" className="text-sm cursor-pointer">
                              Members can edit team info
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="canManageChallenges" 
                              checked={teamData.permissions.canManageChallenges}
                              onCheckedChange={(checked) => setTeamData(prev => ({ 
                                ...prev, 
                                permissions: { ...prev.permissions, canManageChallenges: checked === true }
                              }))}
                            />
                            <Label htmlFor="canManageChallenges" className="text-sm cursor-pointer">
                              Members can manage challenges
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Review Team Details
                    </Label>

                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Challenge</p>
                            <p className="font-semibold">{teamData.challengeTitle}</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Team Name</p>
                            <p className="font-semibold">{teamData.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</p>
                        <p className="text-sm">{teamData.description}</p>
                      </div>

                      {teamData.tags.length > 0 && (
                        <>
                          <div className="h-px bg-border" />
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {teamData.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {selectedProfiles.length > 0 && (
                        <>
                          <div className="h-px bg-border" />
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Initial Members ({selectedProfiles.length + 1})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selectedProfiles.map(profile => (
                                <div key={profile.id} className="flex items-center gap-2 text-sm">
                                  <img 
                                    src={profile.photo} 
                                    alt={profile.name}
                                    className="w-6 h-6 rounded-full object-cover border"
                                  />
                                  <span className="text-sm">{profile.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="h-px bg-border" />

                      <div className="flex items-center gap-2">
                        {teamData.visibility === 'public' ? (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium capitalize">{teamData.visibility === 'public' ? 'Public Team' : 'Private Team'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 px-6 pb-6 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={currentStep === 1 ? onClose : handlePrevStep}
            className="gap-2"
          >
            {currentStep === 1 ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={!canGoToNextStep()}
                className="gap-2"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="submit"
                onClick={handleSubmit}
                disabled={loading || !isStep4Valid()}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Create Team
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
