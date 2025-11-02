import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { rsvpToEvent, cancelRsvp, getEventAttendees } from '@/services/eventService';
import { toast } from 'sonner';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Video,
  Building,
  Globe,
  Tag,
  ExternalLink,
  Check,
  UserPlus
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  locationDetails?: string;
  type: 'In-Person' | 'Online' | 'Hybrid';
  attendees: number;
  maxAttendees?: number;
  category: string;
  organizer?: string;
  organizerName?: string;
  organizerId?: string;
  thumbnail?: string;
  coverImage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasRsvpd, setHasRsvpd] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [attendeesList, setAttendeesList] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventDoc = await getDoc(doc(db, 'events', id));
        
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          const eventData = {
            id: eventDoc.id,
            title: data.title,
            description: data.description || '',
            date: data.date,
            time: data.time,
            location: data.location,
            locationDetails: data.locationDetails,
            type: data.type,
            attendees: data.attendees || 0,
            maxAttendees: data.maxAttendees,
            category: data.category,
            organizer: data.organizer,
            organizerName: data.organizerName,
            organizerId: data.organizerId,
            thumbnail: data.thumbnail,
            coverImage: data.coverImage || data.thumbnail,
            coordinates: data.coordinates,
          };
          setEvent(eventData);
          
          // Check if user has RSVP'd
          if (user && data.attendeeIds && Array.isArray(data.attendeeIds)) {
            setHasRsvpd(data.attendeeIds.includes(user.uid));
          }
          
          // Load attendees if user is organizer or has RSVP'd
          if (user && (data.organizerId === user.uid || data.attendeeIds?.includes(user.uid))) {
            loadAttendees(data.attendeeIds || []);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const loadAttendees = async (attendeeIds: string[]) => {
    if (attendeeIds.length === 0) {
      setAttendeesList([]);
      return;
    }
    
    try {
      setLoadingAttendees(true);
      // Fetch user profiles for attendees
      const profiles = await Promise.all(
        attendeeIds.map(async (userId) => {
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', userId));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data();
              return {
                id: userId,
                name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || profileData.email || 'Anonymous',
                email: profileData.email,
                photo: profileData.photo,
              };
            }
            return { id: userId, name: 'Anonymous', email: null, photo: null };
          } catch (err) {
            return { id: userId, name: 'Anonymous', email: null, photo: null };
          }
        })
      );
      setAttendeesList(profiles);
    } catch (err) {
      console.error('Error loading attendees:', err);
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      // Redirect to sign in with return path
      const currentPath = `/e/${id}`;
      navigate(`/signin?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    // Check if user is a participant
    if (user.userType !== 'participant') {
      toast.error('Only GenLink participant accounts can RSVP to events');
      return;
    }
    
    if (!event) return;
    
    setRsvpLoading(true);
    try {
      if (hasRsvpd) {
        // Cancel RSVP
        const success = await cancelRsvp(event.id, user.uid);
        if (success) {
          setHasRsvpd(false);
          setEvent({ ...event, attendees: event.attendees - 1 });
          // Remove from attendees list
          setAttendeesList(attendeesList.filter(a => a.id !== user.uid));
        }
      } else {
        // RSVP
        const success = await rsvpToEvent(event.id, user.uid);
        if (success) {
          setHasRsvpd(true);
          setEvent({ ...event, attendees: event.attendees + 1 });
          // Add to attendees list
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
            const profileData = profileDoc.exists() ? profileDoc.data() : {};
            const userProfile = {
              id: user.uid,
              name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || user.email || 'Anonymous',
              email: user.email,
              photo: profileData.photo,
            };
            setAttendeesList([...attendeesList, userProfile]);
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        }
      }
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/community?tab=events')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const isFull = event.attendees >= event.maxAttendees;
  const isPast = eventDate < new Date();

  const getEventIcon = () => {
    switch (event.type) {
      case 'Online':
        return <Video className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
      case 'In-Person':
        return <Building className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
      case 'Hybrid':
        return <Globe className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
      default:
        return <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/community?tab=events')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2 text-slate-700 dark:text-slate-300" />
            Back to Events
          </Button>

          {/* Cover Image */}
          {event.coverImage ? (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>
          ) : (
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/10 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-24 w-24 md:h-32 md:w-32 text-primary/20 dark:text-primary/40" />
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="bg-card border rounded-xl p-6 md:p-8 -mt-20 md:-mt-24 relative z-10 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 md:gap-4 mb-4">

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-foreground">{event.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-accent/50 border border-border text-xs md:text-sm font-medium text-foreground">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-medium">
                        {getEventIcon()}
                        {event.type}
                      </span>
                      {isPast && (
                        <span className="px-3 py-1 rounded-full bg-muted border border-border text-xs md:text-sm font-medium text-foreground">
                          Past Event
                        </span>
                      )}
                      {isFull && !isPast && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs md:text-sm font-medium">
                          Full
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex md:flex-col gap-4 md:gap-4 md:items-end">
                <div className="text-center md:text-right">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {event.attendees}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Attendees</div>
                </div>
                {event.maxAttendees && (
                  <div className="text-center md:text-right">
                    <div className="text-2xl md:text-3xl font-bold text-muted-foreground">
                      {event.maxAttendees}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">Capacity</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-card border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-semibold text-sm md:text-base text-foreground leading-snug">
                    {eventDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">{event.time}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">RSVPs</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">
                    {event.attendees} {event.maxAttendees ? `of ${event.maxAttendees}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Map Section */}
          {event.type !== 'Online' && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                Location
              </h2>
              <div className="space-y-4">
                <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden border border-border bg-muted">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.location + (event.locationDetails ? ', ' + event.locationDetails : ''))}&output=embed`}
                    title={event.location}
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-center">
                    <p className="text-foreground font-medium">{event.location}</p>
                    {event.locationDetails && (
                      <p className="text-sm text-muted-foreground">{event.locationDetails}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const query = encodeURIComponent(`${event.location}${event.locationDetails ? ', ' + event.locationDetails : ''}`);
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-slate-700 dark:text-slate-300" />
                    Open in Google Maps
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">About This Event</h2>
            <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* RSVP Button */}
          {!isPast && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold mb-1 text-foreground">
                    {hasRsvpd ? 'You\'re Going!' : 'Join This Event'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {user && user.userType !== 'participant'
                      ? 'Only GenLink participant accounts can RSVP to events'
                      : hasRsvpd 
                      ? 'You have RSVP\'d to this event' 
                      : event.maxAttendees && event.attendees >= event.maxAttendees
                      ? 'Event is full'
                      : 'Click to RSVP and join other attendees'}
                  </p>
                </div>
                <Button
                  onClick={handleRsvp}
                  disabled={
                    rsvpLoading || 
                    (event.maxAttendees ? event.attendees >= event.maxAttendees : false) ||
                    (user && user.userType !== 'participant')
                  }
                  className={hasRsvpd 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : user && user.userType !== 'participant'
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'}
                  size="lg"
                >
                  {rsvpLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {hasRsvpd ? 'Cancelling...' : 'RSVPing...'}
                    </>
                  ) : hasRsvpd ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-white" />
                      Cancel RSVP
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2 text-white" />
                      RSVP
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Attendees List */}
          {user && (event.organizerId === user.uid || hasRsvpd) && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                Attendees ({event.attendees})
              </h2>
              {loadingAttendees ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : attendeesList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {attendeesList.map((attendee) => (
                    <div key={attendee.id} className="flex flex-col items-center gap-2">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={attendee.photo} alt={attendee.name} />
                        <AvatarFallback className="bg-primary/10 text-primary dark:text-blue-300 dark:bg-blue-900/30">
                          {attendee.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-center font-medium text-foreground line-clamp-2">
                        {attendee.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No attendees yet
                </p>
              )}
            </div>
          )}

          {/* Organizer */}
          {(event.organizer || event.organizerName) && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-3 text-foreground">Organized By</h2>
              <p className="text-base md:text-lg text-foreground font-medium">{event.organizerName || event.organizer}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 border border-border">
                  <Tag className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Category</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">{event.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 border border-border">
                  {getEventIcon()}
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Format</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">{event.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 border border-border">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">
                    {isPast ? 'Completed' : isFull ? 'Full' : 'Open'}
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

export default EventDetails;

