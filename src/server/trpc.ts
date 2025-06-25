/**
 * @file src/server/trpc.ts
 * @description This file initializes the tRPC server instance and defines its core components.
 * It sets up the tRPC context for each request and creates reusable procedure builders
 * like `publicProcedure` (for unauthenticated access) and `protectedProcedure` (for authenticated access).
 * This acts as the foundation for all your tRPC API endpoints, ensuring consistent setup
 * and error handling across the backend.
 */

// Importing necessary utilities from @trpc/server
import { initTRPC, TRPCError } from '@trpc/server'; // Import TRPCError for error handling in procedures
// Import FetchCreateContextFnOptions for context creation in fetch handlers.
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson'; // For proper serialization of dates, etc., between client and server
import { ZodError } from 'zod'; // For structured validation error handling from Zod schemas
// Import getServerSession to obtain the Auth.js session object from the request.
import { getServerSession } from 'next-auth';
// Import your Auth.js options, which define your authentication configuration.
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path if needed

// --- Context Setup (createContext) ---
/**
 * @function createContext
 * @description This asynchronous function creates the tRPC context for each incoming API request.
 * The context is a crucial object that is passed down to all tRPC procedures, making resources
 * like the database client, current user session, or request/response objects available.
 * @param {FetchCreateContextFnOptions} opts - Options provided by the tRPC fetch adapter, including the request object.
 * @returns {Promise<object>} An object containing the request and the user's session.
 */
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Obtain the Auth.js session for the current request.
  // getServerSession reads the session cookie and validates the user's session.
  const session = await getServerSession(authOptions); // Pass authOptions here for session retrieval

  return {
    req: opts.req, // The standard Web Request object for the current API call.
    session, // The user's authentication session, or null if not authenticated.
  };
};

// --- tRPC Initialization ---
// `initTRPC` creates the tRPC instance, binding the context and defining global configurations.
const t = initTRPC.context<typeof createContext>().create({
  // `transformer`: Uses SuperJSON for efficient and safe serialization/deserialization of data types
  // (like Dates, BigInts, etc.) between the client and server.
  transformer: superjson,
  // `errorFormatter`: Customizes how errors are structured when sent back to the client.
  // It specifically flattens Zod validation errors for easier handling on the frontend.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// --- Procedure Definitions ---
// These are reusable tRPC procedure builders, enforcing specific authentication/authorization policies.

/**
 * @constant router
 * @description A utility to create new tRPC routers. All your API procedures for a specific domain
 * (e.g., auth, gear, user) will be defined within an instance of this router.
 */
export const router = t.router;

/**
 * @constant publicProcedure
 * @description A base tRPC procedure that does not enforce any authentication or authorization.
 * It is used for API endpoints that are accessible to anyone, regardless of their login status
 * (e.g., user signup, fetching public gear listings).
 */
export const publicProcedure = t.procedure;

/**
 * @constant protectedProcedure
 * @description A base tRPC procedure that explicitly requires the user to be authenticated.
 * It uses a middleware to check for a valid session. If no valid session is found, it throws
 * an `UNAUTHORIZED` error, preventing access to the procedure's logic.
 */
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    // Check if a session exists in the context and if the user object is present within that session.
    // The session object is populated in the `createContext` function.
    if (!ctx.session || !ctx.session.user) {
      // If no valid session, throw an unauthorized error.
      // This error will be caught by tRPC's error handler and sent to the client.
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated.',
      });
    }

    // If authenticated, proceed to the next middleware or the procedure's main logic.
    // The session is explicitly passed into the context for subsequent steps, aiding type inference.
    return next({
      ctx: {
        session: ctx.session, // Makes the session directly available as ctx.session in the procedure
      },
    });
  })
);
