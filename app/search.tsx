import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import { Search } from 'lucide-react-native';
import { Event } from '@/types/event';

export default function SearchScreen() {
  const { events } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.generalArea.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/event-details',
      params: { id: eventId }
    });
  };
  
  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={() => handleEventPress(item.id)}
      testID={`event-item-${item.id}`}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
      
      <View style={styles.eventInfo}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.distanceText}>1.2 miles away</Text>
        </View>
        
        <View style={styles.hostInfo}>
          <Text style={styles.hostText}>Host: {item.hostName}</Text>
        </View>
        <Text style={styles.eventsHosted}>1 events hosted</Text>
        <Text style={styles.veganInfo}>no vegan options BYO</Text>
        <Text style={styles.attendeesInfo}>{item.currentAttendees}/{item.maxAttendees} attendees</Text>
        
        <Text style={styles.foodDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container} testID="search-screen">
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="What dinner type"
            testID="search-input"
          />
        </View>
      </View>
      
      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No events found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          testID="events-list"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  eventsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    padding: 16,
  },
  eventImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  hostInfo: {
    marginBottom: 2,
  },
  hostText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  eventsHosted: {
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  veganInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  attendeesInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});