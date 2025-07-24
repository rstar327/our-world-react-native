import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useUser } from '@/hooks/use-user';
import { useEvents } from '@/hooks/use-events';
import { router } from 'expo-router';
import { Edit, User, Building, Phone, Mail, LogOut, Settings, Ticket } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  const { events, joinedEvents } = useEvents();
  
  const userJoinedEvents = events.filter(event => joinedEvents.includes(event.id));
  
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => signOut(),
        },
      ]
    );
  };
  
  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: '/event-details',
      params: { id: eventId }
    });
  };

  const handleHostPanel = () => {
    router.push('/host-panel');
  };
  
  if (!user) {
    return (
      <View style={styles.signInContainer} testID="sign-in-container">
        <Text style={styles.signInTitle}>Welcome to OurWorld</Text>
        <Text style={styles.signInText}>
          Join dinner events and create your own food experiences.
        </Text>
        <View style={styles.authButtons}>
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={() => router.push('/sign-in')}
            testID="sign-in-button"
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={() => router.push('/sign-up')}
            testID="sign-up-button"
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} testID="profile-screen">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          testID="edit-profile-button"
        >
          <Edit color="#000" size={20} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileSection}>
        <View style={styles.curvedBackground}>
          <View style={styles.profileImageContainer}>
            {user.profileImageUrl ? (
              <Image 
                source={{ uri: user.profileImageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User color="#fff" size={40} />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Tickets Section */}
      <View style={styles.ticketsSection}>
        <View style={styles.ticketsCard}>
          <View style={styles.ticketsHeader}>
            <Ticket color="#8b5cf6" size={24} />
            <Text style={styles.ticketsTitle}>Tickets</Text>
          </View>
          <Text style={styles.ticketsCount}>
            {user.ticketsRemaining} out of {user.maxTickets}
          </Text>
          <Text style={styles.ticketsSubtext}>
            Tickets reset monthly. Used for joining events and deposits for requests.
          </Text>
        </View>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.infoItem}>
          <User color="#000" size={20} />
          <Text style={styles.infoLabel}>Name: </Text>
          <Text style={styles.infoValue}>{user.firstName} {user.lastName}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Building color="#000" size={20} />
          <Text style={styles.infoLabel}>Occupation: </Text>
          <Text style={styles.infoValue}>Software Engineer</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Phone color="#000" size={20} />
          <Text style={styles.infoLabel}>Age: </Text>
          <Text style={styles.infoValue}>{user.age || 29}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Mail color="#000" size={20} />
          <Text style={styles.infoLabel}>Interests: </Text>
          <Text style={styles.infoValue}>{user.hobbies || 'gym, jgrg, guns, eating'}</Text>
        </View>
      </View>

      {/* Host Panel Button */}
      <TouchableOpacity 
        style={styles.hostPanelButton}
        onPress={handleHostPanel}
        testID="host-panel-button"
      >
        <Settings color="#8b5cf6" size={20} />
        <Text style={styles.hostPanelButtonText}>Host Panel</Text>
      </TouchableOpacity>
      
      <View style={styles.eventsSection}>
        <Text style={styles.sectionTitle}>Your Joined Events</Text>
        
        {userJoinedEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You haven't joined any events yet. Explore events and join one!
            </Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.back()}
              testID="explore-button"
            >
              <Text style={styles.exploreButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {userJoinedEvents.map(event => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => handleEventPress(event.id)}
                testID={`joined-event-${event.id}`}
              >
                <Image 
                  source={{ uri: event.imageUrl }} 
                  style={styles.eventImage} 
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={styles.eventDate}>
                    {event.date} at {event.time}
                  </Text>
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    {event.location.generalArea}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.signOutButton} 
        onPress={handleSignOut}
        testID="sign-out-button"
      >
        <LogOut color="#FF6B00" size={20} />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    padding: 5,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  curvedBackground: {
    width: 300,
    height: 150,
    backgroundColor: '#a7f3d0',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImageContainer: {
    position: 'absolute',
    bottom: -40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  ticketsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  ticketsCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  ticketsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  ticketsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 5,
  },
  ticketsSubtext: {
    fontSize: 14,
    color: '#666',
  },
  profileInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoLabel: {
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
  },
  hostPanelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9ff',
    borderWidth: 1,
    borderColor: '#8b5cf6',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  hostPanelButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  eventsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  eventsContainer: {
    marginBottom: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: 80,
    height: 80,
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  exploreButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#FF6B00',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 40,
  },
  signOutButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  signInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  authButtons: {
    width: '100%',
    gap: 15,
  },
  signInButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#8b5cf6',
    fontSize: 18,
    fontWeight: 'bold',
  },
});