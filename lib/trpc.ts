import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // For Rork platform, use relative URL which will use the same domain
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Fallback for development
  return "http://localhost:3000";
};



export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: {
        'Content-Type': 'application/json',
      },
      // Add error handling to prevent crashes
      fetch: async (url, options) => {
        try {
          console.log('Making tRPC request to:', url);
          console.log('Request options:', {
            method: options?.method,
            headers: options?.headers,
            body: options?.body ? 'Present' : 'None'
          });
          

          const response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
          // Check if response is JSON
          const contentType = response.headers.get('content-type');
          if (!contentType?.includes('application/json')) {
            const responseText = await response.text();
            console.error('Non-JSON response received:', responseText);
            
            // If it's a 404 HTML page, provide a more helpful error
            if (response.status === 404 && responseText.includes('<html>')) {
              console.warn('Backend server not found (404) - The API endpoint is not accessible');
              throw new Error('Backend server not found (404) - The API endpoint is not accessible');
            }
            
            throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          throw error; // Re-throw the error instead of masking it
        }
      },
    }),
  ],
});