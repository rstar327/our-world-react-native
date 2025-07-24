import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { supabase } from "@/backend/lib/database";

export default publicProcedure
  .input(z.object({ name: z.string().optional() }).optional())
  .query(async ({ input }) => {
    // Test Supabase connection
    let supabaseStatus = 'Not configured';
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        supabaseStatus = error ? `Error: ${error.message}` : 'Connected';
      } catch (err) {
        supabaseStatus = `Connection failed: ${err}`;
      }
    }
    
    return {
      hello: input?.name || 'World',
      date: new Date(),
      supabase: supabaseStatus,
      environment: {
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set',
        EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      }
    };
  });