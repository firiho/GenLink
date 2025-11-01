import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, where, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchBar } from './SearchBar';
import { TeamCard } from './TeamCard';
import { TeamListItem } from './TeamListItem';
import { Button } from '@/components/ui/button';
import { Loader2, Users, LayoutGrid, List } from 'lucide-react';
import TeamDetailsModal from '@/components/teams/TeamDetailsModal';
import { Team } from '@/types/team';

export const TeamsTab = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [loadLimit, setLoadLimit] = useState(24);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchTeams();
  }, [loadLimit]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        where('status', '==', 'active'),
        where('visibility', '==', 'public'),
        orderBy('lastActivity', 'desc'),
        firestoreLimit(loadLimit)
      );

      const querySnapshot = await getDocs(q);
      const fetchedTeams = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamps to Date objects
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
        const lastActivity = data.lastActivity?.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity);
        const submittedAt = data.submittedAt?.toDate ? data.submittedAt.toDate() : (data.submittedAt ? new Date(data.submittedAt) : undefined);
        
        return {
          id: doc.id,
          name: data.name,
          description: data.description || '',
          challengeId: data.challengeId,
          challengeTitle: data.challengeTitle,
          maxMembers: data.maxMembers,
          currentMembers: data.currentMembers || 0,
          status: data.status,
          visibility: data.visibility,
          joinableEnabled: data.joinableEnabled,
          joinableLink: data.joinableLink,
          joinableCode: data.joinableCode,
          autoApprove: data.autoApprove,
          createdBy: data.createdBy,
          createdAt,
          updatedAt,
          lastActivity,
          hasSubmitted: data.hasSubmitted || false,
          submittedAt,
          tags: data.tags || [],
          admins: data.admins || [],
          permissions: data.permissions || {}
        } as Team;
      });

      setTeams(fetchedTeams);
      setHasMore(querySnapshot.docs.length === loadLimit);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;

    const query = searchQuery.toLowerCase();
    return teams.filter(team => 
      team.name.toLowerCase().includes(query) ||
      team.description?.toLowerCase().includes(query) ||
      team.challengeTitle?.toLowerCase().includes(query) ||
      team.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }, [teams, searchQuery]);

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleLoadMore = () => {
    setLoadLimit(prev => prev + 24);
  };

  if (loading && teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading teams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">
            {filteredTeams.length} {filteredTeams.length === 1 ? 'Team' : 'Teams'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, challenge, tags..."
            className="w-full sm:flex-1 lg:w-96"
          />
          <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none rounded-full ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none rounded-full ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Teams Display */}
      {filteredTeams.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredTeams.map((team, index) => (
                <TeamListItem
                  key={team.id}
                  {...team}
                  onClick={() => handleTeamClick(team)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeams.map((team, index) => (
                <TeamCard
                  key={team.id}
                  {...team}
                  onClick={() => handleTeamClick(team)}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !searchQuery && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                disabled={loading}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search query' : 'No public teams available yet'}
          </p>
        </div>
      )}

      {/* Team Details Modal */}
      {isTeamModalOpen && selectedTeam && (
        <TeamDetailsModal
          team={selectedTeam}
          isMember={false}
          onClose={() => {
            setIsTeamModalOpen(false);
            setSelectedTeam(null);
          }}
          onUpdate={fetchTeams}
        />
      )}
    </div>
  );
};

