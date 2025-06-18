/**
 * @file src/server/routers/gear.ts
 * @description This file defines tRPC procedures specifically related to managing gear listings.
 * It includes functionalities for fetching, creating, updating, and deleting gear items,
 * forming a key part of the platform's core offering.
 */

import { z } from 'zod'; // For input validation if needed for gear procedures

// Import publicProcedure and router from your tRPC setup.
// These are defined in src/server/trpc.ts
import { publicProcedure, router } from '../trpc';
// Import your Prisma client for database operations.
import { db } from '@/lib/db';

// Define the gear-related tRPC procedures.
// This 'gearRouter' will be imported into your main '_app.ts' router.
export const gearRouter = router({
  // 'getAll' procedure: Fetches all gear listings from the database.
  // This is a a public procedure, meaning it can be accessed by any user (authenticated or not).
  getAll: publicProcedure.query(async () => {
    // A query procedure is typically used for fetching data.
    const allGear = await db.gear.findMany({
      // You can include related data like owner information or images if needed.
      // For example: include: { owner: true, images: true }
    });
    return allGear;
  }),

  // 'getById' procedure: Fetches a single gear listing by its unique ID.
  getById: publicProcedure
    // The input schema defines the expected shape of arguments for this procedure.
    // Here, it expects an object with a string 'id'.
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // The query function receives the validated input.
      const gear = await db.gear.findUnique({
        where: { id: input.id }, // Find gear by the provided ID.
      });
      return gear; // Return the found gear item (or null if not found).
    }),

  // TODO: Add more gear-related procedures here later for:
  // - create (mutation): For adding new gear listings. (Would likely use protectedProcedure)
  // - update (mutation): For modifying existing gear listings. (Would likely use protectedProcedure)
  // - delete (mutation): For removing gear listings. (Would likely use protectedProcedure)
  // - search (query): For advanced searching with filters, pagination, etc.
});
