/**
 * @file src/server/routers/auth.ts
 * @description This file defines tRPC procedures specifically related to user authentication and account management.
 * It handles the creation of new user accounts (signup) using email and hashed passwords.
 * It works in conjunction with NextAuth.js's CredentialsProvider for user login.
 */

// Zod for input validation based on the schema defined in src/lib/validators.
import { z } from 'zod';
// Hash function from bcryptjs for securely storing passwords.
import { hash } from 'bcryptjs';
// Import Prisma's User type from @prisma/client for explicit typing.
import { User } from '@prisma/client';

// Import publicProcedure and router from your tRPC setup.
import { publicProcedure, router } from '../trpc';
// Import your Prisma client for database operations.
import { db } from '@/lib/db';
// Import your Zod validation schema.
import { signupSchema } from '@/lib/validators/authSchema';

// Define the authentication-related tRPC procedures.
export const authRouter = router({
  // 'signup' mutation: Allows new users to register with email, password, name, and birthday.
  signup: publicProcedure // This procedure is public, as new users are not yet authenticated.
    .input(signupSchema) // Validate input data using the Zod schema.
    .mutation(async ({ input }) => {
      // The mutation function, handling data creation.
      const { email, password, name, birthday, phoneNumber } = input;

      // 1. Check if a user with the given email already exists.
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // If user already exists, throw an error to prevent duplicate accounts.
        throw new Error('User with this email already exists.');
      }

      // 2. Hash the provided password securely.
      // '10' is the 'salt rounds' or 'cost factor', determining the computational expense.
      // A higher number is more secure but slower. 10-12 is a common balance.
      const hashedPassword = await hash(password, 10);

      // 3. Create the new user record in the database using Prisma.
      // Explicitly select the fields we expect back to ensure proper TypeScript typing.
      const rawNewUser = await db.user.create({
        data: {
          email,
          password: hashedPassword, // Store the hashed password
          name,
          birthday: birthday ? new Date(birthday) : null, // Convert string to Date if present
          phoneNumber, // Store phone number if provided
          emailVerified: null, // Initially not verified, unless you add a verification step
        },
        // Corrected 'select' clause: Ensure createdAt is explicitly selected to be returned.
        select: {
          id: true,
          email: true,
          name: true,
          birthday: true, // Select birthday
          phoneNumber: true, // Select phoneNumber
          createdAt: true, // Explicitly select createdAt
          // Ensure all fields you return below are selected here.
        },
      });

      // Type assert newUser using the full User type from Prisma client,
      // as create operations usually return all scalar fields including createdAt.
      const newUser: User = rawNewUser as User;

      // 4. Return success message and non-sensitive user details.
      return {
        message: 'Account created successfully!',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          birthday: newUser.birthday,
          phoneNumber: newUser.phoneNumber,
          createdAt: newUser.createdAt, // createdAt should now be recognized
        },
      };
    }),
});
