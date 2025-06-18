/**
 * @file src/app/api/trpc/[trpc]/route.ts
 * @description This file serves as the single, unified API route for all tRPC API requests
 * in the Next.js App Router. It acts as the HTTP bridge between the frontend and
 * the type-safe tRPC backend procedures. All frontend tRPC calls will be directed here.
 */

// This file serves as the single entry point for all tRPC API requests in the Next.js App Router.

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers/_app'; // Our main tRPC router
import { createContext } from '@/server/trpc'; // Our tRPC context creator

// Define the handler function for all incoming HTTP requests to /api/trpc.
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc', // The base path for our tRPC API
    req, // The incoming HTTP request
    router: appRouter, // Our main tRPC router, which contains all our procedures
    createContext, // Function to create the tRPC context for each request
    // Optional: Add a custom error handler for production environments
    // onError:
    //   process.env.NODE_ENV === 'development'
    //     ? ({ path, error }) => {
    //         console.error(
    //           `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
    //         );
    //       }
    //     : undefined,
  });

// Export named handlers for HTTP methods that tRPC uses.
// tRPC typically sends POST requests for mutations and GET requests for queries.
export { handler as GET, handler as POST };

// We would also export other methods if needed for specific tRPC features or HTTP semantics:
// export { handler as PUT, handler as DELETE, handler as PATCH };
