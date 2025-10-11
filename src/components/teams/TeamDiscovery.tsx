import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Users, 
  MapPin, 
  Calendar,
  Trophy,
  Target,
  UserPlus,
  Share2
} from 'lucide-react';
import { TeamService } from '@/services/teamService';
import { Team } from '@/types/team';
import TeamCard from './TeamCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface TeamDiscoveryProps {
  onJoinTeam?: (team: Team) => void;
  onInviteToTeam?: (team: Team) => void;
}

export default function TeamDiscovery({ onJoinTeam, onInviteToTeam }: TeamDiscoveryProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    maxMembers: 'any',
    visibility: 'all'
  });

  const commonSkills = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'JavaScript', 'TypeScript', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'Linux', 'Windows',
    'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3', 'Mobile Development',
    'UI/UX Design', 'Product Management', 'DevOps', 'Security', 'Testing'
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const discoveredTeams = await TeamService.discoverTeams({
          skills: filters.skills.length > 0 ? filters.skills : undefined,
          maxMembers: filters.maxMembers !== 'any' ? parseInt(filters.maxMembers) : undefined,
          visibility: filters.visibility !== 'all' ? filters.visibility : undefined
        });
        setTeams(discoveredTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [filters]);

  const filteredTeams = teams.filter(team => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query) ||
      team.challengeTitle.toLowerCase().includes(query) ||
      (team.tags && team.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const addSkillFilter = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkillFilter = (skill: string) => {
    setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      maxMembers: 'any',
      visibility: 'all'
    });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.skills.length > 0 || filters.maxMembers !== 'any' || filters.visibility !== 'all' || searchQuery;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search and Filters Skeleton */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discover Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search teams by name, description, skills, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Team Size</label>
              <Select value={filters.maxMembers} onValueChange={(value) => setFilters(prev => ({ ...prev, maxMembers: value }))}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Any size" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectItem value="any" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Any size</SelectItem>
                  <SelectItem value="5" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Up to 5</SelectItem>
                  <SelectItem value="10" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Up to 10</SelectItem>
                  <SelectItem value="15" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Up to 15</SelectItem>
                  <SelectItem value="20" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Up to 20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Visibility</label>
              <Select value={filters.visibility} onValueChange={(value) => setFilters(prev => ({ ...prev, visibility: value }))}>
                <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Teams</SelectItem>
                  <SelectItem value="public" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Public</SelectItem>
                  <SelectItem value="joinable" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Joinable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">View Mode</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Skill Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter by Skills</label>
            <div className="flex flex-wrap gap-2">
              {filters.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    onClick={() => removeSkillFilter(skill)}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Popular skills:</div>
            <div className="flex flex-wrap gap-2">
              {commonSkills.slice(0, 12).map(skill => (
                <Badge 
                  key={skill} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={() => addSkillFilter(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {filteredTeams.length} Team{filteredTeams.length !== 1 ? 's' : ''} Found
          </h3>
          {hasActiveFilters && (
            <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
              Filtered
            </Badge>
          )}
        </div>

        {filteredTeams.length === 0 ? (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Users className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Teams Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : 'No teams are currently available for discovery'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' 
            : 'space-y-4'
          }>
            {filteredTeams.map((team, index) => (
              <TeamCard
                key={team.id}
                team={team}
                isMember={false}
                onViewDetails={onJoinTeam}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
