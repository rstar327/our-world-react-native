import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Plus, Menu, Search, Globe, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import EventMarker from '@/components/EventMarker';
import WebMapView from '@/components/WebMapView';
import { trpc } from '@/lib/trpc';

// Conditionally import MapView only on native platforms
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const mapRef = useRef<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { events } = useEvents();
  
  // Test backend connection
  const testBackend = async () => {
    try {
      const result = await trpc.example.hi.useQuery();
      console.log('Backend test result:', result.data);
      if (result.data) {
        alert(`Backend Status: ${result.data.supabase}\nEnvironment: ${JSON.stringify(result.data.environment, null, 2)}`);
      }
    } catch (error) {
      console.error('Backend test failed:', error);
      alert(`Backend test failed: ${error}`);
    }
  };
  
  const initialRegion: Region = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'web') {
        // For web, use a mock location
        setLocation({
          coords: {
            latitude: 37.7749,
            longitude: -122.4194,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        console.log('Current location:', currentLocation);
        setLocation(currentLocation);
        
        if (mapRef.current && currentLocation && MapView) {
          mapRef.current.animateToRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get current location');
      }
    })();
  }, []);

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleOpenCreateEvent = () => {
    router.push('/create-event');
  };

  const handleOpenSearch = () => {
    router.push('/search');
  };

  const handleOpenProfile = () => {
    router.push('/profile');
  };

  const renderNativeMap = () => {
    if (!MapView) {
      return (
        <View style={styles.webMapContainer}>
          <Text style={styles.webMapText}>Map not available</Text>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={true}
        zoomEnabled={true}
        customMapStyle={mapStyle}
        testID="google-map"
      >
        {events.map((event) => (
          <EventMarker 
            key={event.id} 
            event={event} 
            testID={`event-marker-${event.id}`}
          />
        ))}
      </MapView>
    );
  };

  return (
    <View style={styles.container} testID="map-screen">
      {errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <>
          {Platform.OS === 'web' ? (
            <WebMapView events={events} initialRegion={initialRegion} />
          ) : (
            renderNativeMap()
          )}

          {/* Top Header Buttons */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={handleOpenSettings}
              testID="menu-button"
            >
              <Menu color="#000" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={handleOpenCreateEvent}
              testID="create-button"
            >
              <Plus color="#000" size={24} />
            </TouchableOpacity>
          </View>

          {/* Bottom Navigation */}
          <View style={styles.bottomNavContainer}>
            <View style={styles.bottomNav}>
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={handleOpenSearch}
                testID="search-button"
              >
                <Search color="#000" size={28} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navButton, styles.activeNavButton]} 
                testID="globe-button"
              >
                <Globe color="#000" size={28} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={handleOpenProfile}
                testID="profile-button"
              >
                <User color="#000" size={28} />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  menuButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    padding: 8,
  },
  activeNavButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 12,
  },
});

const mapStyle = [
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
];