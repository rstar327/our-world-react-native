import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/user';
import { trpc } from '@/lib/trpc';

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const updateProfileMutation = trpc.users.updateProfile.useMutation();

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user:', error);
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to storage whenever it changes
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error saving user:', error);
      }
    };

    saveUser();
  }, [user]);

  const signUp = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    age?: number;
    hobbies?: string;
    work?: string;
    interests?: string;
    isVerified?: boolean;
  }) => {
    try {
      console.log('Attempting to register user:', { email: userData.email });
      const result = await registerMutation.mutateAsync(userData);
      if (result.success) {
        // Convert backend user format to frontend User type
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profileImageUrl: result.user.profileImageUrl || undefined,
          ticketsRemaining: result.user.ticketsRemaining,
          maxTickets: result.user.maxTickets,
          age: result.user.age,
          hobbies: result.user.hobbies,
          work: result.user.work,
          interests: result.user.interests,
          isVerified: result.user.isVerified,
        };
        setUser(user);
        return user;
      }
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Sign up error:', error);
      
      // Check if it's a backend connection error
      if (error instanceof Error && (
        error.message.includes('JSON Parse error') ||
        error.message.includes('Backend server not found') ||
        error.message.includes('Backend server not available')
      )) {
        console.log('Backend unavailable, creating demo user');
        // Create a demo user for offline mode
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          ticketsRemaining: 5,
          maxTickets: 5,
          age: userData.age || 25,
          hobbies: userData.hobbies || 'Food, Travel, Music',
          work: userData.work || 'Professional',
          interests: userData.interests || 'Dining, Socializing',
          isVerified: userData.isVerified || false,
        };
        setUser(demoUser);
        return demoUser;
      }
      
      throw error;
    }
  };

  const signIn = async (credentials: { email: string; password: string } | User) => {
    try {
      if (!credentials) {
        throw new Error('Credentials required');
      }

      // If it's a User object (for demo/mock login), use it directly
      if ('id' in credentials) {
        setUser(credentials);
        return credentials;
      }

      console.log('Attempting to login user:', { email: credentials.email });
      // Otherwise, authenticate with backend
      const result = await loginMutation.mutateAsync(credentials);
      if (result.success) {
        // Convert backend user format to frontend User type
        const user: User = {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profileImageUrl: result.user.profileImageUrl || undefined,
          ticketsRemaining: result.user.ticketsRemaining,
          maxTickets: result.user.maxTickets,
          age: result.user.age,
          hobbies: result.user.hobbies,
          work: result.user.work,
          interests: result.user.interests,
          isVerified: result.user.isVerified,
        };
        setUser(user);
        return user;
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Check if it's a backend connection error
      if (error instanceof Error && (
        error.message.includes('JSON Parse error') || 
        error.message.includes('Backend server not found') ||
        error.message.includes('Backend server not available')
      )) {
        console.log('Backend unavailable, trying mock user login');
        
        // Try to find user in mock data
        const { mockUsers } = await import('@/mocks/users');
        const mockUser = mockUsers.find(u => u.email.toLowerCase() === (credentials as { email: string }).email.toLowerCase());
        
        if (mockUser) {
          console.log('Found mock user, logging in:', mockUser.email);
          setUser(mockUser);
          return mockUser;
        }
        
        // Create a demo user for offline mode if no mock user found
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          email: (credentials as { email: string }).email,
          firstName: 'Demo',
          lastName: 'User',
          profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          ticketsRemaining: 5,
          maxTickets: 5,
          age: 25,
          hobbies: 'Food, Travel, Music',
          work: 'Professional',
          interests: 'Dining, Socializing',
          isVerified: true,
        };
        setUser(demoUser);
        return demoUser;
      }
      
      // Fallback to mock login for demo
      if (credentials && 'id' in credentials) {
        setUser(credentials);
        return credentials;
      }
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      console.log('Attempting to update user profile');
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl || undefined,
        age: userData.age || undefined,
        hobbies: userData.hobbies || undefined,
        work: userData.work || undefined,
        interests: userData.interests || undefined,
        ticketsRemaining: userData.ticketsRemaining,
      });
      
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Update user error:', error);
      
      // Check if it's a backend connection error (backend unavailable)
      if (error instanceof Error && (
        error.message.includes('JSON Parse error') ||
        error.message.includes('Backend server not found') ||
        error.message.includes('Backend server not available')
      )) {
        console.log('Backend unavailable, updating locally');
      }
      
      // Fallback to local update for demo
      setUser({ ...user, ...userData });
    }
  };

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateUser,
  };
});