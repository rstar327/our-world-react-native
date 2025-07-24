import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Event } from '@/types/event';
import { useEvents } from '@/hooks/use-events';

// Conditionally import Marker only on native platforms
let Marker: any = null;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    Marker = Maps.Marker;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

type EventMarkerProps = {
  event: Event;
  testID?: string;
};

const EventMarker: React.FC<EventMarkerProps> = ({ event, testID }) => {
  const { joinEvent } = useEvents();

  const handlePress = () => {
    router.push({
      pathname: '/event-details',
      params: { id: event.id }
    });
  };

  const handleJoin = (e: any) => {
    e.stopPropagation();
    joinEvent(event.id);
  };

  // Return null on web since we don't render markers there
  if (Platform.OS === 'web' || !Marker) {
    return null;
  }

  return (
    <Marker
      coordinate={{
        latitude: event.location.latitude,
        longitude: event.location.longitude,
      }}
      onPress={handlePress}
      tracksViewChanges={false}
      testID={testID}
    >
      <View style={styles.markerContainer}>
        {/* Flag banner with food image */}
        <View style={styles.flagBanner}>
          <Image 
            source={{ uri: event.imageUrl }} 
            style={styles.foodImage} 
            resizeMode="cover"
          />
        </View>
        
        {/* V-shaped pin */}
        <View style={styles.pinContainer}>
          <View style={styles.pinV}>
            <View style={styles.pinLeft} />
            <View style={styles.pinRight} />
          </View>
        </View>
        
        {/* Join button */}
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={handleJoin}
          testID={`join-button-${event.id}`}
        >
          <Text style={styles.joinText}>Join</Text>
        </TouchableOpacity>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    width: 100,
    height: 130,
  },
  flagBanner: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  pinContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    marginTop: -5,
  },
  pinV: {
    flexDirection: 'row',
    height: 30,
    width: 30,
  },
  pinLeft: {
    width: 15,
    height: 30,
    backgroundColor: '#FF6B00',
    transform: [{ skewX: '30deg' }],
  },
  pinRight: {
    width: 15,
    height: 30,
    backgroundColor: '#FF6B00',
    transform: [{ skewX: '-30deg' }],
  },
  joinButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default EventMarker;