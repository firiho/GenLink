import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreateEventData } from '@/types/event';

interface CreateEventProps {
  eventId?: string; // If provided, we're editing
  onBack: () => void;
  setActiveView: (view: string, data?: any) => void;
}

export default function CreateEvent({ eventId, onBack, setActiveView }: CreateEventProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(!!eventId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [location, setLocation] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'In-Person' | 'Online' | 'Hybrid'>('In-Person');
  const [category, setCategory] = useState('');
  const [maxAttendees, setMaxAttendees] = useState<number | undefined>(undefined);
  const [visibility, setVisibility] = useState<'public' | 'unlisted'>('public');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // If editing, fetch the existing event
      if (eventId) {
        try {
          setFetchingEvent(true);
          const eventRef = doc(db, 'events', eventId);
          const eventSnap = await getDoc(eventRef);
          
          if (eventSnap.exists()) {
            const eventData = eventSnap.data();
            setTitle(eventData.title || '');
            setDescription(eventData.description || '');
            setThumbnail(eventData.thumbnail || '');
            setLocation(eventData.location || '');
            setLocationDetails(eventData.locationDetails || '');
            setDate(eventData.date || '');
            setTime(eventData.time || '');
            setType(eventData.type || 'In-Person');
            setCategory(eventData.category || '');
            setMaxAttendees(eventData.maxAttendees);
            setVisibility(eventData.visibility || 'public');
          } else {
            toast.error('Event not found');
            onBack();
          }
        } catch (error) {
          console.error('Error fetching event:', error);
          toast.error('Error loading event');
          onBack();
        } finally {
          setFetchingEvent(false);
        }
      }
    };

    fetchData();
  }, [user, eventId, onBack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to create events');
      return;
    }

    if (!title.trim() || !description.trim() || !location.trim() || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Get organizer name from user profile
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      const organizerName = profileSnap.exists() 
        ? `${profileSnap.data().firstName || ''} ${profileSnap.data().lastName || ''}`.trim() || user.email || 'Organizer'
        : user.email || 'Organizer';

      if (eventId) {
        // Update existing event
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          title: title.trim(),
          description: description.trim(),
          thumbnail: thumbnail.trim() || null,
          location: location.trim(),
          locationDetails: locationDetails.trim() || null,
          date: date.trim(),
          time: time.trim(),
          type: type,
          category: category.trim() || null,
          maxAttendees: maxAttendees || null,
          visibility: visibility,
          updatedAt: new Date()
        });

        toast.success('Event updated successfully!');
        setActiveView('event', eventId);
      } else {
        // Create new event
        const eventData: CreateEventData & { organizerId: string; organizerName: string; status: string; attendees: number; createdAt: Date; updatedAt: Date } = {
          title: title.trim(),
          description: description.trim(),
          thumbnail: thumbnail.trim() || undefined,
          location: location.trim(),
          locationDetails: locationDetails.trim() || undefined,
          date: date.trim(),
          time: time.trim(),
          type: type,
          category: category.trim() || undefined,
          organizerName: organizerName,
          organizerId: user.uid,
          maxAttendees: maxAttendees || undefined,
          visibility: visibility,
          status: 'published',
          attendees: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'events'), eventData);

        toast.success('Event created successfully!');
        setActiveView('event', docRef.id);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error creating event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-3" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Events
      </Button>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {eventId ? 'Edit Event' : 'Create New Event'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingEvent ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading event...
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
                Event Title <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="Tech Conference 2025"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="Describe your event..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="thumbnail" className="text-slate-700 dark:text-slate-300">
                Thumbnail Image URL
              </Label>
              <Input 
                id="thumbnail"
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Optional: Add a cover image for your event
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-slate-700 dark:text-slate-300">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-slate-700 dark:text-slate-300">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type" className="text-slate-700 dark:text-slate-300">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as 'In-Person' | 'Online' | 'Hybrid')}
                required
                className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder={type === 'Online' ? 'Virtual Event' : 'Kigali Convention Centre'}
              />
              {type !== 'Online' && (
                <Textarea
                  id="locationDetails"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="mt-2 resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                  placeholder="Additional location details (address, room number, etc.)"
                  rows={2}
                />
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
                Category
              </Label>
              <Input 
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="Technology, Networking, Workshop, etc."
              />
            </div>

            <div>
              <Label htmlFor="maxAttendees" className="text-slate-700 dark:text-slate-300">
                Max Attendees (Optional)
              </Label>
              <Input 
                id="maxAttendees"
                type="number"
                value={maxAttendees || ''}
                onChange={(e) => setMaxAttendees(e.target.value ? parseInt(e.target.value) : undefined)}
                min="1"
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Leave empty for unlimited attendees
              </p>
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2 block">
                Visibility
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    visibility === 'public'
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold mb-1">Public</div>
                    <div className="text-xs opacity-80">
                      Visible on community page and to everyone
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('unlisted')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    visibility === 'unlisted'
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold mb-1">Unlisted</div>
                    <div className="text-xs opacity-80">
                      Accessible via direct link only, not shown on community page
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {visibility === 'public' 
                  ? 'This event will be visible on the community events page and accessible to everyone.' 
                  : 'This event can be accessed via direct link but will not appear on the community events page.'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim() || !description.trim() || !location.trim() || !date || !time}
                className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-slate-100 dark:border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></span>
                    {eventId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {eventId ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

