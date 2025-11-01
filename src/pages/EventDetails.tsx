import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Video,
  Building,
  Globe,
  Tag
} from 'lucide-react';

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
  organizer?: string;
  coverImage?: string;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventDoc = await getDoc(doc(db, 'events', id));
        
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEvent({
            id: eventDoc.id,
            title: data.title,
            description: data.description || '',
            date: data.date,
            time: data.time,
            location: data.location,
            type: data.type,
            attendees: data.attendees || 0,
            maxAttendees: data.maxAttendees,
            category: data.category,
            organizer: data.organizer,
            coverImage: data.coverImage,
          });
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
  }, [id]);

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
        return <Video className="h-5 w-5" />;
      case 'In-Person':
        return <Building className="h-5 w-5" />;
      case 'Hybrid':
        return <Globe className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate('/community?tab=events')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
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
                <Calendar className="h-24 w-24 md:h-32 md:w-32 text-primary/20" />
              </div>
            </div>
          )}

          {/* Header Card */}
          <div className="bg-card border rounded-xl p-6 md:p-8 -mt-20 md:-mt-24 relative z-10 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <div className="p-2 md:p-3 rounded-xl bg-primary/10 border border-primary/20 flex-shrink-0">
                    <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-foreground">{event.title}</h1>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-accent/50 border border-border text-xs md:text-sm font-medium text-foreground">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs md:text-sm font-medium">
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
                  <Calendar className="h-5 w-5 text-primary" />
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
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">{event.time}</p>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-semibold text-sm md:text-base text-foreground truncate">{event.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground">About This Event</h2>
            <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-3 text-foreground">Organized By</h2>
              <p className="text-base md:text-lg text-foreground font-medium">{event.organizer}</p>
            </div>
          )}

          {/* Event Details */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Event Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 border border-border">
                  <Tag className="h-5 w-5 text-primary" />
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
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Attendance</p>
                  <p className="font-semibold text-sm md:text-base text-foreground">
                    {event.attendees} / {event.maxAttendees || '∞'} people
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/50 border border-border">
                  <Calendar className="h-5 w-5 text-primary" />
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

