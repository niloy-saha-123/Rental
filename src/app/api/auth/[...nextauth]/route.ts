/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 * @description This file serves as the central API route for all authentication-related requests
 * handled by Auth.js. It configures authentication providers (e.g., Google, Credentials),
 * integrates with the Prisma database for user and session storage, and manages session creation.
 */

// Core NextAuth library for handling authentication flows.
import NextAuth from 'next-auth';
// Import AuthOptions type for explicit typing of the authentication configuration.
import { AuthOptions } from 'next-auth'; // NEW: Import AuthOptions type

// PrismaAdapter connects Auth.js to our database via Prisma ORM.
import { PrismaAdapter } from '@auth/prisma-adapter';

// Prisma client instance, allowing database interactions.
import { db } from '@/lib/db';

// --- Authentication Providers ---
// Each provider defines a method by which users can authenticate (e.g., Google, Facebook, Credentials).

// Google Provider: Enables authentication via Google OAuth.
import GoogleProvider from 'next-auth/providers/google';

// Credentials Provider: Enables traditional email/password login.
import CredentialsProvider from 'next-auth/providers/credentials';
// Library for securely hashing and comparing passwords.
// Because we are not storing passwords in plain text,
// we use bcryptjs to hash passwords during signup and compare them during login.
import { compare } from 'bcryptjs'; // For comparing passwords during login

// This object defines how authentication requests are processed,
// what providers are enabled, and how user data is managed.
// It is exported so it can be used by `getServerSession` in tRPC context and middleware.
export const authOptions: AuthOptions = {
  // NEW: Explicitly type authOptions as AuthOptions
  // 1. Adapter Configuration:
  // Specifies the database adapter for persisting user, account, and session data.
  // PrismaAdapter leverages your existing Prisma schema to manage Auth.js's required tables.
  adapter: PrismaAdapter(db),

  // 2. Providers Array:
  // A list of authentication methods available to your users.
  // Each provider needs specific configuration (e.g., client IDs/secrets).
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
        // Actual signup data (name, birthday, etc.) will be handled by a separate tRPC signup API route.
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Missing credentials, authentication fails.
        }

        // 1. Find the user in your database by email.
        const user = await db.user.findUnique({
          where: { email: credentials.email },
          // Include fields needed for session/token if not all are automatically returned
          // select: { id: true, email: true, name: true, image: true, password: true, birthday: true, phoneNumber: true }
        });

        // Define a type for the user object that explicitly includes the password field for comparison.
        type UserWithPassword = typeof user & { password?: string | null };
        const typedUser = user as UserWithPassword;

        // 2. If user not found, authentication fails for this provider.
        // New user sign-up with email/password is handled by the `auth.signup` tRPC mutation.
        if (!typedUser) {
          console.warn(
            `Credentials login attempt for non-existent user: ${credentials.email}`
          );
          return null;
        }

        // 3. Compare the provided password with the stored hashed password using bcryptjs.
        const isPasswordValid =
          typedUser.password &&
          (await compare(credentials.password, typedUser.password));

        if (!isPasswordValid) {
          console.warn(
            `Invalid password attempt for user: ${credentials.email}`
          );
          return null; // Invalid password, authentication fails.
        }

        // 4. If authentication is successful, return the user object.
        // This object's properties will be used to populate the JWT and session.
        return {
          id: typedUser.id,
          email: typedUser.email,
          name: typedUser.name,
          image: typedUser.image,
          // Include additional fields from the User model to make them available in the session/JWT
          birthday: typedUser.birthday,
          phoneNumber: typedUser.phoneNumber,
        };
      },
    }),
  ],

  // 3. Pages Configuration:
  // Custom URLs for Auth.js's internal pages (e.g., login, sign out, error).
  // This allows you to use your application's custom UI for these flows.
  pages: {
    signIn: '/login', // Redirects all sign-in attempts to your custom login page.
    // signOut: "/auth/signout", // Optional: Custom sign-out page.
    // error: "/auth/error",     // Optional: Custom error page (error code passed as query param).
    // newUser: "/onboarding",   // Optional: Redirects new users after their first sign-in.
  },

  // 4. Session Configuration:
  // Defines how user sessions are managed and stored.
  session: {
    strategy: 'jwt', // Uses JSON Web Tokens (JWT) for session management.
    // JWT strategy is recommended for Next.js App Router and serverless environments.
    // It stores session data in a secure, signed, HTTP-only cookie.
    // maxAge: 30 * 24 * 60 * 60, // Optional: Session will last for 30 days (default).
    // updateAge: 24 * 60 * 60, // Optional: Session refreshed after 24 hours (default).
  },

  // 5. Callbacks:
  // Functions that allow you to customize behavior or extend data within the authentication flow.
  callbacks: {
    /**
     * @function jwt
     * @description Executed whenever a JWT is created or updated. This is where you add
     * custom properties from your user object (obtained during `authorize`) to the JWT token.
     * The token is stored in the session cookie.
     * @param {object} params - Parameters including `token`, `user`, `account`, `profile`, `isNewUser`.
     * @returns {Promise<JWT>} The modified JWT token.
     */
    async jwt({ token, user }) {
      if (user) {
        // 'user' object is populated from the `authorize` function's return value.
        // Add all desired properties from the user to the token for client-side access.
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image; // Assuming 'image' comes from Auth.js User object
        // Add custom properties from your User model:
        (token as any).birthday = (user as any).birthday;
        (token as any).phoneNumber = (user as any).phoneNumber;
      }
      return token;
    },

    /**
     * @function session
     * @description Executed whenever a session is checked or created. This is crucial for
     * exposing custom data from the JWT token to the client-side session object (via `useSession`).
     * @param {object} params - Parameters including `session`, `user`, `token`.
     * @returns {Promise<Session>} The modified session object.
     */
    async session({ session, token }) {
      if (session.user) {
        // Populate the session.user object with properties from the JWT token.
        // 'token.sub' is the standard JWT claim for subject (usually user ID).
        session.user.id = token.sub || token.id; // Use token.id or token.sub (standard JWT claim)
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture; // 'picture' is standard JWT claim for image URL
        // Assign custom properties from the token to the session user object.
        (session.user as any).birthday = (token as any).birthday;
        (session.user as any).phoneNumber = (token as any).phoneNumber;
      }
      return session;
    },
  },

  // 6. Secret:
  // A cryptographic secret string used to sign session cookies and JWTs.
  // This value must be kept absolutely secret and should be a long, randomly generated string.
  // It is essential for the security of your authentication system.
  secret: process.env.AUTH_SECRET,

  // 7. Debug Mode:
  // Enables verbose logging for Auth.js. Highly recommended during development
  // for understanding authentication flow and troubleshooting issues.
  // Should be disabled in production.
  debug: process.env.NODE_ENV === 'development',
};

// Export the NextAuth handler for both GET and POST HTTP methods.
// Next.js App Router API routes require explicit exports for methods.
// Auth.js uses both GET (e.g., for /api/auth/session) and POST (e.g., for /api/auth/signin).
export default NextAuth(authOptions);

// This re-export is necessary for Next.js App Router to correctly expose GET and POST methods.
export const { GET, POST } = NextAuth(authOptions);
