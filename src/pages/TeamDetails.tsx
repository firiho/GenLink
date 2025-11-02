import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TeamService } from '@/services/teamService';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Users, 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Trophy,
  Target,
  UserPlus,
  Clock,
  MapPin
} from 'lucide-react';
import { Event } from '@/types/event';

interface TeamMemberWithProfile {
  id: string;
  userId: string;
  username?: string;
  name: string;
  email: string;
  photo: string;
  role: string;
  joinedAt: Date;
}

interface Challenge {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  prize?: string;
  total_prize?: number;
  organization?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  challengeId: string;
  challengeTitle: string;
  challengeData?: Challenge;
  maxMembers: number;
  currentMembers: number;
  status: 'active' | 'inactive' | 'closed';
  visibility: 'public' | 'invite-only';
  tags: string[];
  createdAt: Date;
  lastActivity: Date;
  hasSubmitted: boolean;
  submittedAt?: Date;
}

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [teamEvents, setTeamEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const teamDoc = await getDoc(doc(db, 'teams', id));
        
        if (teamDoc.exists()) {
          const data = teamDoc.data();
          
          // Fetch challenge data
          let challengeData: Challenge | undefined;
          if (data.challengeId) {
            try {
              const challengeDoc = await getDoc(doc(db, 'challenges', data.challengeId));
              if (challengeDoc.exists()) {
                const chalData = challengeDoc.data();
                challengeData = {
                  id: challengeDoc.id,
                  title: chalData.title,
                  description: chalData.description,
                  deadline: chalData.deadline,
                  prize: chalData.prize,
                  total_prize: chalData.total_prize,
                  organization: chalData.companyInfo?.name || chalData.organization,
                };
              }
            } catch (err) {
              console.error('Error fetching challenge:', err);
            }
          }
          
          // Fetch members using TeamService (from subcollection)
          let membersList: TeamMemberWithProfile[] = [];
          try {
            const teamMembers = await TeamService.getTeamMembersWithProfiles(id);
            membersList = teamMembers as TeamMemberWithProfile[];
            console.log('Fetched team members:', membersList);
          } catch (err) {
            console.error('Error fetching team members:', err);
          }

          setTeam({
            id: teamDoc.id,
            name: data.name,
            description: data.description || '',
            challengeId: data.challengeId,
            challengeTitle: data.challengeTitle,
            challengeData,
            maxMembers: data.maxMembers,
            currentMembers: data.currentMembers || 0,
            status: data.status,
            visibility: data.visibility,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            lastActivity: data.lastActivity?.toDate?.() || data.updatedAt?.toDate?.() || new Date(),
            hasSubmitted: data.hasSubmitted || false,
            submittedAt: data.submittedAt?.toDate?.(),
          });
          setMembers(membersList);
          
          // Check membership and application status (only if authenticated)
          if (user) {
            try {
              const memberInfo = await TeamService.getTeamMember(id, user.uid);
              setIsMember(!!memberInfo);
              
              // Check if user has pending application
              const applicationsQuery = query(
                collection(db, 'teams', id, 'applications'),
                where('applicantId', '==', user.uid),
                where('status', '==', 'pending')
              );
              const applicationsSnap = await getDocs(applicationsQuery);
              setHasPendingApplication(!applicationsSnap.empty);
            } catch (err) {
              // User might not have access to check membership, that's okay
              console.warn('Could not check membership status:', err);
              setIsMember(false);
              setHasPendingApplication(false);
            }
          } else {
            setIsMember(false);
            setHasPendingApplication(false);
          }
          
          // Fetch events created by team members (events are isolated, but we show events by team members)
          try {
            setLoadingEvents(true);
            // Get team member IDs
            const membersSnap = await getDocs(collection(db, 'teams', id, 'members'));
            const memberIds = membersSnap.docs.map(doc => doc.id);
            
            if (memberIds.length > 0) {
              // Query events where organizerId is one of the team members
              // Note: Firestore 'in' queries are limited to 10 items, so we need to batch
              const allEvents: Event[] = [];
              
              for (let i = 0; i < memberIds.length; i += 10) {
                const batch = memberIds.slice(i, i + 10);
                const eventsQuery = query(
                  collection(db, 'events'),
                  where('organizerId', 'in', batch),
                  where('status', '==', 'published'),
                  where('visibility', '==', 'public')
                );
                const eventsSnap = await getDocs(eventsQuery);
                const eventsList = eventsSnap.docs.map(eventDoc => ({
                  id: eventDoc.id,
                  ...eventDoc.data(),
                  createdAt: eventDoc.data().createdAt?.toDate ? eventDoc.data().createdAt.toDate() : new Date(eventDoc.data().createdAt),
                  updatedAt: eventDoc.data().updatedAt?.toDate ? eventDoc.data().updatedAt.toDate() : new Date(eventDoc.data().updatedAt),
                })) as Event[];
                allEvents.push(...eventsList);
              }
              
              setTeamEvents(allEvents);
            }
          } catch (err) {
            console.error('Error fetching team member events:', err);
          } finally {
            setLoadingEvents(false);
          }
        } else {
          setError(true);
        }
      } catch (err: any) {
        console.error('Error fetching team:', err);
        // If it's a permissions error and team might be private, show a more helpful message
        if (err?.code === 'permission-denied') {
          setError(true);
        } else {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id, user]);

  const handleRequestToJoin = async () => {
    if (!team || !id) {
      return;
    }

    // If user is not logged in, redirect to signin with return URL
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`/signin?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    if (team.currentMembers >= team.maxMembers) {
      toast.error('Team is at full capacity');
      return;
    }

    setRequesting(true);
    try {
      await TeamService.createTeamApplication(id, user.uid, `I would like to join ${team.name} for the ${team.challengeTitle} challenge.`);
      toast.success('Join request submitted! The team admin will review your request.');
      setHasPendingApplication(true);
    } catch (error: any) {
      console.error('Error requesting to join:', error);
      toast.error(error.message || 'Failed to submit join request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Team Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The team you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/community/teams')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isFull = team.currentMembers >= team.maxMembers;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/community/teams')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>

          {/* Header Card */}
          <div className="bg-card border border-border rounded-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Team Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-accent/5 border border-border flex items-center justify-center">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-foreground" />
                </div>
              </div>
              
              {/* Team Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{team.name}</h1>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground mb-4">
                      <Target className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="line-clamp-1">{team.challengeTitle}</span>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col gap-2">
                    {team.visibility === 'invite-only' && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        <span>Private</span>
                      </div>
                    )}
                    {team.hasSubmitted && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-500 text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Submitted</span>
                      </div>
                    )}
                    {isFull && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-medium">
                        <Users className="h-3 w-3" />
                        <span>Full</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 md:gap-6 mt-4">
                  <div>
                    <div className="text-xl md:text-2xl font-bold">
                      {team.currentMembers}/{team.maxMembers}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold capitalize">
                      {team.status === 'active' ? 'Active' : team.status}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Status</div>
                  </div>
                  {team.hasSubmitted && team.submittedAt && (
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-500">
                        <Trophy className="h-7 w-7 md:h-8 md:w-8" />
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">Submitted</div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {team.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {team.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-accent/10 border border-border text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Challenge Info */}
          {team.challengeData && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Challenge Details
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">{team.challengeData.title}</h3>
                  {team.challengeData.organization && (
                    <p className="text-sm text-muted-foreground">by {team.challengeData.organization}</p>
                  )}
                </div>
                {team.challengeData.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{team.challengeData.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {team.challengeData.total_prize && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Prize Pool</p>
                      <p className="font-semibold">${team.challengeData.total_prize.toLocaleString()}</p>
                    </div>
                  )}
                  {team.challengeData.deadline && (
                    <div className="p-3 rounded-lg bg-accent/5 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                      <p className="font-semibold">
                        {new Date(team.challengeData.deadline).toLocaleDateString()}
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
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          {team.description && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4">About This Team</h2>
              <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{team.description}</p>
            </div>
          )}

          {/* Team Events */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Team Events ({teamEvents.length})
            </h2>
            {loadingEvents ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : teamEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const isPast = eventDate < new Date();
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => navigate(`/e/${event.id}`)}
                      className="flex flex-col gap-3 p-4 rounded-lg bg-accent/5 hover:bg-accent/10 border border-border hover:border-primary/50 transition-all cursor-pointer group"
                    >
                      {event.thumbnail && (
                        <div className="w-full h-32 rounded-lg overflow-hidden">
                          <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {event.description}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          event.type === 'In-Person' 
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300'
                            : event.type === 'Online'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300'
                        }`}>
                          {event.type}
                        </span>
                        {isPast && (
                          <span className="text-xs text-muted-foreground">Past Event</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-accent/5 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No events created by this team yet</p>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Members ({members.length})
            </h2>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    onClick={() => navigate(`/u/${member.username || member.userId}`)}
                    className="flex items-center gap-4 p-4 rounded-lg bg-accent/5 hover:bg-accent/10 border border-border hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback className="bg-muted text-foreground">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold group-hover:text-primary transition-colors truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-accent/5 flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No members to display</p>
              </div>
            )}
          </div>

          {/* Activity Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold text-sm md:text-base">
                    {team.createdAt.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/5 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Last Activity</p>
                  <p className="font-semibold text-sm md:text-base">
                    {team.lastActivity.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request to Join Section (Public Teams Only) */}
          {team.visibility === 'public' && !isMember && !hasPendingApplication && team.currentMembers < team.maxMembers && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Want to Join?</h2>
                  <p className="text-sm text-muted-foreground">
                    {user ? 'Request to join this team' : 'Sign in to request to join this team'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {user 
                  ? 'Send a request to join this team. The team admin will review and approve or deny your request.'
                  : 'Sign in to your account to send a request to join this team. The team admin will review your request.'
                }
              </p>
              <Button 
                onClick={handleRequestToJoin}
                disabled={requesting || team.currentMembers >= team.maxMembers}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {requesting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {user ? 'Request to Join Team' : 'Sign In to Join Team'}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Pending Application Status */}
          {hasPendingApplication && !isMember && user && (
            <div className="bg-card border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Pending Request</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Your request to join this team is pending review. The team admin will notify you once they make a decision.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamDetails;

