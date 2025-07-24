import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useUser } from '@/hooks/use-user';
import { User, Camera, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CompleteProfileScreen() {
  const { email, password, firstName: socialFirstName, lastName: socialLastName, fromSocial } = useLocalSearchParams<{ 
    email: string; 
    password?: string; 
    firstName?: string; 
    lastName?: string; 
    fromSocial: string;
  }>();
  
  const { signUp } = useUser();
  
  const [firstName, setFirstName] = useState(socialFirstName || '');
  const [lastName, setLastName] = useState(socialLastName || '');
  const [hobbies, setHobbies] = useState('');
  const [work, setWork] = useState('');
  const [interests, setInterests] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImageUrl(result.assets[0].uri);
    }
  };
  
  const handleCompleteProfile = async () => {
    if (!firstName || !lastName || !profileImageUrl) {
      Alert.alert('Missing Information', 'Please fill in your name and add a profile picture');
      return;
    }

    if (!password && fromSocial !== 'true') {
      Alert.alert('Error', 'Password is required for email registration');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp({
        email,
        password: password || 'social-login',
        firstName,
        lastName,
        profileImageUrl,
        age: 25,
        hobbies: hobbies || 'Food, Travel, Music',
        work: work || 'Professional',
        interests: interests || 'Dining, Socializing',
        isVerified: fromSocial === 'true',
      });
      
      Alert.alert('Welcome to OurWorld!', 'Your profile has been created successfully.', [
        {
          text: 'Start Exploring',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('Profile completion error:', error);
      
      // Check if it's a backend connection error
      if (error instanceof Error && (
        error.message.includes('Backend server not found') ||
        error.message.includes('Backend server not available') ||
        error.message.includes('JSON Parse error')
      )) {
        // If backend is unavailable, still show success since we created a demo user
        Alert.alert('Welcome to OurWorld!', 'Your profile has been created successfully. (Running in demo mode)', [
          {
            text: 'Start Exploring',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help others get to know you better</Text>
        
        {/* Profile Image */}
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.imageContainer} 
            onPress={handlePickImage}
            testID="profile-image-picker"
          >
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera color="#8b5cf6" size={32} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.imageHint}>Add a profile picture</Text>
        </View>
        
        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.nameRow}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <User color="#666" size={20} />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First Name"
                testID="first-name-input"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <User color="#666" size={20} />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last Name"
                testID="last-name-input"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { marginLeft: 0 }]}
              value={hobbies}
              onChangeText={setHobbies}
              placeholder="Hobbies (e.g., Cooking, Reading, Sports)"
              testID="hobbies-input"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { marginLeft: 0 }]}
              value={work}
              onChangeText={setWork}
              placeholder="Work/Profession (e.g., Software Engineer, Teacher)"
              testID="work-input"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, { marginLeft: 0 }]}
              value={interests}
              onChangeText={setInterests}
              placeholder="Interests (e.g., Food, Travel, Music)"
              multiline
              numberOfLines={2}
              testID="interests-input"
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.completeButton, isLoading && styles.disabledButton]} 
          onPress={handleCompleteProfile}
          disabled={isLoading}
          testID="complete-profile-button"
        >
          <Text style={styles.completeButtonText}>
            {isLoading ? 'Creating Profile...' : 'Complete Profile'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          You can always update your profile information later in settings.
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  imageHint: {
    fontSize: 14,
    color: '#666',
  },
  formContainer: {
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
  },
  halfWidth: {
    width: '48%',
  },
  input: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#000',
  },
  completeButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
});