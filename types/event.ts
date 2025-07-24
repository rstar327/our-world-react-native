export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  generalArea: string;
  doorbell?: string;
}

export interface Attendee {
  id: string;
  firstName: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  firstName: string;
  age: number;
  hobbies: string;
  isVerified: boolean;
  requestDate: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface EventNotification {
  id: string;
  eventId: string;
  userId: string;
  type: 'reminder' | 'address_reveal' | 'host_update';
  message: string;
  scheduledFor: string;
  sent: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: Location;
  imageUrl: string;
  hostId: string;
  hostName: string;
  maxAttendees: number;
  currentAttendees: number;
  attendees: Attendee[];
  price: number;
  joinType?: 'open' | 'request';
  pendingRequests?: JoinRequest[];
  notifications?: EventNotification[];
  hostUpdates?: string[];
  allergens?: string[];
  veganOptions?: boolean;
  pets?: string;
}