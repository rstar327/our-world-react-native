import { Event } from '@/types/event';

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Italian Pasta Night',
    description: 'Join us for a delicious homemade Italian pasta dinner with authentic recipes passed down through generations.',
    date: '2025-08-01',
    time: '19:00',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      generalArea: 'Downtown San Francisco',
      address: '123 Market Street, San Francisco, CA 94102'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    hostId: 'user-1',
    hostName: 'Maria',
    maxAttendees: 8,
    currentAttendees: 3,
    attendees: [
      { id: 'user-2', firstName: 'John' },
      { id: 'user-3', firstName: 'Sarah' },
      { id: 'user-4', firstName: 'Michael' }
    ],
    price: 10,
    joinType: 'open',
    pendingRequests: [],
    allergens: ['milk', 'eggs', 'wheat'],
    veganOptions: false,
    pets: 'cats'
  },
  {
    id: 'event-2',
    title: 'Taco Tuesday Fiesta',
    description: 'Experience authentic Mexican tacos with homemade salsas and traditional sides.',
    date: '2025-08-04',
    time: '18:30',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      generalArea: 'Mission District',
      address: '456 Mission Street, San Francisco, CA 94110'
    },
    imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    hostId: 'user-5',
    hostName: 'Carlos',
    maxAttendees: 6,
    currentAttendees: 2,
    attendees: [
      { id: 'user-6', firstName: 'Emma' },
      { id: 'user-7', firstName: 'David' }
    ],
    price: 10,
    joinType: 'request',
    pendingRequests: [
      {
        id: 'request-1',
        userId: 'user-8',
        firstName: 'Alex',
        age: 26,
        hobbies: 'Travel, Food, Music',
        isVerified: true,
        requestDate: '2025-07-20T10:00:00Z',
        status: 'pending'
      }
    ],
    allergens: ['milk', 'wheat'],
    veganOptions: true,
    pets: 'dogs'
  },
  {
    id: 'event-3',
    title: 'Sushi Making Workshop',
    description: 'Learn to make your own sushi rolls with fresh ingredients and expert guidance.',
    date: '2025-08-07',
    time: '19:00',
    location: {
      latitude: 37.7937,
      longitude: -122.3965,
      generalArea: 'North Beach',
      address: '789 Columbus Avenue, San Francisco, CA 94133'
    },
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    hostId: 'user-8',
    hostName: 'Yuki',
    maxAttendees: 4,
    currentAttendees: 1,
    attendees: [
      { id: 'user-9', firstName: 'Alex' }
    ],
    price: 10,
    joinType: 'open',
    pendingRequests: [],
    allergens: ['fish', 'soybeans'],
    veganOptions: false
  },
  {
    id: 'event-4',
    title: 'Southern BBQ Feast',
    description: 'Enjoy slow-cooked BBQ with all the traditional southern sides and homemade sauces.',
    date: '2025-08-10',
    time: '17:00',
    location: {
      latitude: 37.7694,
      longitude: -122.4862,
      generalArea: 'Sunset District',
      address: '321 Irving Street, San Francisco, CA 94122'
    },
    imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    hostId: 'user-10',
    hostName: 'Robert',
    maxAttendees: 10,
    currentAttendees: 4,
    attendees: [
      { id: 'user-11', firstName: 'Jessica' },
      { id: 'user-12', firstName: 'Daniel' },
      { id: 'user-13', firstName: 'Olivia' },
      { id: 'user-14', firstName: 'William' }
    ],
    price: 10,
    joinType: 'request',
    pendingRequests: [],
    allergens: ['milk'],
    veganOptions: false,
    pets: 'none'
  },
  {
    id: 'event-5',
    title: 'Vegan Food Festival',
    description: 'Sample a variety of plant-based dishes from around the world in this vegan food celebration.',
    date: '2025-08-15',
    time: '12:00',
    location: {
      latitude: 37.8025,
      longitude: -122.4351,
      generalArea: 'Russian Hill',
      address: '654 Lombard Street, San Francisco, CA 94109'
    },
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80',
    hostId: 'user-15',
    hostName: 'Sophia',
    maxAttendees: 12,
    currentAttendees: 5,
    attendees: [
      { id: 'user-16', firstName: 'Ethan' },
      { id: 'user-17', firstName: 'Ava' },
      { id: 'user-18', firstName: 'Noah' },
      { id: 'user-19', firstName: 'Isabella' },
      { id: 'user-20', firstName: 'Liam' }
    ],
    price: 10,
    joinType: 'open',
    pendingRequests: [],
    allergens: ['tree nuts', 'soybeans'],
    veganOptions: true,
    pets: 'cats and dogs'
  }
];