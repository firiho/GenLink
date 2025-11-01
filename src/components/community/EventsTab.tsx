import { useState, useMemo } from 'react';
import { SearchBar } from './SearchBar';
import { EventCard } from './EventCard';
import { EventListItem } from './EventListItem';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, LayoutGrid, List } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Temporary event data - will be replaced with Firebase integration
const TEMP_EVENTS = [
  {
    id: '1',
    title: 'AI & Machine Learning Summit 2025',
    description: 'Join us for a comprehensive summit on the latest developments in AI and machine learning.',
    date: 'November 15, 2025',
    time: '9:00 AM - 5:00 PM',
    location: 'Kigali Convention Centre',
    type: 'In-Person' as const,
    attendees: 450,
    maxAttendees: 500,
    category: 'Technology',
  },
  {
    id: '2',
    title: 'Web3 & Blockchain Workshop',
    description: 'Learn about decentralized applications and blockchain technology from industry experts.',
    date: 'November 20, 2025',
    time: '2:00 PM - 6:00 PM',
    location: 'Virtual Event',
    type: 'Online' as const,
    attendees: 1250,
    maxAttendees: 2000,
    category: 'Blockchain',
  },
  {
    id: '3',
    title: 'Startup Pitch Night',
    description: 'Watch innovative startups pitch their ideas to investors and win amazing prizes.',
    date: 'November 22, 2025',
    time: '6:00 PM - 9:00 PM',
    location: 'Norrsken House Kigali',
    type: 'Hybrid' as const,
    attendees: 180,
    maxAttendees: 200,
    category: 'Entrepreneurship',
  },
  {
    id: '4',
    title: 'UI/UX Design Masterclass',
    description: 'Master the principles of user interface and user experience design with hands-on exercises.',
    date: 'November 25, 2025',
    time: '10:00 AM - 4:00 PM',
    location: 'Impact Hub Kigali',
    type: 'In-Person' as const,
    attendees: 65,
    maxAttendees: 80,
    category: 'Design',
  },
  {
    id: '5',
    title: 'DevOps & Cloud Computing',
    description: 'Deep dive into DevOps practices and cloud infrastructure management.',
    date: 'December 1, 2025',
    time: '1:00 PM - 5:00 PM',
    location: 'Virtual Event',
    type: 'Online' as const,
    attendees: 890,
    maxAttendees: 1000,
    category: 'Technology',
  },
  {
    id: '6',
    title: 'Women in Tech Networking',
    description: 'Connect with inspiring women leaders in technology and share experiences.',
    date: 'December 5, 2025',
    time: '5:00 PM - 8:00 PM',
    location: 'The Office Kigali',
    type: 'In-Person' as const,
    attendees: 95,
    maxAttendees: 120,
    category: 'Networking',
  },
  {
    id: '7',
    title: 'Mobile App Development Bootcamp',
    description: 'Intensive bootcamp covering iOS and Android development from scratch.',
    date: 'December 10, 2025',
    time: '9:00 AM - 6:00 PM',
    location: 'Carnegie Mellon University Africa',
    type: 'Hybrid' as const,
    attendees: 145,
    maxAttendees: 150,
    category: 'Development',
  },
  {
    id: '8',
    title: 'Cybersecurity Essentials',
    description: 'Learn the fundamentals of cybersecurity and protect your digital assets.',
    date: 'December 15, 2025',
    time: '3:00 PM - 7:00 PM',
    location: 'Virtual Event',
    type: 'Online' as const,
    attendees: 620,
    maxAttendees: 1000,
    category: 'Security',
  },
  {
    id: '9',
    title: 'Tech Career Fair 2025',
    description: 'Meet with top tech companies hiring for various positions across East Africa.',
    date: 'December 18, 2025',
    time: '10:00 AM - 5:00 PM',
    location: 'Kigali Arena',
    type: 'In-Person' as const,
    attendees: 2340,
    maxAttendees: 3000,
    category: 'Career',
  },
  {
    id: '10',
    title: 'Data Science & Analytics',
    description: 'Explore data science techniques and learn how to extract insights from data.',
    date: 'December 20, 2025',
    time: '2:00 PM - 6:00 PM',
    location: 'Virtual Event',
    type: 'Online' as const,
    attendees: 780,
    maxAttendees: 1200,
    category: 'Data Science',
  },
  {
    id: '11',
    title: 'IoT & Smart Cities Forum',
    description: 'Discuss the future of smart cities and IoT implementation in Africa.',
    date: 'January 5, 2026',
    time: '9:00 AM - 4:00 PM',
    location: 'Rwanda ICT Chamber',
    type: 'Hybrid' as const,
    attendees: 210,
    maxAttendees: 250,
    category: 'Technology',
  },
  {
    id: '12',
    title: 'Product Management Workshop',
    description: 'Learn the essential skills needed to become a successful product manager.',
    date: 'January 10, 2026',
    time: '1:00 PM - 5:00 PM',
    location: 'Virtual Event',
    type: 'Online' as const,
    attendees: 340,
    maxAttendees: 500,
    category: 'Product',
  },
];

type EventType = 'All' | 'In-Person' | 'Online' | 'Hybrid';

export const EventsTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType>('All');
  const [displayLimit, setDisplayLimit] = useState(12);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredEvents = useMemo(() => {
    let filtered = TEMP_EVENTS;

    // Apply type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, typeFilter]);

  const displayedEvents = filteredEvents.slice(0, displayLimit);
  const hasMore = displayLimit < filteredEvents.length;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
          </h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search events by name, location, category..."
            className="w-full sm:flex-1 lg:w-80"
          />
          
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType)}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="In-Person">In-Person</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-1 p-1 bg-muted rounded-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={`rounded-full ${viewMode === 'list' ? 'bg-background text-foreground shadow-sm hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`rounded-full ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm hover:bg-background' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {displayedEvents.length > 0 ? (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-2">
              {displayedEvents.map((event, index) => (
                <EventListItem
                  key={event.id}
                  {...event}
                  onClick={() => console.log('Event clicked:', event.id)}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onClick={() => console.log('Event clicked:', event.id)}
                  index={index}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                Load More Events
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">
            {searchQuery || typeFilter !== 'All' 
              ? 'Try adjusting your search or filters' 
              : 'No upcoming events at the moment'}
          </p>
        </div>
      )}
    </div>
  );
};

