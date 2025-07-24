import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEvents } from '@/hooks/use-events';
import { ArrowLeft, Calendar, Clock, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Event } from '@/types/event';

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

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEventById, updateEvent } = useEvents();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState('');
  const [time, setTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [joinType, setJoinType] = useState<'open' | 'request'>('open');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const next7Days = getNext7Days();

  useEffect(() => {
    if (id) {
      const eventData = getEventById(id);
      if (eventData) {
        setEvent(eventData);
        setTitle(eventData.title);
        setDescription(eventData.description);
        setSelectedDate(eventData.date);
        setTime(eventData.time);
        setImageUrl(eventData.imageUrl);
        setJoinType(eventData.joinType || 'open');
        
        // Set display date
        const eventDate = new Date(eventData.date);
        const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNumber = eventDate.getDate();
        const monthName = eventDate.toLocaleDateString('en-US', { month: 'long' });
        setSelectedDateDisplay(`${dayName} ${dayNumber} ${monthName}`);
      } else {
        Alert.alert('Error', 'Event not found');
        router.back();
      }
    }
  }, [id, getEventById]);

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

  const handleDateSelect = (date: string, display: string) => {
    setSelectedDate(date);
    setSelectedDateDisplay(display);
    setShowDatePicker(false);
  };

  const formatTime = (input: string) => {
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

  const handleSaveEvent = () => {
    if (!event) return;
    
    if (!title || !description || !selectedDate || !time || !imageUrl) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 16:20)');
      return;
    }

    const updates = {
      title,
      description,
      date: selectedDate,
      time,
      imageUrl,
      joinType,
    };

    updateEvent(event.id, updates);
    
    Alert.alert('Success', 'Your event has been updated!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  if (!event) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading event...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Image */}
        <TouchableOpacity 
          style={styles.imageContainer} 
          onPress={handlePickImage}
        >
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.foodImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Upload color="#666" size={40} />
              <Text style={styles.imagePlaceholderText}>Tap to change image</Text>
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
            placeholder="Event name"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Event description"
            multiline
            numberOfLines={3}
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
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveEvent}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
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
    marginTop: 10,
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
  textArea: {
    marginLeft: 0,
    minHeight: 80,
    textAlignVertical: 'top',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
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
  saveButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});