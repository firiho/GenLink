import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { SearchBar } from './SearchBar';
import { EventListItem } from './EventListItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Loader2, SlidersHorizontal } from 'lucide-react';
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
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

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

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'In-Person' | 'Online' | 'Hybrid';
  attendees: number;
  maxAttendees: number;
  category: string;
}

// Initialize the cloud function
const getEventsFunction = httpsCallable(functions, 'events');

export const EventsTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Upcoming' | 'This Week' | 'This Month'>('All');
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  // Debounce search query for optimization
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch events when search query or filters change
  useEffect(() => {
    fetchEvents(true);
  }, [debouncedSearch, typeFilter, categoryFilter, dateFilter]);

  const fetchEvents = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCursor(null);
      } else {
        setLoadingMore(true);
      }

      const result = await getEventsFunction({
        limit: 24,
        cursor: reset ? null : cursor,
        searchQuery: debouncedSearch,
        typeFilter: typeFilter,
        categoryFilter: categoryFilter !== 'All' ? categoryFilter : undefined,
        dateFilter: dateFilter,
      });

      const data = result.data as {
        success: boolean;
        events: Event[];
        hasMore: boolean;
        nextCursor: string | null;
      };

      if (data.success) {
        if (reset) {
          setEvents(data.events);
        } else {
          setEvents(prev => [...prev, ...data.events]);
        }
        setHasMore(data.hasMore);
        setCursor(data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchEvents(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 w-full justify-center items-center">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search events by name, location, category..."
          className="w-full md:max-w-md"
        />
        
        {/* Desktop Filters - Inline */}
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-center">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Type</SelectItem>
              <SelectItem value="In-Person">In-Person</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Category</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Networking">Networking</SelectItem>
              <SelectItem value="Hackathon">Hackathon</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Meetup">Meetup</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
              <SelectItem value="All">Any Time</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {(typeFilter !== 'All' || categoryFilter !== 'All' || dateFilter !== 'All') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter('All');
                setCategoryFilter('All');
                setDateFilter('All');
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
              {(typeFilter !== 'All' || categoryFilter !== 'All' || dateFilter !== 'All') && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-card border-border shadow-lg" align="center">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Event Type</h4>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Type</SelectItem>
                    <SelectItem value="In-Person">In-Person</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Category</h4>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Category</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Networking">Networking</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">Date Range</h4>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as typeof dateFilter)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border shadow-lg">
                    <SelectItem value="All">Any Time</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="This Week">This Week</SelectItem>
                    <SelectItem value="This Month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('All');
                    setCategoryFilter('All');
                    setDateFilter('All');
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

      {/* Events Display */}
      {loading ? (
        /* Loading Skeletons */
        <div className="space-y-3">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
              <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-40" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="space-y-0 divide-y divide-border">
            {events.map((event, index) => (
              <EventListItem
                key={event.id}
                {...event}
                onClick={() => window.location.href = `/e/${event.id}`}
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
                  'Load More Events'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
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

