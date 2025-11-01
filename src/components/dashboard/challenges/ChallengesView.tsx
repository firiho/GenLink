import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Download, FileText, Info, MessageSquare, Trophy, Upload, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChallengesViewProps {
  challengeId: string;
  onBack?: () => void;
  setActiveView: (view: string) => void;
}

export default function ChallengesView({ challengeId, onBack, setActiveView }: ChallengesViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(0);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [hasPublicProfile, setHasPublicProfile] = useState(true);

  useEffect(() => {
    const fetchChallengeAndSubmission = async () => {
      if (!challengeId || !user) {
        if (onBack) {
          onBack();
        } else {
          // Navigate to appropriate dashboard based on user role
          if (user?.role === 'partner') {
            navigate('/partner/dashboard');
          } else if (user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/dashboard');
          }
        }
        return;
      }

      try {
        setLoading(true);
        
        // Check if the user has a public profile
        const publicProfileRef = doc(db, 'profiles', user.uid);
        const publicProfileSnap = await getDoc(publicProfileRef);
        setHasPublicProfile(publicProfileSnap.exists());
        
        // Fetch challenge data
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeSnap = await getDoc(challengeRef);
        
        if (!challengeSnap.exists()) {
          toast.error('Challenge not found');
          if (onBack) {
            onBack();
          } else {
            navigate('/dashboard');
          }
          return;
        }
        
        const challengeData = challengeSnap.data();
        
        // Fetch user's submission for this challenge
        const submissionId = `${user.uid}_${challengeId}`;
        const submissionRef = doc(db, 'submissions', submissionId);
        const submissionSnap = await getDoc(submissionRef);
        
        if (!submissionSnap.exists()) {
          toast.error('You have not joined this challenge');
          if (onBack) {
            onBack();
          } else {
            navigate('/dashboard');
          }
          return;
        }
        
        const submissionData = submissionSnap.data();

        // Format challenge data
        const formattedChallenge = {
          id: challengeSnap.id,
          title: challengeData.title || 'Unnamed Challenge',
          description: challengeData.description || '',
          organization: challengeData.companyInfo?.name || 'Unknown Organization',
          organizationLogo: challengeData.companyInfo?.logoUrl || null,
          participants: challengeData.participants || 0,
          prize: challengeData.total_prize ? `$${challengeData.total_prize.toLocaleString()}` : 'No prize',
          deadline: challengeData.deadline ? new Date(challengeData.deadline) : null,
          instructions: challengeData.evaluationCriteria || 'No specific instructions provided.',
          requirements: challengeData.requirements || 'No specific requirements provided.',
          coverImage: challengeData.coverImageUrl || '/placeholder-challenge.jpg',
          resources: challengeData.resources || [],
          rules: challengeData.termsAndConditions || 'No specific rules provided.'
        };
        
        // Set state with fetched data
        setChallenge(formattedChallenge);
        setSubmission(submissionData);
        setProgress(submissionData.progress || 0);
        setSubmissionUrl(submissionData.submissionUrl || '');
        setSubmissionNote(submissionData.note || '');
        
      } catch (error) {
        console.error('Error fetching challenge:', error);
        toast.error('Error loading challenge data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallengeAndSubmission();
  }, [challengeId, user, navigate, onBack]);

  const handleSubmission = async () => {
    if (!challengeId || !user) return;
    
    if (!submissionUrl.trim()) {
      toast.error('Please provide a submission URL');
      return;
    }
    
    // Check if the user has a public profile before submitting
    if (!hasPublicProfile) {
      toast.error('You need to create a public profile before submitting');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submissionId = `${user.uid}_${challengeId}`;
      const submissionRef = doc(db, 'submissions', submissionId);
      
      await updateDoc(submissionRef, {
        submissionUrl: submissionUrl,
        note: submissionNote,
        status: 'submitted',
        progress: 100,
        updatedAt: new Date()
      });
      
      // Also update the challenge status in the user's profile
      const userChallengeRef = doc(db, 'users', user.uid, 'challenges', challengeId);
      await updateDoc(userChallengeRef, {
        status: 'submitted',
        submittedAt: new Date()
      });

      // Try updating the participant count as the last step
    try {
        const challengeRef = doc(db, 'challenges', challengeId);
        await updateDoc(challengeRef, {
          participants: increment(1)
        });
      } catch (countError) {
        console.error("Error updating participant count:", countError);
      }

        // Update the public profile participants count
    const publicProfileRef = doc(db, 'profiles', user.uid);
    await setDoc(publicProfileRef, {
        total_submissions: increment(1),
        total_active_challenges: increment(-1),
        projectsCount: increment(1),
        submissions: arrayUnion(submissionId)
    }, { merge: true });

      toast.success('Submission successful!');
      setSubmission({
        ...submission,
        status: 'submitted',
        progress: 100,
        submissionUrl: submissionUrl,
        note: submissionNote
      });
    } catch (error) {
      console.error('Error submitting challenge:', error);
      toast.error('Error submitting challenge');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysLeft = () => {
    if (!challenge?.deadline) return 'No deadline';
    
    const today = new Date();
    const deadline = new Date(challenge.deadline);
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'Expired';
    if (daysDiff === 0) return 'Due today';
    return `${daysDiff} days left`;
  };

  if (loading) {
    return <ChallengeSkeleton />;
  }

  if (!challenge || !submission) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Info className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-4" />
        <h2 className="text-lg font-medium mb-2 text-slate-900 dark:text-white">Challenge not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The challenge you're looking for doesn't exist or you haven't joined it.</p>
        <Button 
          onClick={() => onBack ? onBack() : (user?.role === 'partner' ? navigate('/partner/dashboard') : user?.role === 'admin' ? navigate('/admin/dashboard') : navigate('/dashboard'))}
          className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
        >
          Back to challenges
        </Button>
      </div>
    );
  }

  const isSubmitted = submission.status === 'submitted';
  const isExpired = challenge.deadline && new Date(challenge.deadline) < new Date();

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Back button and header */}
      <div className="flex flex-col space-y-6">
        <Button 
          variant="ghost" 
          className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white self-start -ml-3" 
          onClick={() => onBack ? onBack() : (user?.role === 'partner' ? navigate('/partner/dashboard') : user?.role === 'admin' ? navigate('/admin/dashboard') : navigate('/dashboard'))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{challenge.title}</h1>
            <div className="flex items-center mt-2">
              {challenge.organizationLogo && (<img 
                src={challenge.organizationLogo} 
                alt={challenge.organization} 
                className="h-6 w-6 rounded-full mr-2"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.onerror = null;
                  imgElement.src = "/placeholder-logo.jpg";
                }}
              />)}
              <span className="text-sm text-slate-500 dark:text-slate-400">{challenge.organization}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(challenge.deadline)}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Clock className="h-3.5 w-3.5" />
              <span>{getDaysLeft()}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Trophy className="h-3.5 w-3.5" />
              <span>{challenge.prize}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
              <Users className="h-3.5 w-3.5" />
              <span>{challenge.participants} Participants</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Challenge content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="instructions"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Instructions
              </TabsTrigger>
              <TabsTrigger 
                value="resources"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Resources
              </TabsTrigger>
              <TabsTrigger 
                value="rules"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Rules
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="aspect-video w-full mb-8 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={challenge.coverImage} 
                  alt={challenge.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.onerror = null;
                    imgElement.src = "/placeholder-challenge.jpg";
                  }}
                />
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Challenge Description</h2>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="text-lg">{challenge.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Instructions</h2>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="text-lg">{challenge.instructions}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Requirements</h2>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="text-lg">{challenge.requirements}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resources</h2>
                </div>
                
                {challenge.resources && challenge.resources.length > 0 ? (
                  <div className="grid gap-4">
                    {challenge.resources.map((resource, index) => (
                      <Card key={index} className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-xl flex items-center justify-center">
                              <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">{resource.title}</h3>
                              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{resource.description}</p>
                              <div className="flex gap-3">
                                {resource.type === 'link' ? (
                                  <a 
                                    href={resource.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors duration-200"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resource
                                  </a>
                                ) : resource.type === 'api' ? (
                                  <Button 
                                    variant="outline" 
                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-600"
                                    onClick={() => {
                                      navigator.clipboard.writeText(resource.link);
                                      toast.success('API URL copied to clipboard!');
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Copy API URL
                                  </Button>
                                ) : (
                                  <a
                                    href={resource.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors duration-200"
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Resource
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                      <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">No resources available for this challenge.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rules" className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Challenge Rules</h2>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 border border-slate-200 dark:border-slate-600">
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p className="text-lg">{challenge.rules}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 space-y-6">
              {!hasPublicProfile && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Public Profile Required</AlertTitle>
                  <AlertDescription>
                    You need to create a public profile before submitting a challenge. This helps organizers know who you are.
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveView('profile')}
                      >
                        Create Profile
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {!isSubmitted ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Submit Your Work</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="submissionUrl" className="text-slate-700 dark:text-slate-300">Submission URL</Label>
                        <Input 
                          id="submissionUrl" 
                          type="url" 
                          placeholder="https://github.com/yourusername/project" 
                          value={submissionUrl} 
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                          disabled={isSubmitted || submitting || !hasPublicProfile}
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Link to your GitHub repository, demo, or other submission
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="note" className="text-slate-700 dark:text-slate-300">Submission Note</Label>
                        <Textarea 
                          id="note" 
                          placeholder="Describe your approach and any special instructions..." 
                          value={submissionNote} 
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          className="mt-1 resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                          disabled={isSubmitted || submitting || !hasPublicProfile}
                          rows={4}
                        />
                      </div>
                      
                      <Button 
                        className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" 
                        onClick={hasPublicProfile ? handleSubmission : () => setActiveView('profile')}
                        disabled={isSubmitted || submitting || !submissionUrl.trim() || isExpired || !hasPublicProfile}
                      >
                        {!hasPublicProfile ? (
                          <>Create Profile First</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Submit Challenge
                          </>
                        )}
                      </Button>
                      
                      {isExpired && !isSubmitted && (
                        <p className="text-xs text-red-500 dark:text-red-400 text-center">
                          This challenge has expired and can no longer be submitted.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-green-800 dark:text-green-300 font-medium mb-2 flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Submission Complete
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You have successfully submitted your work for this challenge. 
                      The organizers will review your submission and provide feedback soon.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Your Submission</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Submission URL</h4>
                        <a 
                          href={submission.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline"
                        >
                          {submission.submissionUrl}
                        </a>
                      </div>
                      
                      {submission.note && (
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Submission Note</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{submission.note}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Submitted On</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(submission.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {submission.feedback && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Feedback</h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{submission.feedback}</p>
                            {submission.score && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Score: </span>
                                <span className="text-sm text-blue-800 dark:text-blue-300">{submission.score}/100</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for the challenge view
const ChallengeSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-8 animate-pulse">
    <div className="flex flex-col space-y-6">
      <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="aspect-video w-full mb-6 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm space-y-6 border border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-9 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);