import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Calendar, Users, Timer, Award, Clock, Link2, Download, Globe, Copy,
 BarChart2, Share2, BriefcaseBusiness, CalendarDays, Tag, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, setDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import { format, isValid } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { TeamService } from '@/services/teamService';
import { Team } from '@/types/team';

export default function ChallengeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedChallenges, setRelatedChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoining, setIsJoining] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [showTeamJoinModal, setShowTeamJoinModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id) {
        navigate('/challenges');
        return;
      }

      try {
        setIsLoading(true);
        const challengeRef = doc(db, 'challenges', id);
        const challengeSnap = await getDoc(challengeRef);
        
        if (!challengeSnap.exists()) {
          toast.error('Challenge not found');
          navigate('/challenges');
          return;
        }
        
        const data = challengeSnap.data();
        
        // Fetch user teams if user is a participant
        if (user && user.userType === 'participant') {
          try {
            const teams = await TeamService.getUserTeams(user.uid);
            setUserTeams(teams);
          } catch (error) {
            console.error('Error fetching user teams:', error);
          }
        }
        
        // Convert timestamps and calculate days left
        const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
        const deadlineDate = data.deadline ? new Date(data.deadline) : null;
        
        // Calculate days left till deadline
        const today = new Date();
        const daysLeft = deadlineDate 
          ? Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        
        // Format the challenge data
        const challengeData = {
          id: challengeSnap.id,
          title: data.title || 'Unnamed Challenge',
          organizer: data.companyInfo?.name || 'Unknown Organizer',
          organizerLogo: data.companyInfo?.logoUrl || null,
          organizerWebsite: data.companyInfo?.website || null,
          prize: data.prize || 'No prize information',
          prizeDistribution: data.prizeDistribution || {},
          total_prize: data.total_prize || 0,
          participants: data.participants || 0,
          daysLeft: daysLeft,
          image: data.coverImageUrl || "/placeholder-challenge.jpg",
          category: data.categories && data.categories.length ? data.categories[0] : 'Uncategorized',
          categories: data.categories || [],
          featured: data.featured || false,
          deadline: data.deadline || null,
          description: data.description || '',
          skills: data.skills || [],
          requirements: data.requirements || '',
          evaluationCriteria: data.evaluationCriteria || '',
          timeline: data.timeline || [],
          judges: data.judges || [],
          resources: data.resources || [],
          faq: data.faq || [],
          allowTeams: data.allowTeams || false,
          maxTeamSize: data.maxTeamSize || 1,
          createdAt: createdAt,
          status: data.status || 'active',
          termsAndConditions: data.termsAndConditions || ''
        };
        
        setChallenge(challengeData);
        
        // Fetch related challenges (same category)
        if (challengeData.categories && challengeData.categories.length) {
          const primaryCategory = challengeData.categories[0];
          const relatedRef = collection(db, 'challenges');
          const relatedQuery = query(
            relatedRef,
            where('visibility', '==', 'public'),
            where('status', '==', 'active'),
            where('categories', 'array-contains', primaryCategory)
          );
          
          const relatedSnap = await getDocs(relatedQuery);
          const relatedList = [];
          
          relatedSnap.forEach(doc => {
            if (doc.id !== id) { // Don't include the current challenge
              const relData = doc.data();
              relatedList.push({
                id: doc.id,
                title: relData.title,
                image: relData.coverImageUrl || "/placeholder-challenge.jpg",
                organizer: relData.companyInfo?.name || 'Unknown',
                prize: relData.total_prize ? `$${relData.total_prize.toLocaleString()}` : 'No prize'
              });
            }
          });
          
          setRelatedChallenges(relatedList.slice(0, 3)); // Only take the first 3
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
        toast.error('Error loading challenge');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChallenge();
  }, [id, navigate]);

