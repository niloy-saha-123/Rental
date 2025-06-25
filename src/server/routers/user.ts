/**
 * @file src/server/routers/user.ts
 * @description This file defines tRPC procedures specifically related to user profile management.
 * It handles fetching public user profiles and will later include functionalities
 * for authenticated users to view and update their own profile details.
 */

import { z } from 'zod'; // For input validation
// Import publicProcedure and router from your tRPC setup.
import { User } from '@prisma/client';
// Import the User type from Prisma Client
import { publicProcedure, router, protectedProcedure } from '../trpc'; // Ensure protectedProcedure is imported if you use it
// Import Prisma client for database operations.
import { db } from '@/lib/db';

// Define the user-related tRPC procedures.
export const userRouter = router({
  // 'getProfile' procedure: Fetches a user's public profile data by their ID.
  // This could be public if you want anyone to see public profiles, or protected if only logged-in users.
  // For now, let's keep it public for flexibility.
  getProfile: publicProcedure
    .input(z.object({ userId: z.string() })) // Expects an object with a string 'userId'.
    .query(async ({ input }) => {
      // Fetch the user profile, explicitly selecting desired fields.
      const rawUserProfile = await db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          email: true, // You might only show email to authenticated users, adjust later
          image: true,
          birthday: true,
          phoneNumber: true, // Only if publicly viewable, otherwise make this protected
          createdAt: true, // Explicitly select createdAt
          // Do NOT select sensitive info like 'password' here.
        },
      });

      if (!rawUserProfile) {
        // You can throw an error or return null/undefined if the profile is not found.
        return null;
      }

      // Explicitly cast rawUserProfile to the User type.
      // This ensures TypeScript recognizes all fields, including createdAt, that are part of the User model.
      const userProfile: User = rawUserProfile as User;

      return userProfile;
    }),

  // NEW: 'updateProfile' mutation for authenticated users to update their own profile.
  updateProfile: protectedProcedure // This procedure requires authentication.
    .input(
      z.object({
        // We only allow updating these specific fields for now.
        // Make them optional as users might only update one.
        name: z
          .string()
          .min(2, 'Name is too short')
          .max(50, 'Name is too long')
          .optional(),
        birthday: z
          .string()
          .optional()
          .nullable()
          .pipe(z.coerce.date().nullable().optional()), // Date string from form
        phoneNumber: z.string().optional().nullable(),
        // Add other fields here if you want them updateable via this mutation.
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Assuming ctx.session.user.id is available from the protectedProcedure middleware.
      // This ensures a user can only update their own profile.
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new Error('User not authenticated.'); // Should be caught by protectedProcedure middleware
      }

      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          // Only update birthday if it's provided in the input, otherwise leave as is.
          birthday: input.birthday !== undefined ? input.birthday : undefined,
          phoneNumber:
            input.phoneNumber !== undefined ? input.phoneNumber : undefined,
          // Add other updateable fields here.
        },
        select: {
          id: true,
          name: true,
          email: true,
          birthday: true,
          phoneNumber: true,
          updatedAt: true, // Include updatedAt to confirm change
        },
      });

      return {
        message: 'Profile updated successfully!',
        user: updatedUser,
      };
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
  // - changePassword (mutation - protectedProcedure)
});
