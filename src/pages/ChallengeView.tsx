import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Calendar, Users, Timer, Award, Clock, Link2, Download, Globe, Copy,
 BarChart2, Share2, BriefcaseBusiness, CalendarDays, Tag
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

export default function ChallengeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedChallenges, setRelatedChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isJoining, setIsJoining] = useState(false);
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
    const userDoc = await getDoc(doc(db, 'profiles', user.uid));
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
      navigate('/dashboard');
      return;
    }
    
    // Add user's challenge to their profile first (this should have proper permissions)
    const userChallengeRef = doc(db, 'profiles', user.uid, 'challenges', challengeId);
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

    const publicProfileRef = doc(db, 'public_profiles', user.uid);
        await updateDoc(publicProfileRef, {
            total_active_challenges: increment(1)
        });
    
    toast.success('Challenge added to your dashboard successfully!');
    navigate('/dashboard');
  } catch (error) {
    console.error("Error joining challenge:", error);
    toast.error('Error joining challenge: ' + error.message);
  } finally {
    setIsJoining(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <ChallengeSkeleton />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Challenge not found</h2>
          <p className="mt-2 text-gray-600">The challenge you're looking for doesn't exist or has been removed.</p>
          <Button 
            className="mt-6"
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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 min-h-screen pb-20"
        >
          {/* Challenge Header */}
          <div 
            className="w-full bg-cover bg-center h-40 md:h-72 relative"
            style={{ 
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${challenge.image})` 
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="container mx-auto px-4 text-center text-white">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-4xl mx-auto">
                  {challenge.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  {challenge.categories.map(category => (
                    <Badge key={category} className="bg-white/20 text-white hover:bg-white/30">
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm">
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-2" />
                    {challenge.daysLeft > 0 ? `${challenge.daysLeft} days left` : 'Challenge ended'}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {challenge.participants} participants
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-4 h-4 mr-2" />
                    {challenge.total_prize > 0 
                      ? `$${challenge.total_prize.toLocaleString()} in prizes` 
                      : challenge.prize}
                  </div>
                  {challenge.deadline && isValid(new Date(challenge.deadline)) && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Deadline: {format(new Date(challenge.deadline), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="top-4 left-4 text-white hover:bg-white/20"
              onClick={() => navigate('/challenges')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Challenges
            </Button>
          </div>
          
          {/* Main Content */}
          <div className="container mx-auto px-4 mt-10">
            <div className="bg-white rounded-t-xl shadow-lg">
              {/* Organizer and Action Row */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 mr-4 overflow-hidden">
                    {challenge.organizerLogo ? (
                      <img 
                        src={challenge.organizerLogo} 
                        alt={challenge.organizer}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                        {challenge.organizer.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Organized by</p>
                    <h2 className="font-semibold">{challenge.organizer}</h2>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => {handleAddChallenge(challenge.id)}}
                    disabled={isJoining || challenge.daysLeft <= 0}
                  >
                    {isJoining ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                        Joining...
                      </>
                    ) : challenge.daysLeft > 0 ? (
                      'Join Challenge'
                    ) : null}
                  </Button>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 border-b border-gray-200">
                  <TabsList className="h-14 justify-start bg-transparent border-b-0 p-0 gap-6">
                    <TabsTrigger 
                      value="overview"
                      className="h-14 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="details"
                      className="h-14 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                      Details & Criteria
                    </TabsTrigger>
                    <TabsTrigger 
                      value="timeline"
                      className="h-14 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger 
                      value="prizes"
                      className="h-14 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                      Prizes
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resources"
                      className="h-14 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=active]:shadow-none"
                    >
                      Resources
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Tab Contents */}
                <TabsContent value="overview" className="p-6 pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Challenge Overview</h3>
                        <div className="prose max-w-none">
                          {challenge.description.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      
                      {challenge.skills.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Skills Needed</h3>
                          <div className="flex flex-wrap gap-2">
                            {challenge.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="px-3 py-1">
                                <Tag className="w-3.5 h-3.5 mr-1.5" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">Challenge Details</h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Submission Deadline</p>
                            <p className="font-medium flex items-center">
                              <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                              {challenge.deadline && isValid(new Date(challenge.deadline))
                                ? format(new Date(challenge.deadline), 'MMMM d, yyyy') 
                                : 'Not specified'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Prize</p>
                            <p className="font-medium flex items-center">
                              <Trophy className="w-4 h-4 mr-2 text-primary" />
                              {challenge.total_prize > 0 
                                ? `$${challenge.total_prize.toLocaleString()}` 
                                : challenge.prize}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Participation</p>
                            <p className="font-medium flex items-center">
                              <Users className="w-4 h-4 mr-2 text-primary" />
                              {challenge.allowTeams 
                                ? `Teams of up to ${challenge.maxTeamSize} allowed` 
                                : 'Individual participation only'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-primary" />
                              {challenge.daysLeft > 0 
                                ? `${challenge.daysLeft} days remaining` 
                                : 'Challenge ended'}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500">Categories</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {challenge.categories.map(category => (
                                <Badge key={category} variant="secondary">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="p-6 pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>{judge.name ? judge.name.charAt(0) : '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{judge.name || 'Unknown Judge'}</h4>
                                  <p className="text-sm text-gray-500">{judge.title || ''}</p>
                                  {judge.organization && (
                                    <p className="text-xs text-gray-500 mt-1">{judge.organization}</p>
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
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold mb-4">Terms & Conditions</h4>
                          <div className="text-sm text-gray-600 prose max-w-none">
                            <p>{challenge.termsAndConditions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline" className="p-6 pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">Important Dates</h4>
                      <div className="space-y-4">                        
                        <div>
                          <p className="text-sm text-gray-500">Submission Deadline</p>
                          <p className="font-medium">
                            {challenge.deadline && isValid(new Date(challenge.deadline))
                              ? format(new Date(challenge.deadline), 'MMMM d, yyyy') 
                              : 'Not specified'}
                          </p>
                        </div>
                        
                        {challenge.timeline && challenge.timeline.map((phase, index) => (
                          <div key={index}>
                            <p className="text-sm text-gray-500">{phase.phase}</p>
                            {phase.startDate && phase.endDate && 
                             isValid(new Date(phase.startDate)) && isValid(new Date(phase.endDate)) ? (
                              <p className="font-medium">
                                {format(new Date(phase.startDate), 'MMM d')} - {format(new Date(phase.endDate), 'MMM d, yyyy')}
                              </p>
                            ) : (
                              <p className="font-medium">Date TBD</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="prizes" className="p-6 pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">Prizes</h3>
                      
                      {/* Visual Prize Distribution */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {/* 1st Place */}
                        <div className="bg-gradient-to-b from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200 text-center">
                          <div className="mx-auto w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mb-4">
                            <Trophy className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">1st Place</h4>
                          <p className="text-amber-800 font-bold text-xl">
                            ${challenge.prizeDistribution?.first}
                          </p>
                        </div>
                        
                        {/* 2nd Place */}
                        <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 text-center">
                          <div className="mx-auto w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mb-4">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">2nd Place</h4>
                          <p className="text-gray-800 font-bold text-xl">
                            ${challenge.prizeDistribution?.second}
                          </p>
                        </div>
                        
                        {/* 3rd Place */}
                        <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/70 p-6 rounded-lg border border-amber-200/70 text-center">
                          <div className="mx-auto w-16 h-16 bg-amber-700 rounded-full flex items-center justify-center mb-4">
                            <Award className="h-8 w-8 text-white" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">3rd Place</h4>
                          <p className="text-amber-800 font-bold text-xl">
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
                              <div key={index} className="flex justify-between items-center bg-white shadow-sm border border-gray-100 p-4 rounded-lg">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                    <Award className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium">{prize.name || 'Special Prize'}</span>
                                </div>
                                <span className="text-primary font-bold text-lg">${Number(prize.amount || 0).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Non-monetary benefits */}
                      {challenge.prize && (
                        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold mb-3 flex items-center">
                            <BriefcaseBusiness className="h-5 w-5 mr-2 text-blue-500" />
                            Additional Opportunities
                          </h4>
                        <div className="flex items-center">
                            <svg className="h-4 w-4 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-gray-700">{challenge.prize}</p>
                        </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">Total Prize Pool</h4>
                        <p className="text-3xl font-bold text-primary">
                          ${challenge.total_prize.toLocaleString()}
                        </p>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-medium mb-3">How prizes are awarded</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Winners will be selected based on the evaluation criteria. 
                            Prizes will be distributed within 30 days of the winners announcement.
                          </p>
                        </div>
                      </div>
                      
                      {challenge.deadline && isValid(new Date(challenge.deadline)) && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold mb-3">Submission Deadline</h4>
                          <div className="flex items-center text-gray-700">
                            <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                            <p className="font-medium">
                              {format(new Date(challenge.deadline), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          {challenge.daysLeft > 0 ? (
                            <div className="mt-2 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {challenge.daysLeft} days left to submit
                            </div>
                          ) : (
                            <div className="mt-2 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full inline-flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              Submission period ended
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="p-6 pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-semibold mb-6">Resources</h3>
                      
                      {challenge.resources && challenge.resources.length > 0 ? (
                        <div className="space-y-4">
                          {challenge.resources.map((resource, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                {resource.type === 'link' ? (
                                  <Link2 className="h-5 w-5 mr-3 text-blue-500" />
                                ) : resource.type === 'api' ? (
                                  <Copy className="h-5 w-5 mr-3 text-green-500" />
                                ) : (
                                    <Download className="h-5 w-5 mr-3 text-green-500" />
                                )}
                                <div>
                                  <h4 className="font-medium">{resource.title}</h4>
                                  <p className="text-sm text-gray-500">{resource.type === 'link' ? 'External link' : resource.type === 'api' ? 'API key' : 'API key'}</p>
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
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                                <h4 className="font-semibold text-lg mb-2">{item.question}</h4>
                                <p className="text-gray-600">{item.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-lg font-semibold mb-4">Need Help?</h4>
                        <p className="text-gray-600 mb-6">
                          Have questions about this challenge or need technical assistance? 
                          Get in touch with the challenge organizers.
                        </p>
                        <Button variant="outline" className="w-full mb-3"
                          onClick={() => challenge.organizerWebsite && window.open(challenge.organizerWebsite, '_blank')}
                          disabled={!challenge.organizerWebsite}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Organizer Website
                        </Button>
                        <Button variant="outline" className="w-full">
                          Contact Support
                        </Button>
                      </div>
                      
                      {relatedChallenges.length > 0 && (
                        <div className="mt-6 bg-gray-50 rounded-lg p-6">
                          <h4 className="text-lg font-semibold mb-4">Similar Challenges</h4>
                          <div className="space-y-4">
                            {relatedChallenges.map(related => (
                              <div 
                                key={related.id} 
                                className="flex items-start space-x-3 cursor-pointer"
                                onClick={() => navigate(`/challenges/${related.id}`)}
                              >
                                <img 
                                  src={related.image} 
                                  alt={related.title}
                                  className="w-14 h-14 rounded-md object-cover"
                                />
                                <div>
                                  <h5 className="font-medium text-sm hover:text-primary">
                                    {related.title}
                                  </h5>
                                  <p className="text-xs text-gray-500">{related.organizer}</p>
                                  <p className="text-xs font-medium text-primary">{related.prize}</p>
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
    </div>
  );
}

// Skeleton loader for the challenge view
const ChallengeSkeleton = () => (
  <div className="pt-16"> {/* Add padding top to account for the fixed header */}
    {/* Header skeleton */}
    <div className="w-full h-40 md:h-72 bg-gray-300 animate-pulse relative mb-10">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-12 w-3/4 max-w-2xl mx-auto mb-4" />
          <div className="flex justify-center gap-2 mb-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="container mx-auto px-4 mt-10">
      <div className="bg-white rounded-t-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between">
            <div className="flex items-center">
              <Skeleton className="w-12 h-12 rounded-full mr-4" />
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
        
        <div className="px-6 border-b border-gray-200">
          <div className="flex gap-6 py-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              
              <div className="pt-4">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
            
            <div>
              <Skeleton className="h-64 w-full rounded-lg mb-6" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bottom Action Bar Skeleton */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-10">
      <div className="container flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  </div>
);