import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchBar } from './SearchBar';
import { PersonCard } from './PersonCard';
import { PersonListItem } from './PersonListItem';
import { Button } from '@/components/ui/button';
import { Loader2, Users, LayoutGrid, List } from 'lucide-react';
import ProfileModal from '@/components/ProfileModal';

interface Profile {
  id: string;
  name: string;
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

export const PeopleTab = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Profile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadLimit, setLoadLimit] = useState(24);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchProfiles();
  }, [loadLimit]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const profilesRef = collection(db, 'profiles');
      const q = query(
        profilesRef,
        orderBy('contributions', 'desc'),
        firestoreLimit(loadLimit)
      );

      const querySnapshot = await getDocs(q);
      const fetchedProfiles = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.displayName || 'Anonymous User',
          title: data.title || 'Community Member',
          photo: data.photo || '/placeholder user.svg',
          location: data.location || '',
          badges: data.badges || [],
          contributions: data.contributions || 0,
          skills: data.skills || [],
          social: data.social || {},
          // Additional fields for modal
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          about: data.about || '',
          experience: data.experience || [],
          education: data.education || [],
          projects: data.projects || [],
          coverPhoto: data.coverPhoto || '',
          projectsCount: data.projectsCount || 0,
        } as Profile;
      });

      setProfiles(fetchedProfiles);
      setHasMore(querySnapshot.docs.length === loadLimit);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(query) ||
      profile.title?.toLowerCase().includes(query) ||
      profile.location?.toLowerCase().includes(query) ||
      profile.skills?.some(skill => skill.toLowerCase().includes(query)) ||
      profile.badges?.some(badge => badge.toLowerCase().includes(query))
    );
  }, [profiles, searchQuery]);

  const handlePersonClick = (person: Profile) => {
    setSelectedPerson(person);
    setIsProfileOpen(true);
  };

  const handleLoadMore = () => {
    setLoadLimit(prev => prev + 24);
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading community members...</p>
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
            {filteredProfiles.length} {filteredProfiles.length === 1 ? 'Person' : 'People'}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, skills, location..."
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

      {/* People Display */}
      {filteredProfiles.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {filteredProfiles.map((person, index) => (
                <PersonListItem
                  key={person.id}
                  {...person}
                  onClick={() => handlePersonClick(person)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProfiles.map((person, index) => (
                <PersonCard
                  key={person.id}
                  {...person}
                  onClick={() => handlePersonClick(person)}
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

