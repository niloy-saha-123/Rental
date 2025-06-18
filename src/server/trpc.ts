/**
 * @file src/server/trpc.ts
 * @description This file initializes the tRPC server instance and defines its core components.
 * It sets up the tRPC context for each request and creates reusable procedure builders
 * like `publicProcedure` (for unauthenticated access) and `protectedProcedure` (for authenticated access).
 * This acts as the foundation for all your tRPC API endpoints, ensuring consistent setup
 * and error handling across the backend.
 */
// Importing necessary utilities from @trpc/server
import { initTRPC } from '@trpc/server';
// Import FetchCreateContextFnOptions for context creation in fetch handlers.
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import superjson from 'superjson'; // For proper serialization of dates, etc.
import { ZodError } from 'zod'; // For structured error handling with Zod

// --- Context Setup (createContext) ---
// This function creates the tRPC context for each request.
// It is now typed with `FetchCreateContextFnOptions` to be compatible with `fetchRequestHandler`.
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Access the standard Web Request object from `opts.req`.
  // You would typically get the user's session here.
  // For now, we're returning an empty object, but later you'd integrate Auth.js session.
  // Example: const session = await getServerSession(authOptions);
  return {
    // db, // If you want to access Prisma client directly in context (optional, can import in procedures)
    // session, // User session information
    req: opts.req, // Pass the request object
    // Note: 'res' is not directly available in FetchCreateContextFnOptions
    // as it's a Node.js-specific concept not part of the standard Web Fetch API.
  };
};

// --- tRPC Initialization ---
// `initTRPC` creates the tRPC instance.
// It takes generic types for the context and a configuration object.
const t = initTRPC.context<typeof createContext>().create({
  // Use superjson for efficient and safe serialization of data, especially dates.
  transformer: superjson,
  // Define custom error formatting, especially useful with Zod.
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
// These are reusable tRPC procedures.

// `router` creates a new tRPC router. All your API procedures will be defined within a router.
export const router = t.router;

// `publicProcedure` is a base procedure that doesn't enforce any authentication or authorization.
// It's used for endpoints accessible to anyone (e.g., signup, public data).
export const publicProcedure = t.procedure;

// `protectedProcedure` is a base procedure that only authenticated users can access.
// You would add authorization logic here (e.g., checking if `session.user` exists).
// For now, it's public, but you'd modify it later to check authentication.
export const protectedProcedure = t.procedure; // TODO: Implement authentication check here later
// Example for protectedProcedure (requires Auth.js session integration):
/*
import { TRPCError } from '@trpc/server';
import { getServerSession } from 'next-auth'; // You'll need to define your auth options

export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    // You would fetch and check the session here.
    // This is a placeholder; real implementation depends on your Auth.js setup.
    // const session = await getServerSession(ctx.req, ctx.res, authOptions); // Note: ctx.res not available here

    // if (!session || !session.user) {
    //   throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    // }

    return next({
      // ctx: {
      //   // Infers the `session` as part of the tRPC context
      //   session,
      // },
    });
  })
);
*/
