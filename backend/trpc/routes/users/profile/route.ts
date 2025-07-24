import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { getUserById, updateUser } from "@/backend/lib/database";

export const getUserProfile = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const user = await getUserById(input.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
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
    };
  });

export const updateUserProfile = publicProcedure
  .input(z.object({
    userId: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profileImageUrl: z.string().optional(),
    age: z.number().optional(),
    hobbies: z.string().optional(),
    work: z.string().optional(),
    interests: z.string().optional(),
    ticketsRemaining: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, ...updates } = input;
    
    // Build update object
    const updateData: any = {};
    
    if (updates.firstName !== undefined) {
      updateData.first_name = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      updateData.last_name = updates.lastName;
    }
    if (updates.profileImageUrl !== undefined) {
      updateData.profile_image_url = updates.profileImageUrl;
    }
    if (updates.age !== undefined) {
      updateData.age = updates.age;
    }
    if (updates.hobbies !== undefined) {
      updateData.hobbies = updates.hobbies;
    }
    if (updates.work !== undefined) {
      updateData.work = updates.work;
    }
    if (updates.interests !== undefined) {
      updateData.interests = updates.interests;
    }
    if (updates.ticketsRemaining !== undefined) {
      updateData.tickets_remaining = updates.ticketsRemaining;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    await updateUser(userId, updateData);

    return { success: true };
  });