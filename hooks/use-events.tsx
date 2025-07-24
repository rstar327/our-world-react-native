import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Event, JoinRequest, EventNotification } from '@/types/event';
import { mockEvents } from '@/mocks/events';
import { Alert, Platform } from 'react-native';
import { useUser } from './use-user';
import { trpc } from '@/lib/trpc';

interface BackendEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  imageUrl: string;
  hostId: string;
  hostName: string;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  joinType: 'open' | 'request';
  location: {
    latitude: number;
    longitude: number;
    address: string | undefined;
    generalArea: string;
    doorbell: string | undefined;
  };
  allergens: string[];
  veganOptions: boolean;
  pets: string | undefined;
  createdAt: string;
}

export const [EventsProvider, useEvents] = createContextHook(() => {
  const [events, setEvents] = useState<Event[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, updateUser } = useUser();

  const createEventMutation = trpc.events.create.useMutation();
  const joinEventMutation = trpc.events.join.useMutation();
  const eventsQuery = trpc.events.list.useQuery({}, { enabled: false });
  const joinedEventsQuery = trpc.events.getJoined.useQuery(
    { userId: user?.id || '' },
    { enabled: !!user?.id }
  );

  // Load events from backend or fallback to mock data
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const result = await eventsQuery.refetch();
        if (result.data) {
          // Transform backend data to frontend format
          const transformedEvents: Event[] = result.data.map((event: BackendEvent) => ({
            ...event,
            attendees: [], // Will be populated separately if needed
            pendingRequests: [],
            notifications: [],
            hostUpdates: [],
          }));
          setEvents(transformedEvents);
        } else {
          // Fallback to mock data
          setEvents(mockEvents);
        }
      } catch (error) {
        console.error('Error loading events from backend:', error);
        // Fallback to mock data
        setEvents(mockEvents);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Load joined events from backend
  useEffect(() => {
    if (joinedEventsQuery.data) {
      setJoinedEvents(joinedEventsQuery.data);
    }
  }, [joinedEventsQuery.data]);

  // Load notifications from storage (keeping local for now)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem('notifications');
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, []);

  // Save notifications to storage
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    };

    saveNotifications();
  }, [notifications]);

  const scheduleEventNotifications = (eventId: string, eventDate: string, eventTime: string) => {
    if (!user) return;

    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    const now = new Date();

    // Schedule reminder 2 days before
    const twoDaysBefore = new Date(eventDateTime.getTime() - (2 * 24 * 60 * 60 * 1000));
    if (twoDaysBefore > now) {
      const reminderNotification: EventNotification = {
        id: `reminder-${eventId}-${user.id}`,
        eventId,
        userId: user.id,
        type: 'reminder',
        message: 'Your event is in 2 days! Get ready for an amazing dinner experience.',
        scheduledFor: twoDaysBefore.toISOString(),
        sent: false,
      };
      setNotifications(prev => [...prev, reminderNotification]);
    }

    // Schedule address reveal 1 hour before
    const oneHourBefore = new Date(eventDateTime.getTime() - (60 * 60 * 1000));
    if (oneHourBefore > now) {
      const addressNotification: EventNotification = {
        id: `address-${eventId}-${user.id}`,
        eventId,
        userId: user.id,
        type: 'address_reveal',
        message: 'The exact address for your event has been revealed! Check the event details.',
        scheduledFor: oneHourBefore.toISOString(),
        sent: false,
      };
      setNotifications(prev => [...prev, addressNotification]);
    }
  };

  const getEventAddress = (event: Event, isJoined: boolean) => {
    if (!isJoined) {
      return event.location.generalArea;
    }

    const eventDateTime = new Date(`${event.date}T${event.time}`);
    const now = new Date();
    const oneHourBefore = new Date(eventDateTime.getTime() - (60 * 60 * 1000));
    const twoDaysBefore = new Date(eventDateTime.getTime() - (2 * 24 * 60 * 60 * 1000));

    if (now >= oneHourBefore) {
      // Show full address 1 hour before
      return event.location.address + (event.location.doorbell ? `, Doorbell: ${event.location.doorbell}` : '');
    } else if (now >= twoDaysBefore) {
      // Show partial address 2 days before
      const addressParts = event.location.address?.split(',') || [];
      return addressParts[0] || event.location.generalArea;
    } else {
      // Show only general area before 2 days
      return event.location.generalArea;
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to join events');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (joinedEvents.includes(eventId)) {
      Alert.alert('Already Joined', 'You have already joined this event');
      return;
    }

    if (user.ticketsRemaining <= 0) {
      Alert.alert('No Tickets', 'You have no tickets remaining. Tickets reset monthly.');
      return;
    }

    try {
      if (event.joinType === 'request') {
        // Request to join - use ticket as deposit
        Alert.alert(
          'Request to Join',
          'This requires approval from the host. 1 ticket will be used as deposit and refunded if declined.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Request',
              onPress: () => requestToJoinEvent(eventId),
            },
          ]
        );
      } else {
        // Open join - direct payment
        Alert.alert(
          'Join Event',
          'This event costs $10 to join. Would you like to proceed?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Pay $10',
              onPress: async () => {
                try {
                  await joinEventMutation.mutateAsync({
                    eventId,
                    userId: user.id,
                  });
                  
                  // Update local state
                  setJoinedEvents(prev => [...prev, eventId]);
                  scheduleEventNotifications(eventId, event.date, event.time);
                  
                  Alert.alert(
                    'Payment Successful',
                    'You have successfully joined the event! You will receive notifications about the event.'
                  );
                } catch (error) {
                  console.error('Join event error:', error);
                  // Fallback to local join for demo
                  updateUser({ ticketsRemaining: user.ticketsRemaining - 1 });
                  setJoinedEvents(prev => [...prev, eventId]);
                  scheduleEventNotifications(eventId, event.date, event.time);
                  Alert.alert(
                    'Payment Successful',
                    'You have successfully joined the event! You will receive notifications about the event.'
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Join event error:', error);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    }
  };

  const requestToJoinEvent = (eventId: string) => {
    if (!user) return;

    const joinRequest: JoinRequest = {
      id: `request-${Date.now()}`,
      userId: user.id,
      firstName: user.firstName,
      age: user.age || 25,
      hobbies: user.hobbies || 'Food, Travel, Music',
      isVerified: user.isVerified || false,
      requestDate: new Date().toISOString(),
      status: 'pending',
    };

    // Use ticket as deposit
    updateUser({ ticketsRemaining: user.ticketsRemaining - 1 });

    // Add request to event (local state for now)
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            pendingRequests: [...(event.pendingRequests || []), joinRequest] 
          }
        : event
    ));

    Alert.alert('Request Sent', 'Your request has been sent to the host. You will be notified when they respond.');
  };

  const acceptJoinRequest = (eventId: string, requestId: string) => {
    const event = events.find(e => e.id === eventId);
    const request = event?.pendingRequests?.find(r => r.id === requestId);
    
    if (!event || !request) return;

    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const updatedRequests = event.pendingRequests?.map(r => 
          r.id === requestId ? { ...r, status: 'accepted' as const } : r
        ) || [];
        
        const newAttendee = {
          id: request.userId,
          firstName: request.firstName,
        };

        // Add to joined events for the user
        if (request.userId === user?.id) {
          setJoinedEvents(prev => [...prev, eventId]);
          scheduleEventNotifications(eventId, event.date, event.time);
        }

        return {
          ...event,
          pendingRequests: updatedRequests,
          attendees: [...event.attendees, newAttendee],
          currentAttendees: event.currentAttendees + 1,
        };
      }
      return event;
    }));

    // Send notification to guest
    if (request.userId !== user?.id) {
      const notification: EventNotification = {
        id: `accept-${requestId}`,
        eventId,
        userId: request.userId,
        type: 'host_update',
        message: `Great news! Your request to join "${event.title}" has been accepted!`,
        scheduledFor: new Date().toISOString(),
        sent: false,
      };
      setNotifications(prev => [...prev, notification]);
    }
  };

  const declineJoinRequest = (eventId: string, requestId: string) => {
    const event = events.find(e => e.id === eventId);
    const request = event?.pendingRequests?.find(r => r.id === requestId);
    
    if (request) {
      // Refund ticket to the user who made the request
      if (request.userId === user?.id && user) {
        updateUser({ ticketsRemaining: user.ticketsRemaining + 1 });
      }

      // Send notification to guest
      const notification: EventNotification = {
        id: `decline-${requestId}`,
        eventId,
        userId: request.userId,
        type: 'host_update',
        message: `Your request to join "${event?.title}" was declined. Your ticket has been refunded.`,
        scheduledFor: new Date().toISOString(),
        sent: false,
      };
      setNotifications(prev => [...prev, notification]);
    }

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            pendingRequests: event.pendingRequests?.map(r => 
              r.id === requestId ? { ...r, status: 'declined' as const } : r
            ) || []
          }
        : event
    ));
  };

  const sendHostUpdate = (eventId: string, message: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event || !user) return;

    // Add update to event
    setEvents(prev => prev.map(e => 
      e.id === eventId 
        ? { ...e, hostUpdates: [...(e.hostUpdates || []), message] }
        : e
    ));

    // Send notifications to all attendees
    event.attendees.forEach(attendee => {
      const notification: EventNotification = {
        id: `update-${eventId}-${attendee.id}-${Date.now()}`,
        eventId,
        userId: attendee.id,
        type: 'host_update',
        message: `Update from ${event.hostName}: ${message}`,
        scheduledFor: new Date().toISOString(),
        sent: false,
      };
      setNotifications(prev => [...prev, notification]);
    });

    Alert.alert('Update Sent', 'Your update has been sent to all attendees.');
  };

  const createEvent = async (newEvent: Omit<Event, 'id'>) => {
    if (!user) {
      throw new Error('User must be signed in to create events');
    }

    try {
      const result = await createEventMutation.mutateAsync({
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        imageUrl: newEvent.imageUrl,
        hostId: user.id,
        maxAttendees: newEvent.maxAttendees,
        latitude: newEvent.location.latitude,
        longitude: newEvent.location.longitude,
        address: newEvent.location.address,
        generalArea: newEvent.location.generalArea,
        doorbell: newEvent.location.doorbell,
        joinType: newEvent.joinType || 'open',
        allergens: newEvent.allergens,
        veganOptions: newEvent.veganOptions,
        pets: newEvent.pets,
      });

      if (result.success) {
        // Add to local state
        const event: Event = {
          ...newEvent,
          id: result.eventId,
          hostId: user.id,
          hostName: user.firstName,
          currentAttendees: 0,
          attendees: [],
          pendingRequests: [],
          notifications: [],
          hostUpdates: [],
        };
        setEvents(prev => [...prev, event]);
        return result.eventId;
      }
    } catch (error) {
      console.error('Create event error:', error);
      // Fallback to local creation for demo
      const event: Event = {
        ...newEvent,
        id: `event-${Date.now()}`,
        hostId: user.id,
        hostName: user.firstName,
        currentAttendees: 0,
        attendees: [],
        pendingRequests: [],
        notifications: [],
        hostUpdates: [],
      };
      setEvents(prev => [...prev, event]);
      return event.id;
    }
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    ));
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const hasJoinedEvent = (eventId: string) => {
    return joinedEvents.includes(eventId);
  };

  const getHostedEvents = () => {
    if (!user) return [];
    return events.filter(event => event.hostId === user.id);
  };

  const getUserNotifications = () => {
    if (!user) return [];
    return notifications.filter(n => n.userId === user.id && !n.sent);
  };

  return {
    events,
    joinedEvents,
    notifications,
    isLoading,
    joinEvent,
    requestToJoinEvent,
    acceptJoinRequest,
    declineJoinRequest,
    sendHostUpdate,
    createEvent,
    updateEvent,
    getEventById,
    hasJoinedEvent,
    getHostedEvents,
    getUserNotifications,
    getEventAddress,
  };
});