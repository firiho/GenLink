import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { SearchBar } from './SearchBar';
import { PersonListItem } from './PersonListItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';
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

interface Profile {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  name: string; // Computed from firstName + lastName for display
  title?: string;
  photo?: string;
  location?: string;
  badges?: string[];
  contributions?: number;
  skills?: string[];
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  // Additional profile fields for modal
  email?: string;
  phone?: string;
  website?: string;
  about?: string;
  experience?: any[];
  education?: any[];
  projects?: any[];
  coverPhoto?: string;
  projectsCount?: number;
}

// Initialize the cloud function
const getPeopleFunction = httpsCallable(functions, 'people');

export const PeopleTab = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Profile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  
  // Filters
  const [locationFilter, setLocationFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');

  // Debounce search query for optimization
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch profiles when search query or filters change
  useEffect(() => {
    fetchProfiles(true);
  }, [debouncedSearch, locationFilter, skillFilter]);

  const fetchProfiles = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const result = await getPeopleFunction({
        limit: 24,
        cursor: reset ? null : cursor,
        searchQuery: debouncedSearch,
        locationFilter: locationFilter !== 'All' ? locationFilter : undefined,
        skillFilter: skillFilter !== 'All' ? skillFilter : undefined,
      });

      const data = result.data as {
        success: boolean;
        profiles: Profile[];
        hasMore: boolean;
        nextCursor: string | null;
      };

      if (data.success) {
        if (reset) {
          setProfiles(data.profiles);
        } else {
          setProfiles(prev => [...prev, ...data.profiles]);
        }
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load people. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePersonClick = (person: Profile) => {
    // Navigate to user profile page using username if available, otherwise use id
    const identifier = person.username || person.id;
    window.location.href = `/u/${identifier}`;
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProfiles(false);
    }
  };

  const isInitialLoad = loading && profiles.length === 0;

  return (
    <div className="space-y-6">
      {/* Search Bar and Filters */}
      <div className="flex flex-col md:flex-row gap-3 w-full justify-center items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, skills, location..."
          className="w-full md:max-w-md"
        />
        
        {/* Desktop Filters - Inline */}
        <div className="hidden md:flex items-center gap-2">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Location</SelectItem>
              <SelectItem value="Rwanda">Rwanda</SelectItem>
              <SelectItem value="Uganda">Uganda</SelectItem>
              <SelectItem value="Tanzania">Tanzania</SelectItem>
              <SelectItem value="Kenya">Kenya</SelectItem>
              <SelectItem value="Burundi">Burundi</SelectItem>
              <SelectItem value="South Sudan">South Sudan</SelectItem>
              <SelectItem value="Ethiopia">Ethiopia</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Skill</SelectItem>
              <SelectItem value="React">React</SelectItem>
              <SelectItem value="Node.js">Node.js</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              <SelectItem value="Machine Learning">Machine Learning</SelectItem>
              <SelectItem value="Mobile Development">Mobile Development</SelectItem>
            </SelectContent>
          </Select>

          {(locationFilter !== 'All' || skillFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocationFilter('All');
                setSkillFilter('All');
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
              {(locationFilter !== 'All' || skillFilter !== 'All') && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border shadow-lg" align="center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Location</h4>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Location</SelectItem>
                    <SelectItem value="South Africa">South Africa</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Egypt">Egypt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Skills</h4>
                <Select value={skillFilter} onValueChange={setSkillFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select skill" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Skill</SelectItem>
                    <SelectItem value="React">React</SelectItem>
                    <SelectItem value="Node.js">Node.js</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                    <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                    <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocationFilter('All');
                    setSkillFilter('All');
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

      {/* People Display */}
      {isInitialLoad ? (
        /* Loading Skeletons */
        <div className="space-y-0 divide-y divide-border">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4 px-2">
              <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className="space-y-0 divide-y divide-border">
            {profiles.map((person, index) => (
              <PersonListItem
                key={person.id}
                {...person}
                onClick={() => handlePersonClick(person)}
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
          <h3 className="text-xl font-semibold mb-2">No people found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search query' : 'No community members yet'}
          </p>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        selectedMember={selectedPerson}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
      />
    </div>
  );
};

