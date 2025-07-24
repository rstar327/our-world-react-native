import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import { useUser } from '@/hooks/use-user';
import { MapPin, Calendar, Clock, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

const getNext7Days = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    
    days.push({
      date: date.toISOString().split('T')[0],
      display: `${dayName} ${dayNumber} ${monthName}`,
      isToday: i === 0
    });
  }
  
  return days;
};

const allergenOptions = [
  'milk', 'eggs', 'fish', 'crustacean shellfish', 
  'tree nuts', 'peanuts', 'wheat', 'soybeans'
];

export default function CreateEventScreen() {
  const { createEvent } = useEvents();
  const { user } = useUser();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState('');
  const [time, setTime] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [postCode, setPostCode] = useState('');
  const [doorbell, setDoorbell] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [veganOptions, setVeganOptions] = useState(false);
  const [pets, setPets] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [joinType, setJoinType] = useState<'open' | 'request'>('open');
  
  const next7Days = getNext7Days();
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select an image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };
  
  const handleGetLocation = async () => {
    if (Platform.OS === 'web') {
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
      Alert.alert('Permission Required', 'Please allow access to your location to set the event location.');
      return;
    }
    
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
    }
  };

  const handleDateSelect = (date: string, display: string) => {
    setSelectedDate(date);
    setSelectedDateDisplay(display);
    setShowDatePicker(false);
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const formatTime = (input: string) => {
    // Remove any non-digit characters
    const digits = input.replace(/\D/g, '');
    
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };

  const handleTimeChange = (text: string) => {
    const formatted = formatTime(text);
    setTime(formatted);
  };
  
  const handleCreateEvent = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to create events');
      return;
    }
    
    if (!title || !description || !selectedDate || !time || !maxAttendees || !imageUrl || !address) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 16:20)');
      return;
    }
    
    const newEvent = {
      title,
      description,
      date: selectedDate,
      time,
      location: {
        latitude: location?.coords.latitude || 37.7749,
        longitude: location?.coords.longitude || -122.4194,
        address: `${address}, ${floor ? `Floor ${floor}, ` : ''}${apartment ? `Apt ${apartment}, ` : ''}${postCode}`,
        generalArea: address.split(',')[0]?.trim() || 'Unknown Area',
        doorbell,
      },
      imageUrl,
      hostId: user.id,
      hostName: user.firstName,
      maxAttendees: parseInt(maxAttendees, 10),
      currentAttendees: 0,
      attendees: [],
      price: 10,
      joinType,
      pendingRequests: [],
      allergens: selectedAllergens,
      veganOptions,
      pets: pets || undefined,
    };
    
    const eventId = createEvent(newEvent);
    Alert.alert('Success', 'Your event has been created successfully!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Event</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X color="#666" size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>What will you cook for your guests?</Text>
        <Text style={styles.subtitleSmall}>*transparent text ill cook... bring your own food</Text>
        
        {/* Food Image */}
        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={handlePickImage}
          testID="image-picker-button"
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.foodImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Tap to add food image</Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Event Name */}
        <View style={styles.inputGroup}>
          <Calendar color="#666" size={20} />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Event name goes here"
            testID="title-input"
          />
        </View>
        
        {/* Event Date */}
        <TouchableOpacity 
          style={styles.inputGroup} 
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Calendar color="#666" size={20} />
          <Text style={[styles.input, { color: selectedDateDisplay ? '#000' : '#999' }]}>
            {selectedDateDisplay || 'Select Event Date'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            {next7Days.map((day) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.dateOption,
                  selectedDate === day.date && styles.selectedDateOption
                ]}
                onPress={() => handleDateSelect(day.date, day.display)}
              >
                <Text style={[
                  styles.dateOptionText,
                  selectedDate === day.date && styles.selectedDateOptionText
                ]}>
                  {day.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Event Time */}
        <View style={styles.inputGroup}>
          <Clock color="#666" size={20} />
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={handleTimeChange}
            placeholder="Start time (e.g., 16:20)"
            keyboardType="numeric"
            maxLength={5}
            testID="time-input"
          />
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyText}>
            🔒 Addresses are only displayed 1 hour before the event starts
          </Text>
        </View>
        
        {/* Address */}
        <View style={styles.inputGroup}>
          <MapPin color="#666" size={20} />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            testID="address-input"
          />
        </View>
        
        {/* Floor and Apartment */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={floor}
            onChangeText={setFloor}
            placeholder="Floor"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={apartment}
            onChangeText={setApartment}
            placeholder="Apartment"
          />
        </View>
        
        {/* Post code and Doorbell */}
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={postCode}
            onChangeText={setPostCode}
            placeholder="Post code"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={doorbell}
            onChangeText={setDoorbell}
            placeholder="Number on doorbell"
          />
        </View>

        {/* Max Attendees */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            value={maxAttendees}
            onChangeText={setMaxAttendees}
            placeholder="Maximum attendees (4-12)"
            keyboardType="numeric"
            testID="max-attendees-input"
          />
        </View>

        {/* Join Type Toggle */}
        <Text style={styles.sectionTitle}>Join Type</Text>
        <View style={styles.joinTypeContainer}>
          <TouchableOpacity 
            style={[styles.joinTypeOption, joinType === 'open' && styles.selectedJoinType]}
            onPress={() => setJoinType('open')}
          >
            <Text style={[styles.joinTypeText, joinType === 'open' && styles.selectedJoinTypeText]}>
              Open Join
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.joinTypeOption, joinType === 'request' && styles.selectedJoinType]}
            onPress={() => setJoinType('request')}
          >
            <Text style={[styles.joinTypeText, joinType === 'request' && styles.selectedJoinTypeText]}>
              Request to Join
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Food will have */}
        <Text style={styles.sectionTitle}>Food will have</Text>
        <View style={styles.allergenGrid}>
          {allergenOptions.map((allergen) => (
            <TouchableOpacity
              key={allergen}
              style={[
                styles.allergenBox,
                selectedAllergens.includes(allergen) && styles.selectedAllergenBox
              ]}
              onPress={() => toggleAllergen(allergen)}
            >
              <Text style={[
                styles.allergenBoxText,
                selectedAllergens.includes(allergen) && styles.selectedAllergenBoxText
              ]}>
                {allergen}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Vegan options */}
        <Text style={styles.sectionTitle}>Vegan options</Text>
        <View style={styles.veganOptions}>
          <TouchableOpacity 
            style={styles.veganOption}
            onPress={() => setVeganOptions(true)}
          >
            <View style={[styles.radio, veganOptions && styles.radioSelected]} />
            <Text style={styles.veganText}>Included</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.veganOption}
            onPress={() => setVeganOptions(false)}
          >
            <View style={[styles.radio, !veganOptions && styles.radioSelected]} />
            <Text style={styles.veganText}>BYO</Text>
          </TouchableOpacity>
        </View>

        {/* Pets in house */}
        <Text style={styles.sectionTitle}>Are there any pets in house?</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, { marginLeft: 0 }]}
            value={pets}
            onChangeText={setPets}
            placeholder="e.g., cats, dogs, other pets"
            testID="pets-input"
          />
        </View>
        
        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateEvent}
            testID="create-button"
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 5,
    color: '#000',
  },
  subtitleSmall: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 15,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#000',
  },
  privacyNotice: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  privacyText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  datePickerContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  dateOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  selectedDateOption: {
    backgroundColor: '#8b5cf6',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDateOptionText: {
    color: '#fff',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    flex: 0.48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginLeft: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#000',
  },
  joinTypeContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  joinTypeOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  selectedJoinType: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  joinTypeText: {
    fontSize: 16,
    color: '#000',
  },
  selectedJoinTypeText: {
    color: '#fff',
    fontWeight: '500',
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  allergenBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#fff',
  },
  selectedAllergenBox: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  allergenBoxText: {
    fontSize: 14,
    color: '#000',
  },
  selectedAllergenBoxText: {
    color: '#fff',
  },
  veganOptions: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  veganOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30,
  },
  veganText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  radioSelected: {
    backgroundColor: '#8b5cf6',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  cancelButton: {
    flex: 0.4,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#f97316',
  },
  createButton: {
    flex: 0.4,
    backgroundColor: '#8b5cf6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});