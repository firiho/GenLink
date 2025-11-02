import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Calendar, Users, Play, FileText, ExternalLink, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { TeamService } from '@/services/teamService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

const ProjectShowcase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [challenge, setChallenge] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [teamMembersWithProfiles, setTeamMembersWithProfiles] = useState<Array<{
    id: string;
    userId: string;
    name: string;
    username?: string;
    photo?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        navigate('/projects');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch project
        const projectRef = doc(db, 'projects', id);
        const projectSnap = await getDoc(projectRef);
        
        if (!projectSnap.exists()) {
          toast.error('Project not found');
          navigate('/projects');
          return;
        }

        const projectData = projectSnap.data();
        
        // Only show public submitted projects
        if (projectData.visibility !== 'public' || projectData.status !== 'submitted') {
          toast.error('Project is not available for public viewing');
          navigate('/projects');
          return;
        }
        
        // Fetch challenge data
        let challengeData = null;
        if (projectData.challengeId) {
          const challengeRef = doc(db, 'challenges', projectData.challengeId);
          const challengeSnap = await getDoc(challengeRef);
          if (challengeSnap.exists()) {
            challengeData = challengeSnap.data();
          }
        }

        // Fetch creator data
        let creatorData = null;
        if (projectData.teamId) {
          // Team project - fetch team data directly (without TeamService for public access)
          // Note: Team must have visibility='public' to be readable by unauthenticated users
          try {
            const teamRef = doc(db, 'teams', projectData.teamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
              const teamData = teamSnap.data();
              console.log('Team data fetched:', { 
                id: teamSnap.id, 
                visibility: teamData.visibility, 
                name: teamData.name 
              });
              setTeam({ id: teamSnap.id, ...teamData } as any);
              creatorData = {
                name: teamData.name || 'Team Project',
                type: 'team',
                description: teamData.description,
              };
              
              // Fetch team members if team is public
              if (teamData.visibility === 'public') {
                try {
                  const membersQuery = query(collection(db, 'teams', projectData.teamId, 'members'));
                  const membersSnap = await getDocs(membersQuery);
                  const members = membersSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                  }));
                  setTeamMembers(members);
                  
                  // Fetch profile data for each member
                  const membersWithProfiles = await Promise.all(
                    members.map(async (member: any) => {
                      const userId = member.userId || member.id;
                      try {
                        const profileRef = doc(db, 'profiles', userId);
                        const profileSnap = await getDoc(profileRef);
                        if (profileSnap.exists()) {
                          const profileData = profileSnap.data();
                          const firstName = profileData.firstName || '';
                          const lastName = profileData.lastName || '';
                          const name = `${firstName} ${lastName}`.trim() || 'Anonymous';
                          return {
                            id: member.id,
                            userId,
                            name,
                            username: profileData.username,
                            photo: profileData.photo,
                          };
                        }
                      } catch (error) {
                        console.debug(`Could not fetch profile for ${userId}:`, error);
                      }
                      // Fallback if profile doesn't exist
                      return {
                        id: member.id,
                        userId,
                        name: 'Anonymous',
                        username: undefined,
                        photo: undefined,
                      };
                    })
                  );
                  setTeamMembersWithProfiles(membersWithProfiles);
                } catch (error) {
                  // Silently fail - members are optional
                  console.debug('Team members not accessible:', error);
                }
              } else {
                console.warn('Team visibility is not public:', teamData.visibility);
              }
            } else {
              // Fallback if team not found but project references it
              console.warn('Team document does not exist:', projectData.teamId);
              creatorData = {
                name: 'Team Project',
                type: 'team',
              };
            }
          } catch (error: any) {
            // Team might be invite-only or not accessible - log for debugging
            console.error('Error fetching team:', {
              teamId: projectData.teamId,
              errorCode: error?.code,
              errorMessage: error?.message,
              errorDetails: error
            });
            creatorData = {
              name: 'Team Project',
              type: 'team',
            };
          }
        } else if (projectData.userId) {
          // Individual project - fetch user profile
          try {
            const profileRef = doc(db, 'profiles', projectData.userId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              const profileData = profileSnap.data();
              creatorData = {
                name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Anonymous',
                type: 'individual',
                photo: profileData.photo,
                title: profileData.title,
              };
            } else {
              creatorData = {
                name: 'Anonymous',
                type: 'individual',
              };
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
            creatorData = {
              name: 'Anonymous',
              type: 'individual',
            };
          }
        }

        setProject({
          id: projectSnap.id,
          ...projectData,
          createdAt: projectData.createdAt?.toDate ? projectData.createdAt.toDate() : new Date(projectData.createdAt),
          updatedAt: projectData.updatedAt?.toDate ? projectData.updatedAt.toDate() : new Date(projectData.updatedAt),
          submittedAt: projectData.submittedAt?.toDate ? projectData.submittedAt.toDate() : new Date(projectData.submittedAt),
        });
        setChallenge(challengeData);
        setCreator(creatorData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Error loading project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="h-12 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-64 bg-card border border-border rounded-lg animate-pulse" />
            <div className="h-96 bg-card border border-border rounded-lg animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Exhibition Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-accent/5 to-transparent" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
              className="mb-8 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>

            {/* Project Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {project.categories && project.categories.length > 0 && (
                      <Badge className="bg-accent/10 text-accent border-accent/20">
                        {project.categories[0]}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {project.submittedAt && format(project.submittedAt, 'MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl font-bold mb-4">
                    <span className="gradient-text">{project.title}</span>
                  </h1>
                  
                  {project.description && (
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Creator Info */}
              {creator && (
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                  {creator.type === 'individual' && creator.photo && (
                    <img
                      src={creator.photo}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{creator.name}</span>
                      {creator.type === 'team' && (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {creator.title && (
                      <p className="text-sm text-muted-foreground">{creator.title}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Challenge Info */}
              {challenge && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>
                    Submitted for <span className="font-medium text-foreground">{challenge.title}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Project Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Video Demo */}
            {project.youtubeVideoId && (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${project.youtubeVideoId}`}
                  title={project.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Project Details */}
            <div className="grid md:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="md:col-span-3 space-y-8">
                {/* README Content */}
                {project.readme && (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="bg-card border border-border rounded-xl p-8">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.readme}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {!project.readme && (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No additional project details available.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Project Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        Submitted
                      </Badge>
                    </div>
                    
                    {project.submittedAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                        <p className="text-sm font-medium">
                          {format(project.submittedAt, 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    {project.createdAt && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Created</p>
                        <p className="text-sm font-medium">
                          {format(project.createdAt, 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    {project.categories && project.categories.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {project.categories.map((category: string) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="text-xs"
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Challenge Card */}
                {challenge && (
                  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-2">Challenge</h3>
                    <p className="text-sm font-medium">{challenge.title}</p>
                    {challenge.companyInfo?.name && (
                      <p className="text-xs text-muted-foreground">
                        by {challenge.companyInfo.name}
                      </p>
                    )}
                  </div>
                )}

                {/* Creator Card */}
                {creator && (
                  <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {creator.type === 'team' ? 'Team' : 'Creator'}
                    </h3>
                    <div className="flex items-center gap-3">
                      {creator.type === 'individual' && creator.photo && (
                        <img
                          src={creator.photo}
                          alt={creator.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{creator.name}</p>
                        {creator.title && (
                          <p className="text-xs text-muted-foreground">{creator.title}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Team Members */}
                    {creator.type === 'team' && teamMembersWithProfiles.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                        <div className="space-y-2">
                          {teamMembersWithProfiles.slice(0, 5).map((member) => (
                            <Link
                              key={member.id}
                              to={member.username ? `/u/${member.username}` : `/u/${member.userId}`}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                            >
                              {member.photo && (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <span className="text-xs text-foreground group-hover:text-accent transition-colors">
                                {member.name}
                              </span>
                            </Link>
                          ))}
                          {teamMembersWithProfiles.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{teamMembersWithProfiles.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectShowcase;

