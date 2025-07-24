import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Event } from '@/types/event';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface WebMapViewProps {
  events: Event[];
  initialRegion: Region;
}

const WebMapView: React.FC<WebMapViewProps> = ({ events, initialRegion }) => {
  return (
    <View style={styles.webMapContainer}>
      <Text style={styles.webMapText}>
        Interactive Map
      </Text>
      <Text style={styles.webMapSubtext}>
        {events.length} events in your area
      </Text>
      <ScrollView style={styles.webEventsList} showsVerticalScrollIndicator={false}>
        {events.map((event) => (
          <TouchableOpacity 
            key={event.id}
            style={styles.webEventItem}
            onPress={() => router.push({
              pathname: '/event-details',
              params: { id: event.id }
            })}
          >
            <Text style={styles.webEventTitle}>{event.title}</Text>
            <Text style={styles.webEventLocation}>{event.location.generalArea}</Text>
            <Text style={styles.webEventDate}>{event.date} at {event.time}</Text>
            <Text style={styles.webEventAttendees}>
              {event.currentAttendees}/{event.maxAttendees} attendees
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    paddingTop: 120,
  },
  webMapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  webEventsList: {
    flex: 1,
  },
  webEventItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  webEventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  webEventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  webEventAttendees: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default WebMapView;