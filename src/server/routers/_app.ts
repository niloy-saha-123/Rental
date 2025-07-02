/**
 * @file src/server/routers/_app.ts
 * @description This file serves as the main tRPC router, combining all individual feature-specific routers
 * into a single, cohesive API. This is the router that will be passed to the tRPC API endpoint handler.
 * It defines the overall structure and namespaces for your backend API procedures.
 */

// Import the 'router' function from your tRPC setup.
import { router } from '../trpc';
// Import your existing gear router.
import { gearRouter } from './gear'; // Assuming you have this or will create it.
// NEW: Import the new authentication router.
import { authRouter } from './auth';
// Import the user router for profile management
import { userRouter } from './user';

// This is your main tRPC app router.
// It combines all your individual routers into one API.
export const appRouter = router({
  // Include the gear router under the 'gear' namespace.
  // Access via: api.gear.getById, api.gear.search, etc.
  gear: gearRouter,
  // NEW: Include the authentication router under the 'auth' namespace.
  // Access via: api.auth.signup, api.auth.login (if you add login procedure to it).
  auth: authRouter,
  // Include the user router under the 'user' namespace.
  // Access via: api.user.updateProfile, api.user.getProfile, etc.
  user: userRouter,
  // Add other routers here as your application grows (e.g., booking, user_profile).
});

// Export the type of your appRouter for frontend type-safety.
// This allows your frontend to know all available API procedures and their types.
export type AppRouter = typeof appRouter;
