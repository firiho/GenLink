import { useEffect, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/dashboard/events/EventCard';
import { toast } from 'sonner';
import { Event } from '@/types/event';

export default function EventsTab({setActiveView}) {
    const [userEvents, setUserEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [typeFilter, setTypeFilter] = useState<'all' | 'In-Person' | 'Online' | 'Hybrid'>('all');
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserEvents = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                
                // Get events where user is organizer
                const eventsQuery = query(
                    collection(db, 'events'),
                    where('organizerId', '==', user.uid)
                );
                const eventsSnap = await getDocs(eventsQuery);
                
                const eventsList = eventsSnap.docs.map(doc => {
                    const eventData = doc.data();
                    return {
                        id: doc.id,
                        ...eventData,
                        createdAt: eventData.createdAt?.toDate ? eventData.createdAt.toDate() : new Date(eventData.createdAt),
                        updatedAt: eventData.updatedAt?.toDate ? eventData.updatedAt.toDate() : new Date(eventData.updatedAt),
                    } as Event;
                });
                
                setUserEvents(eventsList);
            } catch (error) {
                console.error("Error fetching user events:", error);
                toast.error('Error loading events');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserEvents();
    }, [user]);
    
    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter]);
    
    // Filter events
    const filteredEvents = userEvents.filter(event => {
        const matchesType = typeFilter === 'all' || event.type === typeFilter;
        return matchesType;
    });
    
    // Pagination logic
    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentEvents = filteredEvents.slice(startIndex, endIndex);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col space-y-6">
                <WelcomeSection title="Your Events" subtitle="Manage and track your events" />
                
                {/* Filters and Create Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-3 pb-2 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Type:</span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => setTypeFilter('all')}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                        typeFilter === 'all'
                                            ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setTypeFilter('In-Person')}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                        typeFilter === 'In-Person'
                                            ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    In-Person
                                </button>
                                <button
                                    onClick={() => setTypeFilter('Online')}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                        typeFilter === 'Online'
                                            ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Online
                                </button>
                                <button
                                    onClick={() => setTypeFilter('Hybrid')}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                        typeFilter === 'Hybrid'
                                            ? 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    Hybrid
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Create Button */}
                    <Button 
                        onClick={() => setActiveView('create-event')}
                        className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 whitespace-nowrap"
                    >
                        <CalendarPlus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                {isLoading ? (
                    <div>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 animate-pulse last:border-b-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Events Display - Table-like List */}
                        {currentEvents.length > 0 ? (
                            currentEvents.map((event, index) => (
                                <EventCard 
                                    key={event.id} 
                                    event={event} 
                                    index={index} 
                                    setActiveView={setActiveView}
                                    viewMode="list"
                                />
                            ))
                        ) : (
                            <div className="px-4 py-12 text-center">
                                <CalendarPlus className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400">No events found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} events
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

