import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Upload, Play, FileText, ExternalLink, Lock, Globe, Users, Clock, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, updateDoc, increment, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { TeamService } from '@/services/teamService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ProjectViewProps {
  projectId: string;
  onBack: () => void;
  setActiveView: (view: string, data?: any) => void;
}

export default function ProjectView({ projectId, onBack, setActiveView }: ProjectViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !user) {
        onBack();
        return;
      }

      try {
        setLoading(true);
        
        // Fetch project
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        
        if (!projectSnap.exists()) {
          toast.error('Project not found');
          onBack();
          return;
        }

        const projectData = projectSnap.data();
        
        // Fetch challenge data
        let challengeData = null;
        if (projectData.challengeId) {
          const challengeRef = doc(db, 'challenges', projectData.challengeId);
          const challengeSnap = await getDoc(challengeRef);
          if (challengeSnap.exists()) {
            challengeData = challengeSnap.data();
          }
        }

        setProject({
          id: projectSnap.id,
          ...projectData,
          createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : new Date(projectData.createdAt),
          updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : new Date(projectData.updatedAt),
        });
        setChallenge(challengeData);
        
        // Check if user is a team member and admin (for team projects)
        if (projectData.teamId && user) {
          try {
            const memberInfo = await TeamService.getTeamMember(projectData.teamId, user.uid);
            setIsTeamMember(memberInfo?.status === 'active');
            
            // Fetch team data for display and check if user is admin
            const teamInfo = await TeamService.getTeam(projectData.teamId);
            setTeamData(teamInfo);
            
            // Check if user is in admins array
            setIsTeamAdmin(teamInfo?.admins?.includes(user.uid) || false);
          } catch (error) {
            setIsTeamMember(false);
            setIsTeamAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Error loading project');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user, onBack]);

  const handleSubmit = async () => {
    if (!project || !user) return;

    // Only owner or team admin can submit (team members cannot submit)
    if (project.userId !== user.uid && !isTeamAdmin) {
      toast.error('Only project owners and team admins can submit projects');
      return;
    }

    try {
      setSubmitting(true);

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date()
      });

      // Create submission document linking project, user/team, and challenge
      const submissionData: any = {
        projectId: projectId,
        challengeId: project.challengeId,
        userId: project.userId,
        teamId: project.teamId || null,
        status: 'submitted',
        progress: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use project ID as submission ID for uniqueness
      const submissionId = project.teamId 
        ? `team_${project.teamId}_${project.challengeId}`
        : `${user.uid}_${project.challengeId}`;
      
      const submissionRef = doc(db, 'submissions', submissionId);
      await setDoc(submissionRef, submissionData, { merge: true });

      // Update challenge status in user's profile
      if (project.challengeId) {
        const userChallengeRef = doc(db, 'users', user.uid, 'challenges', project.challengeId);
        await updateDoc(userChallengeRef, {
          status: 'submitted',
          submittedAt: new Date()
        });
      }

      // Update public profile
      const publicProfileRef = doc(db, 'profiles', user.uid);
      await setDoc(publicProfileRef, {
        total_submissions: increment(1),
        total_active_challenges: increment(-1),
        projectsCount: increment(1),
        submissions: arrayUnion(submissionId)
      }, { merge: true });

      // Update challenge participants count
      if (project.challengeId) {
        try {
          const challengeRef = doc(db, 'challenges', project.challengeId);
          await updateDoc(challengeRef, {
            participants: increment(1)
          });
        } catch (error) {
          console.error('Error updating participant count:', error);
        }
      }

      toast.success('Project submitted successfully!');
      setProject({
        ...project,
        status: 'submitted',
        submittedAt: new Date()
      });
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Error submitting project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-7xl">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Project not found</p>
        <Button onClick={onBack} variant="outline">Back to Projects</Button>
      </div>
    );
  }

  const isOwner = project.userId === user?.uid;
  const isSubmitted = project.status === 'submitted';

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-3" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        
                {/* Owner and team members (including admins) can edit */}
                {(isOwner || isTeamMember) && !isSubmitted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView('edit-project', project.id)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Project
                  </Button>
                )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-3 break-words">
                    {project.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge 
                      variant="outline" 
                      className={
                        project.status === 'submitted' 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                          : project.status === 'in-progress'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }
                    >
                      {project.status === 'submitted' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submitted
                        </>
                      ) : project.status === 'in-progress' ? (
                        'In Progress'
                      ) : (
                        'Draft'
                      )}
                    </Badge>
                    {project.teamId && (
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                        <Users className="h-3 w-3 mr-1" />
                        Team Project
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={
                        project.visibility === 'private' 
                          ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' 
                          : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }
                    >
                      {project.visibility === 'private' ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Content Tabs */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <Tabs defaultValue="readme" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="readme" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Readme
                  </TabsTrigger>
                  {project.youtubeVideoId && (
                    <TabsTrigger value="demo" className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Demo Video
                    </TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="readme" className="mt-0">
                  {project.readme ? (
                    <div className="prose prose-slate dark:prose-invert max-w-none
                      prose-headings:font-bold prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-4
                      prose-h1:text-3xl prose-h1:font-bold prose-h1:mt-8 prose-h1:mb-4 prose-h1:text-slate-900 dark:prose-h1:text-slate-100
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h2:text-slate-900 dark:prose-h2:text-slate-100
                      prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2 prose-h3:text-slate-900 dark:prose-h3:text-slate-100
                      prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2 prose-h4:text-slate-900 dark:prose-h4:text-slate-100
                      prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:my-4
                      prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                      prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold
                      prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']
                      prose-pre:bg-slate-900 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-4
                      prose-ul:list-disc prose-ol:list-decimal prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:my-2 prose-li:ml-4
                      prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
                      prose-img:rounded-lg prose-img:shadow-lg prose-img:my-4
                      prose-table:border-collapse prose-table:w-full prose-table:my-4
                      prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-600 prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:text-left prose-th:font-semibold
                      prose-td:border prose-td:border-slate-300 dark:prose-td:border-slate-600 prose-td:p-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.readme}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                      <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No readme content yet.</p>
                      {(isOwner || isTeamMember) && !isSubmitted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setActiveView('edit-project', project.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Add Readme
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                {project.youtubeVideoId && (
                  <TabsContent value="demo" className="mt-0">
                    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-slate-900">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${project.youtubeVideoId}`}
                        title="Project Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {challenge && (
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Challenge
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">
                    {challenge.title || 'Unknown Challenge'}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-normal"
                    onClick={() => setActiveView('challenge', project.challengeId)}
                  >
                    View Challenge <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Button>
                </div>
              )}

              {teamData && (
                <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Team
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">
                    {teamData.name}
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600 dark:text-blue-400 font-normal"
                    onClick={() => setActiveView('team-manage', project.teamId)}
                  >
                    View Team <ExternalLink className="h-3 w-3 ml-1 inline" />
                  </Button>
                </div>
              )}

              <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {project.createdAt?.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) || 'Unknown'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {project.updatedAt?.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) || 'Unknown'}
                  </p>
                </div>

                {project.submittedAt && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                      Submitted
                    </p>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {new Date(project.submittedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Only owner or team admin can submit - team members can see/edit but not submit */}
              {(isOwner || isTeamAdmin) && !isSubmitted && (
                <Button
                  className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                  onClick={handleSubmit}
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-slate-100 dark:border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Project
                    </>
                  )}
                </Button>
              )}
              
              {/* Show message for team members who can't submit */}
              {isTeamMember && !isTeamAdmin && !isOwner && !isSubmitted && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <Info className="h-4 w-4" />
                    <p className="text-sm font-medium">Only team admins can submit projects</p>
                  </div>
                </div>
              )}

              {isSubmitted && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-medium">Project has been submitted</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}