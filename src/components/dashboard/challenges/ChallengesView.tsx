import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
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
          navigate('/dashboard');
        }
        return;
      }

      try {
        setLoading(true);
        
        // Check if the user has a public profile
        const publicProfileRef = doc(db, 'public_profiles', user.uid);
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
      const userChallengeRef = doc(db, 'profiles', user.uid, 'challenges', challengeId);
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
    const publicProfileRef = doc(db, 'public_profiles', user.uid);
    await updateDoc(publicProfileRef, {
        total_submissions: increment(1),
        total_active_challenges: increment(-1),
        projectsCount: increment(1),
        submissions: arrayUnion(submissionId)
    });

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
        <Info className="h-10 w-10 text-gray-400 mb-4" />
        <h2 className="text-lg font-medium mb-2">Challenge not found</h2>
        <p className="text-gray-500 mb-6">The challenge you're looking for doesn't exist or you haven't joined it.</p>
        <Button onClick={() => onBack ? onBack() : navigate('/dashboard')}>
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
          className="flex items-center text-gray-500 hover:text-gray-900 self-start -ml-3" 
          onClick={() => onBack ? onBack() : navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
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
              <span className="text-sm text-gray-500">{challenge.organization}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(challenge.deadline)}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{getDaysLeft()}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              <span>{challenge.prize}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
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
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="bg-white rounded-lg p-6 shadow-sm">
              <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
                <img 
                  src={challenge.coverImage} 
                  alt={challenge.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.onerror = null;
                    imgElement.src = "/placeholder-challenge.jpg";
                  }}
                />
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Challenge Description</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{challenge.description}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{challenge.instructions}</p>
              </div>
              
              <h2 className="text-xl font-semibold mt-8 mb-4">Requirements</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{challenge.requirements}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="resources" className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Resources</h2>
              {challenge.resources && challenge.resources.length > 0 ? (
                <div className="space-y-4">
                  {challenge.resources.map(resource => (
                    <Card>
                      <CardContent className="p-4 flex items-start">
                        <div className="mr-4 mt-1">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{resource.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
                          {resource.type === 'link' ? (<a 
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-flex items-center"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download Resource
                          </a>) : resource.type === 'api' ? (
                            <Button 
                              variant="outline" 
                              className="mt-2 text-sm"
                              onClick={() => {
                                navigator.clipboard.writeText(resource.link);
                                toast.success('API URL copied to clipboard!');
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Copy API URL
                            </Button>
                          ) : (
                            <a
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-2 inline-flex items-center"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download Resource
                          </a>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No resources available for this challenge.</p>
              )}
            </TabsContent>
            
            <TabsContent value="rules" className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Challenge Rules</h2>
              <div className="prose max-w-none text-gray-700">
                <p>{challenge.rules}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="shadow-sm">
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
                    <h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="submissionUrl">Submission URL</Label>
                        <Input 
                          id="submissionUrl" 
                          type="url" 
                          placeholder="https://github.com/yourusername/project" 
                          value={submissionUrl} 
                          onChange={(e) => setSubmissionUrl(e.target.value)}
                          className="mt-1"
                          disabled={isSubmitted || submitting || !hasPublicProfile}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Link to your GitHub repository, demo, or other submission
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="note">Submission Note</Label>
                        <Textarea 
                          id="note" 
                          placeholder="Describe your approach and any special instructions..." 
                          value={submissionNote} 
                          onChange={(e) => setSubmissionNote(e.target.value)}
                          className="mt-1 resize-none"
                          disabled={isSubmitted || submitting || !hasPublicProfile}
                          rows={4}
                        />
                      </div>
                      
                      <Button 
                        className="w-full" 
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
                        <p className="text-xs text-red-500 text-center">
                          This challenge has expired and can no longer be submitted.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-green-800 font-medium mb-2 flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      Submission Complete
                    </h3>
                    <p className="text-sm text-green-700">
                      You have successfully submitted your work for this challenge. 
                      The organizers will review your submission and provide feedback soon.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Your Submission</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Submission URL</h4>
                        <a 
                          href={submission.submissionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {submission.submissionUrl}
                        </a>
                      </div>
                      
                      {submission.note && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Submission Note</h4>
                          <p className="text-sm text-gray-600">{submission.note}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Submitted On</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(submission.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {submission.feedback && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Feedback</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm text-blue-800">{submission.feedback}</p>
                            {submission.score && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-blue-800">Score: </span>
                                <span className="text-sm text-blue-800">{submission.score}/100</span>
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
      <div className="h-8 w-32 bg-gray-200 rounded"></div>
      <div className="space-y-2">
        <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="h-10 w-full bg-gray-200 rounded mb-6"></div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="aspect-video w-full mb-6 bg-gray-200 rounded-lg"></div>
          <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-2 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="h-1 w-full bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);