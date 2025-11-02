import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { getCurrentUser } from '@/services/user';

/**
 * RSVP to an event
 */
export const rsvpToEvent = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user is a participant
    const currentUser = await getCurrentUser();
    // getCurrentUser returns User type which has userType property
    if (!currentUser || currentUser.userType !== 'participant') {
      toast.error('Only GenLink participant accounts can RSVP to events');
      return false;
    }
    
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventSnap.data();
    const attendeeIds = eventData.attendeeIds || [];
    
    // Check if already RSVP'd
    if (attendeeIds.includes(userId)) {
      toast.info('You have already RSVP\'d to this event');
      return false;
    }
    
    // Check if event is full
    if (eventData.maxAttendees && eventData.attendees >= eventData.maxAttendees) {
      toast.error('Event is full');
      return false;
    }
    
    // Check if event is past
    const eventDate = new Date(eventData.date);
    if (eventDate < new Date()) {
      toast.error('Cannot RSVP to past events');
      return false;
    }
    
    // Add user to attendees
    await updateDoc(eventRef, {
      attendeeIds: arrayUnion(userId),
      attendees: increment(1)
    });
    
    toast.success('Successfully RSVP\'d to event!');
    return true;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    toast.error('Failed to RSVP. Please try again.');
    return false;
  }
};

/**
 * Cancel RSVP to an event
 */
export const cancelRsvp = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new Error('Event not found');
    }
    
    const eventData = eventSnap.data();
    const attendeeIds = eventData.attendeeIds || [];
    
    // Check if not RSVP'd
    if (!attendeeIds.includes(userId)) {
      toast.info('You have not RSVP\'d to this event');
      return false;
    }
    
    // Remove user from attendees
    await updateDoc(eventRef, {
      attendeeIds: arrayRemove(userId),
      attendees: increment(-1)
    });
    
    toast.success('RSVP cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling RSVP:', error);
    toast.error('Failed to cancel RSVP. Please try again.');
    return false;
  }
};

/**
 * Get attendees list for an event
 */
export const getEventAttendees = async (eventId: string): Promise<string[]> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return [];
    }
    
    const eventData = eventSnap.data();
    return eventData.attendeeIds || [];
  } catch (error) {
    console.error('Error fetching attendees:', error);
    return [];
  }
};

/**
 * Check if user has RSVP'd to an event
 */
export const hasUserRsvpd = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    const attendeeIds = await getEventAttendees(eventId);
    return attendeeIds.includes(userId);
  } catch (error) {
    console.error('Error checking RSVP status:', error);
    return false;
  }
};

