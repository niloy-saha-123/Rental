/**
 * @file src/server/trpc.ts
 * @description This file initializes the tRPC server instance and defines its core components.
 * It sets up the tRPC context for each request and creates reusable procedure builders
 * like `publicProcedure` (for unauthenticated access) and `protectedProcedure` (for authenticated access).
 * This acts as the foundation for all your tRPC API endpoints, ensuring consistent setup
 * and error handling across the backend.
 */

// Importing necessary utilities from @trpc/server
import { initTRPC, TRPCError } from '@trpc/server'; // Imports core tRPC functionalities and TRPCError for custom errors.
// Import FetchCreateContextFnOptions for context creation in fetch handlers.
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'; // Imports types for context creation in Fetch API-compatible handlers.
import superjson from 'superjson'; // Imports SuperJSON for advanced serialization/deserialization.
import { ZodError } from 'zod'; // Imports ZodError for handling validation errors from Zod schemas.
// Import getServerSession to obtain the Auth.js session object from the request.
import { getServerSession } from 'next-auth/next'; // Imports function to get session on the server.
// Import your Auth.js options, which define your authentication configuration.
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Imports our Auth.js configuration.

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
  // The 'as any' cast on opts.req and opts.res is a temporary workaround for type incompatibility
  // between Auth.js's GetServerSessionParams and tRPC's FetchCreateContextFnOptions.
  // Ideally, this would be resolved by a future NextAuth.js or tRPC update,
  // or by passing raw request/response objects more explicitly.
  const session = await getServerSession(
    // We expect req and res to be compatible with Node.js http.IncomingMessage and http.ServerResponse for getServerSession.
    // However, FetchCreateContextFnOptions only directly exposes req as a Web Request.
    // Next.js App Router's underlying handling often makes this compatible, but TypeScript struggles.
    // The safest, most direct way to get session for App Router is often just passing `authOptions`
    // and relying on NextAuth's internal context derivation.
    // If getServerSession directly takes only authOptions, pass it like this:
    authOptions // Correctly pass authOptions directly to getServerSession.
  );

  return {
    req: opts.req, // Passes the standard Web Request object to the context.
    session, // Includes the retrieved session (or null) in the context.
  };
};

// --- tRPC Initialization ---
// `initTRPC` creates the tRPC instance, binding the context and defining global configurations.
const t = initTRPC.context<typeof createContext>().create({
  // Initializes tRPC with our custom context.
  // `transformer`: Uses SuperJSON for efficient and safe serialization/deserialization of data types
  // (like Dates, BigInts, etc.) between the client and server.
  transformer: superjson, // Applies the SuperJSON transformer.
  // `errorFormatter`: Customizes how errors are structured when sent back to the client.
  // It specifically flattens Zod validation errors for easier handling on the frontend.
  errorFormatter({ shape, error }) {
    // Defines how errors are formatted for client responses.
    return {
      ...shape, // Spreads default error shape properties.
      data: {
        // Adds custom data to the error payload.
        ...shape.data, // Spreads default error data properties.
        // Includes Zod validation errors if applicable.
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten() // Flattens the ZodError for easier consumption on the client.
            : null, // Otherwise, sets zodError to null.
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
export const router = t.router; // Exports the router creation utility.

/**
 * @constant publicProcedure
 * @description A base tRPC procedure that does not enforce any authentication or authorization.
 * It is used for API endpoints that are accessible to anyone, regardless of their login status
 * (e.g., user signup, fetching public gear listings).
 */
export const publicProcedure = t.procedure; // Exports a procedure builder for public access.

/**
 * @constant protectedProcedure
 * @description A base tRPC procedure that explicitly requires the user to be authenticated.
 * It uses a middleware to check for a valid session. If no valid session is found, it throws
 * an `UNAUTHORIZED` error, preventing access to the procedure's logic.
 */
export const protectedProcedure = t.procedure.use(
  // Exports a procedure builder with authentication middleware.
  t.middleware(async ({ ctx, next }) => {
    // Defines the authentication middleware.
    // Check if a session exists in the context and if the user is present in the session.
    // The session object is populated in the `createContext` function.
    if (!ctx.session || !(ctx.session as any).user) {
      // Checks if the session or user within the session is missing.
      // If no valid session, throw an unauthorized error.
      // This error will be caught by tRPC's error handler and sent to the client.
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated.',
      }); // Throws a tRPC-specific unauthorized error.
    }

    // If authenticated, proceed to the next middleware or the procedure's main logic.
    // The session is explicitly passed into the context for subsequent steps, aiding type inference.
    return next({
      // Continues the request processing.
      ctx: {
        // Overrides or extends the context passed to the next step.
        session: ctx.session, // Explicitly makes the session available as ctx.session for type inference.
      },
    });
  })
);