const handleAddChallenge = async (challengeId) => {
  try {
    setIsJoining(true);
    
    // Check if user is logged in
    if (!user) {
      toast.error('You need to be logged in to join a challenge');
      navigate('/login?redirect=' + encodeURIComponent(`/challenges/${id}`));
      return;
    }
    
    // Get user profile to check role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    if (!userData || userData.user_type !== 'participant') {
      toast.error('Only participants can join challenges');
      navigate('/signup');
      return;
    }
    
    // Check if user already joined this specific challenge
    const submissionId = `${user.uid}_${challengeId}`;
    const submissionRef = doc(db, 'submissions', submissionId);
    const submissionSnap = await getDoc(submissionRef);
    
    if (submissionSnap.exists()) {
      toast.info('You have already joined this challenge');
      // Navigate to appropriate dashboard based on user role
      if (user?.role === 'partner') {
        navigate('/partner/dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
      return;
    }
    
    // Add user's challenge to their profile first (this should have proper permissions)
    const userChallengeRef = doc(db, 'users', user.uid, 'challenges', challengeId);
    await setDoc(userChallengeRef, {
      challengeId: challengeId,
      joinedAt: new Date(),
      status: 'in-progress'
    });
    
    // Create submission document next
    await setDoc(submissionRef, {
      userId: user.uid,
      challengeId: challengeId,
      status: 'in-progress',
      progress: 0,
      submissionUrl: '',
      feedback: '',
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const publicProfileRef = doc(db, 'profiles', user.uid);
    await setDoc(publicProfileRef, {
        total_active_challenges: increment(1)
    }, { merge: true });
    
    toast.success('Challenge added to your dashboard successfully!');
    // Navigate to appropriate dashboard based on user role
    if (user?.role === 'partner') {
      navigate('/partner/dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  } catch (error) {
    console.error("Error joining challenge:", error);
    toast.error('Error joining challenge: ' + error.message);
  } finally {
    setIsJoining(false);
  }
};

const handleJoinAsTeam = async (teamId: string) => {
  try {
    setIsJoining(true);
    
    // Check if team can join (size limits, etc.)
    const team = await TeamService.getTeam(teamId);
    if (!team || team.currentMembers >= team.maxMembers) {
      toast.error('Team is full or unavailable');
      return;
    }
    
    // Create team challenge participation
    await TeamService.joinChallengeAsTeam(teamId, id!);
    
    toast.success('Team joined challenge successfully!');
    setShowTeamJoinModal(false);
    
    // Navigate to dashboard
    navigate('/dashboard');
  } catch (error) {
    console.error('Error joining challenge as team:', error);
    toast.error('Failed to join challenge as team');
  } finally {
    setIsJoining(false);
  }
};

  if (isLoading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      <ChallengeSkeleton />
    </div>
  );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Challenge not found</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">The challenge you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
            onClick={() => navigate('/challenges')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Challenges
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      <div className="pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen pb-20"
        >
          {/* Challenge Header */}
          <div 
            className="w-full bg-cover bg-center h-48 sm:h-56 md:h-72 relative"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${challenge.image})` 
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="container mx-auto px-4 text-center text-white">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl mx-auto leading-tight">
                  {challenge.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  {challenge.categories.map(category => (
                    <Badge key={category} className="bg-white/20 text-white hover:bg-white/30 text-xs sm:text-sm">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{challenge.daysLeft > 0 ? `${challenge.daysLeft} days left` : 'Challenge ended'}</span>
                    <span className="sm:hidden">{challenge.daysLeft > 0 ? `${challenge.daysLeft}d left` : 'Ended'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{challenge.participants} participants</span>
                    <span className="sm:hidden">{challenge.participants}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {challenge.total_prize > 0 
                        ? `$${challenge.total_prize.toLocaleString()} in prizes` 
                        : challenge.prize}
                    </span>
                    <span className="sm:hidden">
                      {challenge.total_prize > 0 
                        ? `$${challenge.total_prize.toLocaleString()}` 
                        : challenge.prize}
                    </span>
                  </div>
                  {challenge.deadline && isValid(new Date(challenge.deadline)) && (
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Deadline: {format(new Date(challenge.deadline), 'MMM d, yyyy')}</span>
                      <span className="sm:hidden">{format(new Date(challenge.deadline), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="top-4 left-4 text-white hover:bg-white/20 z-10 pointer-events-auto"
              onClick={() => navigate('/challenges')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Challenges
            </Button>
          </div>
          
          {/* Main Content */}
          <div className="container mx-auto px-4 mt-10">
            <div className="bg-white dark:bg-slate-900 rounded-t-xl border border-slate-200 dark:border-slate-800 shadow-lg">
              {/* Organizer and Action Row */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-700 gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 mr-3 sm:mr-4 overflow-hidden">
                    {challenge.organizerLogo ? (
                      <img 
                        src={challenge.organizerLogo} 
                        alt={challenge.organizer}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-base">
                        {challenge.organizer.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Organized by</p>
                    <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{challenge.organizer}</h2>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex-1 sm:flex-none"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-slate-100 dark:text-slate-900 flex-1 sm:flex-none"
                    onClick={() => {handleAddChallenge(challenge.id)}}
                    disabled={isJoining || challenge.daysLeft <= 0}
                  >
                    {isJoining ? (
                      <>
                        <span className="h-4 w-4 border-2 border-slate-100 dark:border-slate-900 border-t-transparent rounded-full animate-spin mr-1"></span>
                        <span className="hidden sm:inline">Joining...</span>
                        <span className="sm:hidden">Joining...</span>
                      </>
                    ) : challenge.daysLeft > 0 ? (
                      <>
                        <span className="hidden sm:inline">Join Challenge</span>
                        <span className="sm:hidden">Join</span>
                      </>
                    ) : null}
                  </Button>
                  
                  {/* Team Join Button */}
                  {user && user.userType === 'participant' && userTeams.length > 0 && challenge.allowTeams && (
                    <Button 
                      onClick={() => setShowTeamJoinModal(true)}
                      disabled={isJoining || challenge.daysLeft <= 0}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-1 sm:flex-none"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden sm:inline">Join as Team</span>
                      <span className="sm:hidden">Team</span>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                  <TabsList className="h-12 sm:h-14 justify-start bg-transparent border-b-0 p-0 gap-2 sm:gap-6 min-w-max">
                    <TabsTrigger 
                      value="overview"
                      className="h-12 sm:h-14 px-2 sm:px-0 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 rounded-none data-[state=active]:shadow-none text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details"
                      className="h-12 sm:h-14 px-2 sm:px-0 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 rounded-none data-[state=active]:shadow-none text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Details & Criteria</span>
                      <span className="sm:hidden">Details</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="timeline"
                      className="h-12 sm:h-14 px-2 sm:px-0 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 rounded-none data-[state=active]:shadow-none text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prizes"
                      className="h-12 sm:h-14 px-2 sm:px-0 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 rounded-none data-[state=active]:shadow-none text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      Prizes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resources"
                      className="h-12 sm:h-14 px-2 sm:px-0 data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 rounded-none data-[state=active]:shadow-none text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs sm:text-sm whitespace-nowrap"
                    >
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Tab Contents */}
                <TabsContent value="overview" className="p-4 sm:p-6 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Challenge Overview</h3>
                        <div className="prose max-w-none">
                          {challenge.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-slate-700 dark:text-slate-300">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      
                      {challenge.skills.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Skills Needed</h3>
                          <div className="flex flex-wrap gap-2">
                            {challenge.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="px-3 py-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                <Tag className="w-3.5 h-3.5 mr-1.5" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                        <h4 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Challenge Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Submission Deadline</p>
                            <p className="font-medium flex items-center text-slate-900 dark:text-white">
                              <CalendarDays className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                              {challenge.deadline && isValid(new Date(challenge.deadline))
                                ? format(new Date(challenge.deadline), 'MMMM d, yyyy') 
                                : 'Not specified'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Prize</p>
                            <p className="font-medium flex items-center text-slate-900 dark:text-white">
                              <Trophy className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                              {challenge.total_prize > 0 
                                ? `$${challenge.total_prize.toLocaleString()}` 
                                : challenge.prize}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Participation</p>
                            <p className="font-medium flex items-center text-slate-900 dark:text-white">
                              <Users className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                              {challenge.allowTeams 
                                ? `Teams of up to ${challenge.maxTeamSize} allowed` 
                                : 'Individual participation only'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                            <p className="font-medium flex items-center text-slate-900 dark:text-white">
                              <Clock className="w-4 h-4 mr-2 text-slate-600 dark:text-slate-400" />
                              {challenge.daysLeft > 0 
                                ? `${challenge.daysLeft} days remaining` 
                                : 'Challenge ended'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Categories</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {challenge.categories.map(category => (
                                <span key={category} className="px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-4 sm:p-6 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {challenge.requirements && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                          <div className="prose max-w-none">
                            {challenge.requirements.split('\n').map((paragraph, i) => (
                              <p key={i} className="mb-4">{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {challenge.evaluationCriteria && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Evaluation Criteria</h3>
                          <div className="prose max-w-none">
                            {challenge.evaluationCriteria.split('\n').map((paragraph, i) => (
                              <p key={i} className="mb-4">{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {challenge.judges && challenge.judges.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Judges</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {challenge.judges.map((judge, index) => (
                              <div key={index} className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg border border-border">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-accent/10 text-accent">{judge.name ? judge.name.charAt(0) : '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium text-foreground">{judge.name || 'Unknown Judge'}</h4>
                                  <p className="text-sm text-muted-foreground">{judge.title || ''}</p>
                                  {judge.organization && (
                                    <p className="text-xs text-muted-foreground mt-1">{judge.organization}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {challenge.termsAndConditions && (
                        <div className="bg-muted/20 rounded-lg p-6 border border-border">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Terms & Conditions</h4>
                          <div className="text-sm text-muted-foreground prose max-w-none">
                            <p>{challenge.termsAndConditions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="p-4 sm:p-6 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">Challenge Timeline</h3>
                      
                      {challenge.timeline && challenge.timeline.length > 0 ? (
                        <div className="relative">
                          {/* Timeline connector line */}
                          <div className="absolute h-full w-px bg-gray-200 left-4"></div>
                          
                          {/* Timeline items */}
                          <div className="space-y-6">
                            {/* Start date */}
                            <div className="relative pl-12">
                              <div className="absolute left-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <h4 className="font-medium">Challenge Launch</h4>
                              <p className="text-sm text-gray-500">
                                {challenge.createdAt && isValid(challenge.createdAt)
                                  ? format(challenge.createdAt, 'MMMM d, yyyy')
                                  : 'Date not available'}
                              </p>
                            </div>

                            {/* Timeline phases */}
                            {challenge.timeline.map((phase, index) => (
                              <div key={index} className="relative pl-12">
                                <div className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <BarChart2 className="h-4 w-4 text-gray-600" />
                                </div>
                                <h4 className="font-medium">{phase.phase}</h4>
                                {phase.startDate && phase.endDate ? (
                                  <p className="text-sm text-gray-500">
                                    {isValid(new Date(phase.startDate)) && isValid(new Date(phase.endDate)) 
                                      ? `${format(new Date(phase.startDate), 'MMM d')} - ${format(new Date(phase.endDate), 'MMM d, yyyy')}`
                                      : 'Date range not available'}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                            
                            {/* End date */}
                            <div className="relative pl-12">
                              <div className="absolute left-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Trophy className="h-4 w-4 text-white" />
                              </div>
                              <h4 className="font-medium">Winners Announced</h4>
                              {challenge.timeline.length > 0 && 
                               challenge.timeline[challenge.timeline.length - 1].endDate && 
                               isValid(new Date(challenge.timeline[challenge.timeline.length - 1].endDate)) ? (
                                <p className="text-sm text-gray-500">
                                  After {format(new Date(challenge.timeline[challenge.timeline.length - 1].endDate), 'MMMM d, yyyy')}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500">Date to be determined</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500">No detailed timeline provided for this challenge.</div>
                      )}
                    </div>
                    
                    <div className="bg-muted/20 rounded-lg p-6 border border-border">
                      <h4 className="text-lg font-semibold mb-4 text-foreground">Important Dates</h4>
                      <div className="space-y-4">                        
                        <div>
                          <p className="text-sm text-muted-foreground">Submission Deadline</p>
                          <p className="font-medium text-foreground">
                            {challenge.deadline && isValid(new Date(challenge.deadline))
                              ? format(new Date(challenge.deadline), 'MMMM d, yyyy') 
                              : 'Not specified'}
                          </p>
                        </div>
                        
                        {challenge.timeline && challenge.timeline.map((phase, index) => (
                          <div key={index}>
                            <p className="text-sm text-muted-foreground">{phase.phase}</p>
                            {phase.startDate && phase.endDate && 
                             isValid(new Date(phase.startDate)) && isValid(new Date(phase.endDate)) ? (
                              <p className="font-medium text-foreground">
                                {format(new Date(phase.startDate), 'MMM d')} - {format(new Date(phase.endDate), 'MMM d, yyyy')}
                              </p>
                            ) : (
                              <p className="font-medium text-foreground">Date TBD</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="prizes" className="p-4 sm:p-6 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">Prizes</h3>
                      
                      {/* Visual Prize Distribution */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* 1st Place */}
                        <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800/30 text-center">
                          <div className="mx-auto w-16 h-16 bg-amber-400 dark:bg-amber-600 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1 text-foreground">1st Place</h4>
                          <p className="text-amber-800 dark:text-amber-300 font-bold text-xl">
                            ${challenge.prizeDistribution?.first}
                          </p>
                        </div>
                        
                        {/* 2nd Place */}
                        <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                          <div className="mx-auto w-16 h-16 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center mb-4">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1 text-foreground">2nd Place</h4>
                          <p className="text-gray-800 dark:text-gray-200 font-bold text-xl">
                            ${challenge.prizeDistribution?.second}
                          </p>
                        </div>
                        
                        {/* 3rd Place */}
                        <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/70 dark:from-amber-900/10 dark:to-amber-800/10 p-6 rounded-lg border border-amber-200/70 dark:border-amber-800/20 text-center">
                          <div className="mx-auto w-16 h-16 bg-amber-700 dark:bg-amber-500 rounded-full flex items-center justify-center mb-4">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1 text-foreground">3rd Place</h4>
                          <p className="text-amber-800 dark:text-amber-300 font-bold text-xl">
                            ${challenge.prizeDistribution?.third}
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Prizes */}
                      {challenge.prizeDistribution?.additional && challenge.prizeDistribution.additional.length > 0 && (
                        <div className="mt-8 mb-8">
                          <h4 className="text-lg font-semibold mb-4">Special Prizes</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {challenge.prizeDistribution.additional.map((prize, index) => (
                              <div key={index} className="flex justify-between items-center bg-card shadow-sm border border-border p-4 rounded-lg">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-3">
                                    <Award className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium text-foreground">{prize.name || 'Special Prize'}</span>
                                </div>
                                <span className="text-accent font-bold text-lg">${Number(prize.amount || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Non-monetary benefits */}
                      {challenge.prize && (
                        <div className="mt-8 bg-accent/5 p-6 rounded-lg border border-accent/20">
                          <h4 className="text-lg font-semibold mb-3 flex items-center text-foreground">
                            <BriefcaseBusiness className="h-5 w-5 mr-2 text-accent" />
                            Additional Opportunities
                          </h4>
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-accent mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-muted-foreground">{challenge.prize}</p>
                        </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-muted/20 rounded-lg p-6 border border-border">
                        <h4 className="text-lg font-semibold mb-4 text-foreground">Total Prize Pool</h4>
                        <p className="text-3xl font-bold text-accent">
                          ${challenge.total_prize.toLocaleString()}
                        </p>
                        
                        <div className="mt-6 pt-6 border-t border-border">
                          <h4 className="font-medium mb-3 text-foreground">How prizes are awarded</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Winners will be selected based on the evaluation criteria. 
                            Prizes will be distributed within 30 days of the winners announcement.
                          </p>
                        </div>
                      </div>
                      
                      {challenge.deadline && isValid(new Date(challenge.deadline)) && (
                        <div className="mt-6 bg-muted/20 rounded-lg p-6 border border-border">
                          <h4 className="text-lg font-semibold mb-3 text-foreground">Submission Deadline</h4>
                          <div className="flex items-center text-foreground">
                            <CalendarDays className="h-5 w-5 mr-2 text-accent" />
                            <p className="font-medium">
                              {format(new Date(challenge.deadline), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          {challenge.daysLeft > 0 ? (
                            <div className="mt-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {challenge.daysLeft} days left to submit
                            </div>
                          ) : (
                            <div className="mt-2 bg-muted text-muted-foreground text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Submission period ended
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="p-4 sm:p-6 pt-6 sm:pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">Resources</h3>
                      
                      {challenge.resources && challenge.resources.length > 0 ? (
                        <div className="space-y-4">
                          {challenge.resources.map((resource, index) => (
                            <div key={index} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                {resource.type === 'link' ? (
                                  <Link2 className="h-5 w-5 mr-3 text-accent" />
                                ) : resource.type === 'api' ? (
                                  <Copy className="h-5 w-5 mr-3 text-accent" />
                                ) : (
                                    <Download className="h-5 w-5 mr-3 text-accent" />
                                )}
                                <div>
                                  <h4 className="font-medium text-foreground">{resource.title}</h4>
                                  <p className="text-sm text-muted-foreground">{resource.type === 'link' ? 'External link' : resource.type === 'api' ? 'API key' : 'API key'}</p>
                                </div>
                              </div>
                              {resource.type === 'link' && (<Button variant="outline" size="sm" onClick={() => window.open(resource.link, '_blank')}>
                                {resource.type === 'link' ? 'Visit' : 'Download'}
                              </Button>)}
                                {resource.type === 'api' && (<Button variant="outline" size="sm" onClick={() => {
                                    navigator.clipboard.writeText(resource.link)
                                    toast.success('API Key copied to clipboard')
                                    }}>
                                    Copy API Key 
                                    </Button>)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500">No resources have been provided for this challenge.</div>
                      )}
                      
                      {challenge.faq && challenge.faq.length > 0 && (
                        <div className="mt-10">
                          <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
                          <div className="space-y-6">
                            {challenge.faq.map((item, index) => (
                              <div key={index} className="bg-card border border-border rounded-lg p-5">
                                <h4 className="font-semibold text-lg mb-2 text-foreground">{item.question}</h4>
                                <p className="text-muted-foreground">{item.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-muted/20 rounded-lg p-6 border border-border">
                        <h4 className="text-lg font-semibold mb-4 text-foreground">Need Help?</h4>
                        <p className="text-muted-foreground mb-6">
                          Have questions about this challenge or need technical assistance? 
                          Get in touch with the challenge organizers.
                        </p>
                        <Button variant="outline" className="w-full mb-3 border-border hover:bg-accent/5 text-foreground hover:text-accent"
                          onClick={() => challenge.organizerWebsite && window.open(challenge.organizerWebsite, '_blank')}
                          disabled={!challenge.organizerWebsite}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Organizer Website
                        </Button>
                        <Button variant="outline" className="w-full border-border hover:bg-accent/5 text-foreground hover:text-accent">
                          Contact Support
                        </Button>
                      </div>
                      
                      {relatedChallenges.length > 0 && (
                        <div className="mt-6 bg-muted/20 rounded-lg p-6 border border-border">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Similar Challenges</h4>
                          <div className="space-y-4">
                            {relatedChallenges.map(related => (
                              <div 
                                key={related.id} 
                                className="flex items-start space-x-3 cursor-pointer hover:bg-accent/5 p-2 rounded-lg transition-colors"
                                onClick={() => navigate(`/challenges/${related.id}`)}
                              >
                                <img 
                                  src={related.image} 
                                  alt={related.title}
                                  className="w-14 h-14 rounded-md object-cover"
                                />
                                <div>
                                  <h5 className="font-medium text-sm hover:text-accent transition-colors text-foreground">
                                    {related.title}
                                  </h5>
                                  <p className="text-xs text-muted-foreground">{related.organizer}</p>
                                  <p className="text-xs font-medium text-accent">{related.prize}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Team Join Modal */}
      {showTeamJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Join Challenge as Team
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Select a team to join this challenge together.
            </p>
            
            <div className="space-y-3 mb-6">
              {userTeams.map(team => (
                <div 
                  key={team.id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                  onClick={() => handleJoinAsTeam(team.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">{team.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {team.currentMembers}/{team.maxMembers} members
                      </p>
                    </div>
                    <Button size="sm" disabled={isJoining}>
                      {isJoining ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowTeamJoinModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for the challenge view
const ChallengeSkeleton = () => (
  <div className="pt-16"> {/* Add padding top to account for the fixed header */}
    {/* Header skeleton */}
    <div className="w-full h-48 sm:h-56 md:h-72 bg-slate-200 dark:bg-slate-800 animate-pulse relative mb-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 max-w-2xl mx-auto mb-4 bg-slate-300 dark:bg-slate-700" />
          <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 bg-slate-300 dark:bg-slate-700" />
          </div>
          <div className="flex justify-center gap-3 sm:gap-4">
            <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-28 bg-slate-300 dark:bg-slate-700" />
            <Skeleton className="h-3 sm:h-4 w-32 sm:w-40 bg-slate-300 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="container mx-auto px-4 mt-10">
      <div className="bg-card rounded-t-xl border border-border shadow-lg">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4" />
              <div>
                <Skeleton className="h-3 w-16 sm:w-20 mb-1" />
                <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
              <Skeleton className="h-9 w-full sm:w-24" />
              <Skeleton className="h-9 w-full sm:w-24" />
              <Skeleton className="h-9 w-full sm:w-32" />
            </div>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 border-b border-border">
          <div className="flex gap-2 sm:gap-6 py-3 sm:py-4 overflow-x-auto">
            <Skeleton className="h-6 sm:h-6 w-16 sm:w-20 flex-shrink-0" />
            <Skeleton className="h-6 sm:h-6 w-20 sm:w-32 flex-shrink-0" />
            <Skeleton className="h-6 sm:h-6 w-16 sm:w-24 flex-shrink-0" />
            <Skeleton className="h-6 sm:h-6 w-16 sm:w-20 flex-shrink-0" />
            <Skeleton className="h-6 sm:h-6 w-20 sm:w-28 flex-shrink-0" />
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              
              <div className="pt-4">
                <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                  <Skeleton className="h-6 sm:h-8 w-24 sm:w-28" />
                  <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
                </div>
              </div>
            </div>
            
            <div>
              <Skeleton className="h-48 sm:h-64 w-full rounded-lg mb-6" />
              <Skeleton className="h-8 sm:h-10 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bottom Action Bar Skeleton */}
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-center z-10">
      <div className="container flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  </div>
);