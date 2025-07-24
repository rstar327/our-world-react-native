import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import { Event } from '@/types/event';
import { Calendar, Clock, Users, MapPin, Bell } from 'lucide-react-native';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEventById, joinEvent, hasJoinedEvent, getEventAddress } = useEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [joined, setJoined] = useState(false);
  
  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      if (eventData) {
        setEvent(eventData);
        setJoined(hasJoinedEvent(id));
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    }
  }, [id, getEventById, hasJoinedEvent]);
  
  const handleJoinEvent = () => {
    if (event) {
      joinEvent(event.id);
      setJoined(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const getSimpleAddress = (address?: string, generalArea?: string) => {
    if (!address) return generalArea || '';
    
    // Extract road name and post code, exclude apartment details
    const parts = address.split(',').map(part => part.trim());
    const roadName = parts[0] || '';
    const postCode = parts[parts.length - 1] || '';
    
    return `${roadName}, ${postCode}`;
  };
  
  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading event details...</Text>
      </View>
    );
  }

  const eventAddress = getEventAddress(event, joined);
  const eventDateTime = new Date(`${event.date}T${event.time}`);
  const now = new Date();
  const oneHourBefore = new Date(eventDateTime.getTime() - (60 * 60 * 1000));
  const twoDaysBefore = new Date(eventDateTime.getTime() - (2 * 24 * 60 * 60 * 1000));
  
  return (
    <ScrollView style={styles.container} testID="event-details-screen">
      <Image 
        source={{ uri: event.imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.hostSection}>
          <Text style={styles.host}>Host: {event.hostName}</Text>
          <Text style={styles.eventsHosted}>1 events hosted</Text>
        </View>

        {/* Attendees section */}
        <View style={styles.attendeesSection}>
          <Text style={styles.sectionTitle}>Attendees</Text>
          <View style={styles.attendeesContainer}>
            {event.attendees.map((attendee) => (
              <View key={attendee.id} style={styles.attendeeItem}>
                <Text style={styles.attendeeName}>{attendee.firstName}</Text>
              </View>
            ))}
            
            {joined && (
              <View style={styles.attendeeItem}>
                <Text style={styles.attendeeName}>You</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* About section - directly after attendees */}
        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.divider} />
        
        {/* Info icons section */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Calendar color="#FF6B00" size={20} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock color="#FF6B00" size={20} />
            <Text style={styles.infoText}>{event.time}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Users color="#FF6B00" size={20} />
            <Text style={styles.infoText}>
              {event.currentAttendees}/{event.maxAttendees} attendees
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin color="#FF6B00" size={20} />
            <Text style={styles.infoText}>
              {joined ? eventAddress : getSimpleAddress(event.location.address, event.location.generalArea)}
            </Text>
          </View>
        </View>

        {/* Food Will Have section */}
        {event.allergens && event.allergens.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Food Will Have</Text>
            <View style={styles.allergensContainer}>
              {event.allergens.map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Pets section */}
        {event.pets && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Pets in House</Text>
            <Text style={styles.petsText}>{event.pets}</Text>
          </>
        )}

        {joined && (
          <View style={styles.addressNotice}>
            <Bell color="#0369a1" size={20} />
            <View style={styles.addressNoticeText}>
              {now >= oneHourBefore ? (
                <Text style={styles.addressNoticeTitle}>Full address revealed!</Text>
              ) : now >= twoDaysBefore ? (
                <Text style={styles.addressNoticeTitle}>Partial address revealed</Text>
              ) : (
                <Text style={styles.addressNoticeTitle}>Address will be revealed</Text>
              )}
              <Text style={styles.addressNoticeSubtext}>
                {now >= oneHourBefore 
                  ? 'The event is starting soon!'
                  : now >= twoDaysBefore 
                    ? 'Full address will be revealed 1 hour before the event'
                    : 'Address will be revealed 2 days before the event'
                }
              </Text>
            </View>
          </View>
        )}

        {event.hostUpdates && event.hostUpdates.length > 0 && joined && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Host Updates</Text>
            {event.hostUpdates.map((update, index) => (
              <View key={index} style={styles.updateItem}>
                <Text style={styles.updateText}>{update}</Text>
              </View>
            ))}
          </>
        )}
        
        {!joined && (
          <TouchableOpacity 
            style={styles.joinButton} 
            onPress={handleJoinEvent}
            testID="join-event-button"
          >
            <Text style={styles.joinButtonText}>
              {event.joinType === 'request' ? 'Request to Join' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        )}
        
        {joined && (
          <View style={styles.joinedContainer}>
            <Text style={styles.joinedText}>
              You've joined this event! You will receive notifications about updates and address reveals.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  host: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  eventsHosted: {
    fontSize: 14,
    color: '#666',
  },
  attendeesSection: {
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  addressNotice: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  addressNoticeText: {
    marginLeft: 10,
    flex: 1,
  },
  addressNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  addressNoticeSubtext: {
    fontSize: 14,
    color: '#0369a1',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  attendeesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attendeeItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
  },
  attendeeName: {
    fontSize: 14,
    color: '#555',
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  allergenTag: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 2,
  },
  allergenText: {
    fontSize: 12,
    color: '#92400e',
  },
  petsText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  updateItem: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  updateText: {
    fontSize: 14,
    color: '#065f46',
  },
  joinButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  joinedContainer: {
    backgroundColor: '#e6f7e6',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  joinedText: {
    color: '#2e7d32',
    fontSize: 16,
  },
});