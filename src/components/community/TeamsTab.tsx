import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { SearchBar } from './SearchBar';
import { TeamListItem } from './TeamListItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import TeamDetailsModal from '@/components/teams/TeamDetailsModal';
import { Team } from '@/types/team';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Initialize the cloud function
const getTeamsFunction = httpsCallable(functions, 'teams');

export const TeamsTab = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  
  // Filters
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Full'>('All');
  const [submissionFilter, setSubmissionFilter] = useState<'All' | 'Submitted' | 'Not Submitted'>('All');

  // Debounce search query for optimization
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch teams when search query or filters change
  useEffect(() => {
    fetchTeams(true);
  }, [debouncedSearch, availabilityFilter, submissionFilter]);

  const fetchTeams = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const result = await getTeamsFunction({
        limit: 24,
        cursor: reset ? null : cursor,
        searchQuery: debouncedSearch,
        availabilityFilter,
        submissionFilter,
      });

      const data = result.data as {
        success: boolean;
        teams: Team[];
        hasMore: boolean;
        nextCursor: string | null;
      };

      if (data.success) {
        if (reset) {
          setTeams(data.teams);
        } else {
          setTeams(prev => [...prev, ...data.teams]);
        }
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleTeamClick = (team: Team) => {
    // Navigate to team details page
    window.location.href = `/t/${team.id}`;
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTeams(false);
    }
  };

  const isInitialLoad = loading && teams.length === 0;

  return (
    <div className="space-y-6">
      {/* Search Bar and Filters */}
      <div className="flex flex-col md:flex-row gap-3 w-full justify-center items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, challenge, tags..."
          className="w-full md:max-w-md"
        />
        
        {/* Desktop Filters - Inline */}
        <div className="hidden md:flex items-center gap-2">
          <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as typeof availabilityFilter)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Availability</SelectItem>
              <SelectItem value="Available">Available to Join</SelectItem>
              <SelectItem value="Full">Full Teams</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={submissionFilter} onValueChange={(value) => setSubmissionFilter(value as typeof submissionFilter)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Submission" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Status</SelectItem>
              <SelectItem value="Submitted">Has Submitted</SelectItem>
              <SelectItem value="Not Submitted">Not Submitted</SelectItem>
            </SelectContent>
          </Select>

          {(availabilityFilter !== 'All' || submissionFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAvailabilityFilter('All');
                setSubmissionFilter('All');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Mobile Filters - Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {(availabilityFilter !== 'All' || submissionFilter !== 'All') && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border shadow-lg" align="center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Availability</h4>
                <Select value={availabilityFilter} onValueChange={(value) => setAvailabilityFilter(value as typeof availabilityFilter)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Availability</SelectItem>
                    <SelectItem value="Available">Available to Join</SelectItem>
                    <SelectItem value="Full">Full Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Submission Status</h4>
                <Select value={submissionFilter} onValueChange={(value) => setSubmissionFilter(value as typeof submissionFilter)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Status</SelectItem>
                    <SelectItem value="Submitted">Has Submitted</SelectItem>
                    <SelectItem value="Not Submitted">Not Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAvailabilityFilter('All');
                    setSubmissionFilter('All');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Teams Display */}
      {isInitialLoad ? (
        /* Loading Skeletons */
        <div className="space-y-0 divide-y divide-border">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4 px-2">
              <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : teams.length > 0 ? (
        <>
          <div className="space-y-0 divide-y divide-border">
            {teams.map((team, index) => (
              <TeamListItem
                key={team.id}
                {...team}
                onClick={() => handleTeamClick(team)}
                index={index}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                disabled={loadingMore}
                className="min-w-[200px]"
              >
                {loadingMore ? (
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

