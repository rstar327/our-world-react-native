import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { verifyPassword, getUserByEmail } from "@/backend/lib/database";

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Find user by email
      const user = await getUserByEmail(input.email);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await verifyPassword(input.password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

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
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  });