/**
 * @file src/lib/validators/authSchema.ts
 * @description This file defines Zod schemas for validating authentication-related data,
 * such as user registration (signup) and login credentials. These schemas ensure that
 * incoming data conforms to expected formats and constraints, providing robust
 * client-side and server-side validation for API requests.
 */

import { z } from 'zod';

// Schema for user registration (signup) data.
export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(100, 'Password cannot exceed 100 characters.'),
  // Add more complex regex for password requirements if desired (e.g., strong combinations)
  // .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  // .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  // .regex(/[0-9]/, "Password must contain at least one number.")
  // .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character."),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long.')
    .max(50, 'Name cannot exceed 50 characters.'),
  // Birthday is optional for the schema, but typically collected.
  // It expects a string from the form, which is then coerced to a Date object.
  birthday: z.string().optional().pipe(z.coerce.date().optional()),
  // phoneNumber is optional for this signup method but present in the User model.
  phoneNumber: z.string().optional().nullable(), // Allow null as it's optional
});

// Schema for user login data (used by CredentialsProvider).
// Note: CredentialsProvider takes care of its own basic validation,
// but you might use this schema for frontend validation.
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password cannot be empty.'),
});
