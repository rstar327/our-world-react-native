import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { initDatabase, seedDatabase } from "./lib/database"; // Initialize database

// Initialize database on startup
(async () => {
  try {
    await initDatabase();
    await seedDatabase();
    console.log('Database initialized and demo user seeded');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
})();

// app will be mounted at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add error handling middleware
app.onError((err, c) => {
  console.error('Hono error:', err);
  return c.json({ 
    error: { 
      message: err.message || 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    } 
  }, 500);
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error);
    },
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "API is running with Supabase",
    database: "Supabase PostgreSQL"
  });
});

export default app;