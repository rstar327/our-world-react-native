export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string | null | undefined;
  ticketsRemaining: number;
  maxTickets: number;
  age?: number | null;
  hobbies?: string | null;
  work?: string | null;
  interests?: string | null;
  isVerified?: boolean;
}