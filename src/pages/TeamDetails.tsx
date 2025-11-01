import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Trophy,
  Target
} from 'lucide-react';

interface TeamMember {
  id: string;
  username?: string;
  name: string;
  photo: string;
  role: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  challengeId: string;
  challengeTitle: string;
  maxMembers: number;
  currentMembers: number;
  status: 'active' | 'inactive' | 'closed';
  visibility: 'public' | 'invite-only';
  tags: string[];
  createdAt: Date;
  lastActivity: Date;
  hasSubmitted: boolean;
  submittedAt?: Date;
  members?: TeamMember[];
}

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const teamDoc = await getDoc(doc(db, 'teams', id));
        
        if (teamDoc.exists()) {
          const data = teamDoc.data();
          
          // Fetch member details
          const membersList: TeamMember[] = [];
          if (data.members && data.members.length > 0) {
            for (const memberId of data.members.slice(0, 10)) {
              try {
                const profileDoc = await getDoc(doc(db, 'profiles', memberId));
                if (profileDoc.exists()) {
                  const profileData = profileDoc.data();
                  membersList.push({
                    id: profileDoc.id,
                    username: profileData.username || undefined,
                    name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User',
                    photo: profileData.photo || '/placeholder user.svg',
                    role: data.admins?.includes(memberId) ? 'Admin' : 'Member',
                  });
                }
              } catch (err) {
                console.error('Error fetching member:', err);
              }
            }
          }

          setTeam({
            id: teamDoc.id,
            name: data.name,
            description: data.description || '',
            challengeId: data.challengeId,
            challengeTitle: data.challengeTitle,
            maxMembers: data.maxMembers,
            currentMembers: data.currentMembers || 0,
            status: data.status,
            visibility: data.visibility,
            tags: data.tags || [],
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            lastActivity: data.lastActivity?.toDate?.() || new Date(data.lastActivity),
            hasSubmitted: data.hasSubmitted || false,
            submittedAt: data.submittedAt?.toDate?.(),
          });
          setMembers(membersList);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamDetails();
  }, [id]);

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
            <Button onClick={() => navigate('/community?tab=teams')}>
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
          <Button variant="ghost" onClick={() => navigate('/community?tab=teams')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>

          {/* Header Card */}
          <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Team Icon */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-primary" />
                </div>
              </div>
              
              {/* Team Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{team.name}</h1>
                    <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground mb-4">
                      <Target className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{team.challengeTitle}</span>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col gap-2">
                    {team.visibility === 'invite-only' && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-foreground">
                        <Lock className="h-3 w-3" />
                        <span>Private</span>
                      </div>
                    )}
                    {team.hasSubmitted && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Submitted</span>
                      </div>
                    )}
                    {isFull && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                        <Users className="h-3 w-3" />
                        <span>Full</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 md:gap-6 mt-4">
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-primary">
                      {team.currentMembers}/{team.maxMembers}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Members</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold text-primary capitalize">
                      {team.status === 'active' ? 'Active' : team.status}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Status</div>
                  </div>
                  {team.hasSubmitted && team.submittedAt && (
                    <div>
                      <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
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
                        className="px-3 py-1 rounded-full bg-accent/50 border border-border text-sm font-medium text-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">About This Team</h2>
              <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">{team.description}</p>
            </div>
          )}

          {/* Team Members */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Team Members ({members.length})
            </h2>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => navigate(`/u/${member.username || member.id}`)}
                    className="flex items-center gap-4 p-4 rounded-lg bg-accent/30 hover:bg-accent/50 border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border">
                      <AvatarImage src={member.photo} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">No members to display</p>
            )}
          </div>

          {/* Activity Info */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Created</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">
                    {team.createdAt.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/30 border border-border">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Last Activity</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeamDetails;

