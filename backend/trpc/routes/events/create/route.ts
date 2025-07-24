import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { createEvent } from "@/backend/lib/database";

export default publicProcedure
  .input(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.string(),
    time: z.string(),
    imageUrl: z.string(),
    hostId: z.string(),
    maxAttendees: z.number().min(1),
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional(),
    generalArea: z.string(),
    doorbell: z.string().optional(),
    joinType: z.enum(['open', 'request']).default('open'),
    allergens: z.array(z.string()).optional(),
    veganOptions: z.boolean().default(false),
    pets: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    try {
      const event = await createEvent({
        title: input.title,
        description: input.description,
        date: input.date,
        time: input.time,
        image_url: input.imageUrl,
        host_id: input.hostId,
        max_attendees: input.maxAttendees,
        current_attendees: 0,
        price: 10,
        join_type: input.joinType,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address || null,
        general_area: input.generalArea,
        doorbell: input.doorbell || null,
        allergens: input.allergens ? JSON.stringify(input.allergens) : null,
        vegan_options: input.veganOptions,
        pets: input.pets || null,
      });

      return {
        success: true,
        eventId: event.id,
      };
    } catch (error) {
      console.error('Create event error:', error);
      throw new Error('Failed to create event');
    }
  });