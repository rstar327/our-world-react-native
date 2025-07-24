import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/backend/lib/database";

interface EventWithHostRow {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  image_url: string;
  host_id: string;
  host_name: string;
  max_attendees: number;
  current_attendees: number;
  price: number;
  join_type: string;
  latitude: number;
  longitude: number;
  address: string | null;
  general_area: string;
  doorbell: string | null;
  allergens: string | null;
  vegan_options: boolean;
  pets: string | null;
  created_at: string;
}

export default publicProcedure
  .input(z.object({
    userId: z.string().optional(),
    hostId: z.string().optional(),
  }))
  .query(async ({ input }) => {
    let query = supabase
      .from('events')
      .select(`
        *,
        users!events_host_id_fkey(first_name),
        event_attendees(count)
      `)
      .order('created_at', { ascending: false });

    if (input.hostId) {
      query = query.eq('host_id', input.hostId);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return events?.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      imageUrl: event.image_url,
      hostId: event.host_id,
      hostName: event.users?.first_name || 'Unknown',
      maxAttendees: event.max_attendees,
      currentAttendees: event.current_attendees || 0,
      price: event.price,
      joinType: event.join_type as 'open' | 'request',
      location: {
        latitude: event.latitude,
        longitude: event.longitude,
        address: event.address || undefined,
        generalArea: event.general_area,
        doorbell: event.doorbell || undefined,
      },
      allergens: event.allergens ? JSON.parse(event.allergens) : [],
      veganOptions: event.vegan_options,
      pets: event.pets || undefined,
      createdAt: event.created_at,
    })) || [];
  });