import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@example.com',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
    ticketsRemaining: 3,
    maxTickets: 5,
    age: 28,
    hobbies: 'Cooking, Photography, Hiking',
    isVerified: true
  },
  {
    id: 'user-2',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
    ticketsRemaining: 2,
    maxTickets: 5,
    age: 32,
    hobbies: 'Gaming, Music, Sports',
    isVerified: false
  },
  {
    id: 'user-3',
    firstName: 'Demo',
    lastName: 'User',
    email: 'dodopoulos2@gmail.com',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80',
    ticketsRemaining: 5,
    maxTickets: 5,
    age: 30,
    hobbies: 'Food, Travel, Music',
    work: 'Professional',
    interests: 'Dining, Socializing',
    isVerified: true
  }
];