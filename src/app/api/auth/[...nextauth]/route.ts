/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 * @description This file serves as the central API route for all authentication-related requests
 * handled by Auth.js. It configures authentication providers (e.g., Google, Credentials),
 * integrates with the Prisma database for user and session storage, and manages session creation.
 */

// Core NextAuth library for handling authentication flows.
import NextAuth from 'next-auth';

// PrismaAdapter connects Auth.js to our database via Prisma ORM.
import { PrismaAdapter } from '@auth/prisma-adapter';

// Prisma client instance, allowing database interactions.
import { db } from '@/lib/db';

// --- Authentication Providers ---
// Each provider defines a method by which users can authenticate (e.g., email, Google, Facebook).

// Email Provider: Enables passwordless login via email verification links.
// For later!
// import EmailProvider from 'next-auth/providers/email';

// Google Provider: Enables authentication via Google OAuth.
import GoogleProvider from 'next-auth/providers/google';

// Credentials Provider: Enables traditional email/password login.
import CredentialsProvider from 'next-auth/providers/credentials';
// Library for securely hashing and comparing passwords.
// Because we are not storing passwords in plain text,
// we use bcryptjs to hash passwords during signup and compare them during login.
import { compare } from 'bcryptjs'; // For comparing passwords during login
// Note: 'hash' is imported for clarity but will be used in a separate signup API route.
// import { hash } from "bcryptjs";

// Will add facebook provider later

// Main NextAuth handler configuration.
// This object defines how authentication requests are processed,
// what providers are enabled, and how user data is managed.
const handler = NextAuth({
  // 1. Adapter Configuration:
  // Specifies the database adapter for persisting user, account, and session data.
  // PrismaAdapter leverages your existing Prisma schema to manage Auth.js's required tables.
  adapter: PrismaAdapter(db),

  // 2. Providers Array:
  // A list of authentication methods available to your users.
  // Each provider needs specific configuration (e.g., client IDs/secrets, email server details).
  providers: [
    GoogleProvider({
      // Google OAuth Client ID and Client Secret, obtained from Google Cloud Console.
      // These identify your application to Google for authentication purposes.
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // Credentials Provider for traditional email and password login.
    CredentialsProvider({
      name: 'Credentials', // Display name for this login option (e.g., "Email and Password")
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'jsmith@example.com',
        },
        password: { label: 'Password', type: 'password' },
        // These fields are only for the `authorize` function to define what it expects.
        // Actual signup data (name, birthday) will be handled by a separate signup API.
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Missing credentials
        }

        // 1. Find the user in your database by email.
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // Define a type for the user object that explicitly includes the password field.
        // This resolves the TypeScript error by informing TypeScript that 'user' will have 'password'.
        type UserWithPassword = typeof user & { password?: string | null };

        // Cast the fetched user object to the new type.
        const typedUser = user as UserWithPassword;

        // 2. If user not found, authentication fails.
        // Signup for new users with email/password will happen via a separate API route.
        if (!typedUser) {
          console.warn(
            `Credentials login attempt for non-existent user: ${credentials.email}`
          );
          return null;
        }

        // 3. Compare the provided password with the stored hashed password.
        const isPasswordValid =
          typedUser.password &&
          (await compare(credentials.password, typedUser.password));

        if (!isPasswordValid) {
          console.warn(
            `Invalid password attempt for user: ${credentials.email}`
          );
          return null; // Invalid password
        }

        // 4. If authentication is successful, return the user object.
        return {
          id: typedUser.id,
          email: typedUser.email,
          name: typedUser.name, // Make sure name is stored during signup
          image: typedUser.image,
        };
      },
    }),

    // Will add other providers like FacebookProvider here if needed:
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    // }),
  ],

  // 3. Pages Configuration:
  // Custom URLs for Auth.js's internal pages (e.g., login, sign out, error).
  // This allows you to use your application's custom UI for these flows.
  pages: {
    signIn: '/login', // Redirects to this page for all sign-in attempts.
    // signOut: "/auth/signout", // Optional: Custom sign-out page.
    // error: "/auth/error",     // Optional: Custom error page (error code passed as query param).
    // newUser: "/onboarding",   // Optional: Redirects new users after their first sign-in.
  },

  // 4. Session Configuration:
  // Defines how user sessions are managed and stored.
  session: {
    strategy: 'jwt', // Use JSON Web Tokens (JWT) for session management.
    // JWT strategy is recommended for Next.js App Router and serverless environments.
    // It stores session data in a secure, signed, HTTP-only cookie.
    // maxAge: 30 * 24 * 60 * 60, // Optional: Session will last for 30 days (default).
    // updateAge: 24 * 60 * 60, // Optional: Session refreshed after 24 hours (default).
  },

  // 5. Callbacks:
  // Functions that allow you to customize behavior or extend data when certain events occur.
  callbacks: {
    // Session callback: Executed whenever a session is checked or created.
    // This is crucial for adding custom data (like the user's database ID) to the session object,
    // making it accessible in client-side components and server-side tRPC procedures.
    async session({ session, user, token }) {
      if (session.user) {
        // If JWT strategy is used, the user's ID is typically in `token.sub`.
        // If database strategy is used, it's in `user.id`.
        // We ensure 'id' is added to the session.user object for type safety.
        (session.user as any).id = token?.sub || user?.id; // Asserting as 'any' to add custom property
      }
      return session;
    },
    // Other callbacks (e.g., `signIn`, `redirect`, `jwt`) can be defined here if needed
    // for more advanced customization of the authentication flow.
  },

  // 6. Secret:
  // A cryptographic secret string used to sign session cookies and JWTs.
  // This value must be kept secret and should be a long, randomly generated string.
  // It is essential for the security of your authentication system.
  secret: process.env.AUTH_SECRET,

  // 7. Debug Mode:
  // Enables verbose logging for Auth.js, which is very helpful during development
  // for understanding authentication flow and troubleshooting issues.
  debug: process.env.NODE_ENV === 'development',
});

// Export the NextAuth handler for both GET and POST HTTP methods.
// Next.js App Router API routes require explicit exports for methods.
// Auth.js uses both GET (e.g., for /api/auth/session) and POST (e.g., for /api/auth/signin).
export { handler as GET, handler as POST };
