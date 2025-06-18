/**
 * @file src/server/routers/user.ts
 * @description This file defines tRPC procedures specifically related to user profile management.
 * It handles fetching public user profiles and will later include functionalities
 * for authenticated users to view and update their own profile details.
 */

import { z } from 'zod'; // For input validation
// Import publicProcedure and router from your tRPC setup.
import { publicProcedure, router, protectedProcedure } from '../trpc'; // Ensure protectedProcedure is imported if you use it
// Import your Prisma client for database operations.
import { db } from '@/lib/db';

// Define the user-related tRPC procedures.
export const userRouter = router({
  // 'getProfile' procedure: Fetches a user's public profile data by their ID.
  // This could be public if you want anyone to see public profiles, or protected if only logged-in users.
  // For now, let's keep it public for flexibility.
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() })) // Expects an object with a string 'userId'.
    .query(async ({ input }) => {
      const userProfile = await db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true, // You might only show email to authenticated users, adjust later
          image: true,
          birthday: true,
          phoneNumber: true, // Only if publicly viewable, otherwise make this protected
          createdAt: true,
          // Do NOT select sensitive info like 'password' here.
        },
      });

      if (!userProfile) {
        // You can throw an error or return null/undefined if the profile is not found.
        return null;
      }

      return userProfile;
    }),

  // 'getMyProfile' procedure: Fetches the profile of the currently authenticated user.
  // This would be a protected procedure.
  // TODO: Uncomment and implement once 'protectedProcedure' in src/server/trpc.ts is fully implemented
  // getMyProfile: protectedProcedure
  //   .query(async ({ ctx }) => {
  //     // Assuming ctx.session.user.id is available from the protectedProcedure middleware.
  //     const userId = ctx.session.user.id;
  //     const myProfile = await db.user.findUnique({
  //       where: { id: userId },
  //       select: {
  //         id: true,
  //         name: true,
  //         email: true,
  //         image: true,
  //         birthday: true,
  //         phoneNumber: true,
  //         createdAt: true,
  //         // Add other fields relevant to a user viewing their OWN profile
  //       },
  //     });
  //     if (!myProfile) {
  //       // This should ideally not happen if user is authenticated and exists.
  //       throw new Error("Authenticated user profile not found.");
  //     }
  //     return myProfile;
  //   }),

  // TODO: Add more procedures here later for:
  // - updateProfile (mutation - protectedProcedure)
  // - changePassword (mutation - protectedProcedure)
});
