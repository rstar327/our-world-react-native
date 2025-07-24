import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { hashPassword, createUser, getUserByEmail } from "@/backend/lib/database";

export const registerProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    profileImageUrl: z.string().optional(),
    age: z.number().optional(),
    hobbies: z.string().optional(),
    work: z.string().optional(),
    interests: z.string().optional(),
    isVerified: z.boolean().default(false),
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const user = await createUser({
        email: input.email,
        password_hash: passwordHash,
        first_name: input.firstName,
        last_name: input.lastName,
        profile_image_url: input.profileImageUrl,
        age: input.age,
        hobbies: input.hobbies,
        work: input.work,
        interests: input.interests,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          profileImageUrl: user.profile_image_url,
          ticketsRemaining: user.tickets_remaining,
          maxTickets: user.max_tickets,
          age: user.age,
          hobbies: user.hobbies,
          work: user.work,
          interests: user.interests,
          isVerified: user.is_verified,
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  });