import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase, joinEvent as joinEventHelper } from "@/backend/lib/database";

interface JoinedEventRow {
  event_id: string;
}

export const joinEvent = publicProcedure
  .input(z.object({
    eventId: z.string(),
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user already joined
      const { data: existingAttendee } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', input.eventId)
        .eq('user_id', input.userId)
        .single();

      if (existingAttendee) {
        throw new Error('Already joined this event');
      }

      // Check event capacity
      const { data: event } = await supabase
        .from('events')
        .select('max_attendees, current_attendees')
        .eq('id', input.eventId)
        .single();

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.current_attendees >= event.max_attendees) {
        throw new Error('Event is full');
      }

      // Add attendee using helper function
      await joinEventHelper(input.eventId, input.userId);

      // Update user tickets - first get current tickets
      const { data: userData } = await supabase
        .from('users')
        .select('tickets_remaining')
        .eq('id', input.userId)
        .single();

      if (userData && userData.tickets_remaining > 0) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ tickets_remaining: userData.tickets_remaining - 1 })
          .eq('id', input.userId);

        if (updateError) {
          console.error('Error updating user tickets:', updateError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Join event error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to join event');
    }
  });

export const getJoinedEvents = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    const { data: joinedEvents, error } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', input.userId);

    if (error) {
      throw new Error(`Failed to fetch joined events: ${error.message}`);
    }

    return joinedEvents?.map((row: JoinedEventRow) => row.event_id) || [];
  });