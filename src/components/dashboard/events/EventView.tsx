import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Clock, MapPin, ExternalLink, Lock, Globe, Users, Video, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Event } from '@/types/event';
import { useNavigate } from 'react-router-dom';

interface EventViewProps {
  eventId: string;
  onBack: () => void;
  setActiveView: (view: string, data?: any) => void;
}

export default function EventView({ eventId, onBack, setActiveView }: EventViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeesList, setAttendeesList] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        onBack();
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching event:', eventId);
        // Fetch event
        const eventRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (!eventSnap.exists()) {
          toast.error('Event not found');
          onBack();
          return;
        }

        const eventData = eventSnap.data();
        
        const eventObj = {
          id: eventSnap.id,
          ...eventData,
          createdAt: eventData.createdAt?.toDate ? eventData.createdAt.toDate() : new Date(eventData.createdAt),
          updatedAt: eventData.updatedAt?.toDate ? eventData.updatedAt.toDate() : new Date(eventData.updatedAt),
        } as Event;
        setEvent(eventObj);
        
        // Load attendees if user is organizer
        if (user && eventData.organizerId === user.uid && eventData.attendeeIds && Array.isArray(eventData.attendeeIds)) {
          loadAttendees(eventData.attendeeIds);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Error loading event');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user, onBack]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center max-w-7xl">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Event not found</p>
        <Button onClick={onBack} variant="outline">Back to Events</Button>
      </div>
    );
  }

  const isOwner = event.organizerId === user?.uid;
  const canEdit = isOwner;
  const eventDate = new Date(event.date);
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
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-3" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('edit-event', event.id)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-3 break-words">
                    {event.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge variant="outline" className={`${event.type === 'In-Person' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' : event.type === 'Online' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300'}`}>
                      {getEventIcon()}
                      <span className="ml-1">{event.type}</span>
                    </Badge>
                    {event.category && (
                      <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {event.category}
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={
                        event.visibility === 'unlisted' 
                          ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' 
                          : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }
                    >
                      {event.visibility === 'unlisted' ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Unlisted
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      )}
                    </Badge>
                    {isPast && (
                      <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
                        Past Event
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Thumbnail */}
          {event.thumbnail && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-0">
                <img 
                  src={event.thumbnail} 
                  alt={event.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Event Details */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-semibold text-sm md:text-base">
                      {eventDate.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="font-semibold text-sm md:text-base">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold text-sm md:text-base">{event.location}</p>
                    {event.locationDetails && (
                      <p className="text-sm text-muted-foreground mt-1">{event.locationDetails}</p>
                    )}
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                      <p className="font-semibold text-sm md:text-base">
                        {event.attendees} / {event.maxAttendees} attendees
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendees List - Only show for organizer */}
          {isOwner && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Attendees ({event.attendees})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAttendees ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : attendeesList.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {attendeesList.map((attendee) => (
                      <div key={attendee.id} className="flex flex-col items-center gap-2">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={attendee.photo} alt={attendee.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {attendee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-center font-medium text-slate-900 dark:text-white line-clamp-2">
                          {attendee.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                    No attendees yet
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview Link */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/e/${event.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Public View
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-xl">Event Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Organizer
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {event.organizerName}
                </p>
              </div>

              <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Created
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {event.createdAt?.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) || 'Unknown'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {event.updatedAt?.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) || 'Unknown'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  Status
                </p>
                <Badge 
                  variant="outline"
                  className={
                    event.status === 'published' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                      : event.status === 'draft'
                      ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                  }
                >
                  {event.status === 'published' ? 'Published' : event.status === 'draft' ? 'Draft' : 'Cancelled'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

