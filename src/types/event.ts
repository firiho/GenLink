export interface Event {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  location: string;
  locationDetails?: string;
  date: string; // ISO date string
  time: string;
  type: 'In-Person' | 'Online' | 'Hybrid';
  category?: string;
  organizerName: string;
  organizationId: string;
  organizerId: string;
  organizerInfo?: {
    name: string;
    email?: string;
    photo?: string;
  };
  teamId?: string; // Optional - if created by a team
  maxAttendees?: number;
  attendees: number;
  attendeeIds?: string[]; // List of user IDs who RSVP'd
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'cancelled';
  visibility: 'public' | 'unlisted'; // public: shown on community, unlisted: only via direct link
  coordinates?: {
    lat: number;
    lng: number;
  }; // Optional coordinates for map integration
}

export interface CreateEventData {
  title: string;
  description: string;
  thumbnail?: string;
  location: string;
  locationDetails?: string;
  organizerId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  attendees: string[];
  status: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Online' | 'Hybrid';
  category?: string;
  organizerName: string;
  maxAttendees?: number;
  visibility: 'public' | 'unlisted';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

