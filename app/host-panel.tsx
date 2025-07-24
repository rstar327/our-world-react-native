import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import { useUser } from '@/hooks/use-user';
import { ArrowLeft, Edit, Check, X, Users, Calendar, Clock, Send, MessageSquare } from 'lucide-react-native';
import { Event, JoinRequest } from '@/types/event';

export default function HostPanelScreen() {
  const { user } = useUser();
  const { getHostedEvents, acceptJoinRequest, declineJoinRequest, sendHostUpdate } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showUpdateInput, setShowUpdateInput] = useState(false);
  
  const hostedEvents = getHostedEvents();

  const handleAcceptRequest = (eventId: string, requestId: string) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            acceptJoinRequest(eventId, requestId);
            Alert.alert('Request Accepted', 'The guest has been notified and added to your event.');
          },
        },
      ]
    );
  };

  const handleDeclineRequest = (eventId: string, requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this join request? The guest\'s ticket will be refunded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            declineJoinRequest(eventId, requestId);
            Alert.alert('Request Declined', 'The guest has been notified and their ticket refunded.');
          },
        },
      ]
    );
  };

  const handleEditEvent = (eventId: string) => {
    router.push({
      pathname: '/edit-event',
      params: { id: eventId }
    });
  };

  const handleSendUpdate = (eventId: string) => {
    if (!updateMessage.trim()) {
      Alert.alert('Empty Message', 'Please enter an update message');
      return;
    }

    sendHostUpdate(eventId, updateMessage);
    setUpdateMessage('');
    setShowUpdateInput(false);
  };

  const renderEventCard = (event: Event) => {
    const pendingRequests = event.pendingRequests?.filter(r => r.status === 'pending') || [];
    
    return (
      <TouchableOpacity 
        key={event.id}
        style={styles.eventCard}
        onPress={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
      >
        <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Calendar color="#666" size={16} />
              <Text style={styles.detailText}>{event.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock color="#666" size={16} />
              <Text style={styles.detailText}>{event.time}</Text>
            </View>
            <View style={styles.detailItem}>
              <Users color="#666" size={16} />
              <Text style={styles.detailText}>
                {event.currentAttendees}/{event.maxAttendees}
              </Text>
            </View>
          </View>
          
          {pendingRequests.length > 0 && (
            <View style={styles.requestsBadge}>
              <Text style={styles.requestsText}>
                {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditEvent(event.id)}
            >
              <Edit color="#8b5cf6" size={16} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.updateButton}
              onPress={() => {
                setSelectedEvent(event);
                setShowUpdateInput(true);
              }}
            >
              <MessageSquare color="#10b981" size={16} />
              <Text style={styles.updateButtonText}>Update Guests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderJoinRequests = (event: Event) => {
    const pendingRequests = event.pendingRequests?.filter(r => r.status === 'pending') || [];
    
    if (pendingRequests.length === 0) {
      return (
        <View style={styles.noRequestsContainer}>
          <Text style={styles.noRequestsText}>No pending requests</Text>
        </View>
      );
    }

    return (
      <View style={styles.requestsContainer}>
        <Text style={styles.requestsTitle}>Join Requests</Text>
        {pendingRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{request.firstName}</Text>
              <Text style={styles.requestDetails}>Age: {request.age}</Text>
              <Text style={styles.requestDetails}>Hobbies: {request.hobbies}</Text>
              <View style={styles.verificationBadge}>
                <Text style={[
                  styles.verificationText,
                  { color: request.isVerified ? '#10b981' : '#f59e0b' }
                ]}>
                  {request.isVerified ? '✓ ID Verified' : '⚠ Not Verified'}
                </Text>
              </View>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => handleAcceptRequest(event.id, request.id)}
              >
                <Check color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.declineButton}
                onPress={() => handleDeclineRequest(event.id, request.id)}
              >
                <X color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderUpdateInput = () => {
    if (!showUpdateInput || !selectedEvent) return null;

    return (
      <View style={styles.updateInputContainer}>
        <Text style={styles.updateInputTitle}>Send Update to Guests</Text>
        <TextInput
          style={styles.updateTextInput}
          value={updateMessage}
          onChangeText={setUpdateMessage}
          placeholder="Enter your message to guests..."
          multiline
          numberOfLines={3}
        />
        <View style={styles.updateInputActions}>
          <TouchableOpacity 
            style={styles.cancelUpdateButton}
            onPress={() => {
              setShowUpdateInput(false);
              setUpdateMessage('');
            }}
          >
            <Text style={styles.cancelUpdateText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sendUpdateButton}
            onPress={() => handleSendUpdate(selectedEvent.id)}
          >
            <Send color="#fff" size={16} />
            <Text style={styles.sendUpdateText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Please sign in to access host panel</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host Panel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hostedEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Events Yet</Text>
            <Text style={styles.emptyText}>
              You haven't created any events yet. Create your first event to start hosting!
            </Text>
            <TouchableOpacity 
              style={styles.createEventButton}
              onPress={() => router.push('/create-event')}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Events</Text>
            {hostedEvents.map(renderEventCard)}
            
            {selectedEvent && !showUpdateInput && (
              <View style={styles.selectedEventContainer}>
                {renderJoinRequests(selectedEvent)}
              </View>
            )}

            {renderUpdateInput()}
          </>
        )}
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  requestsBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  requestsText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  editButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  updateButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  selectedEventContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  requestsContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  requestDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  verificationBadge: {
    marginTop: 4,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#10b981',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRequestsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noRequestsText: {
    fontSize: 16,
    color: '#666',
  },
  updateInputContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  updateInputTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  updateTextInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  updateInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelUpdateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  cancelUpdateText: {
    color: '#666',
    fontSize: 16,
  },
  sendUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  sendUpdateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  createEventButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});