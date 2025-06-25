/**
 * @file src/app/api/auth/[...nextauth]/route.ts
 * @description This file serves as the central API route for all authentication-related requests
 * handled by Auth.js. It configures authentication providers (e.g., Google, Credentials),
 * integrates with the Prisma database for user and session storage, and manages session creation.
 */

// Core NextAuth library for handling authentication flows.
import NextAuth from 'next-auth';
// Import AuthOptions type for explicit typing of the authentication configuration.
import { AuthOptions } from 'next-auth'; // Imports the AuthOptions type from NextAuth for strong typing.

// PrismaAdapter connects Auth.js to our database via Prisma ORM.
import { PrismaAdapter } from '@auth/prisma-adapter'; // Imports the adapter to link Auth.js with Prisma.

// Prisma client instance, allowing database interactions.
import { db } from '@/lib/db'; // Imports our singleton PrismaClient instance.

// --- Authentication Providers ---
// Each provider defines a method by which users can authenticate (e.g., Google, Facebook, Credentials).

// Google Provider: Enables authentication via Google OAuth.
import GoogleProvider from 'next-auth/providers/google'; // Imports the Google OAuth provider.

// Credentials Provider: Enables traditional email/password login.
import CredentialsProvider from 'next-auth/providers/credentials'; // Imports the Credentials provider.
// Library for securely hashing and comparing passwords.
// Because we are not storing passwords in plain text,
// we use bcryptjs to hash passwords during signup and compare them during login.
import { compare } from 'bcryptjs'; // Imports the 'compare' function from bcryptjs for password verification.

// This object defines how authentication requests are processed,
// what providers are enabled, and how user data is managed.
// It is exported so it can be used by `getServerSession` in tRPC context and middleware.
export const authOptions: AuthOptions = {
  // Defines and exports the main Auth.js configuration object.
  // 1. Adapter Configuration:
  // Specifies the database adapter for persisting user, account, and session data.
  // PrismaAdapter leverages your existing Prisma schema to manage Auth.js's required tables.
  adapter: PrismaAdapter(db), // Connects Auth.js to our Prisma database client.

  // 2. Providers Array:
  // A list of authentication methods available to your users.
  // Each provider needs specific configuration (e.g., client IDs/secrets).
  providers: [
    GoogleProvider({
      // Configuration for Google OAuth.
      // Google OAuth Client ID and Client Secret, obtained from Google Cloud Console.
      // These identify your application to Google for authentication purposes.
      clientId: process.env.GOOGLE_CLIENT_ID as string, // Client ID from environment variables. 'as string' for TypeScript type assertion.
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // Client Secret from environment variables.
    }),

    // Credentials Provider for traditional email and password login.
    CredentialsProvider({
      // Configuration for email and password login.
      name: 'Credentials', // The name displayed for this provider (e.g., "Email and Password").
      credentials: {
        // Defines the input fields expected from the login form.
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
        // This function runs when a user attempts to log in with these credentials.
        if (!credentials?.email || !credentials?.password) {
          return null; // If email or password is missing, authentication fails.
        }

        // 1. Find the user in your database by email.
        const user = await db.user.findUnique({
          // Queries the database for a user matching the provided email.
          where: { email: credentials.email }, // Specifies the lookup condition.
        });

        // Defines a temporary type to include the 'password' field, which Prisma's default User type might omit for security.
        type UserWithPassword = typeof user & { password?: string | null };
        const typedUser = user as UserWithPassword; // Casts the user object to include the password property for comparison.

        // 2. If user not found, authentication fails for this provider.
        // New user sign-up with email/password is handled by the `auth.signup` tRPC mutation.
        if (!typedUser) {
          console.warn(
            `Credentials login attempt for non-existent user: ${credentials.email}`
          );
          return null; // Returns null if no user is found, indicating failed authentication.
        }

        // 3. Compare the provided password with the stored hashed password using bcryptjs.
        const isPasswordValid =
          typedUser.password && // Checks if a password exists for the user.
          (await compare(credentials.password, typedUser.password)); // Compares the plain-text password with the hashed one.

        if (!isPasswordValid) {
          console.warn(
            `Invalid password attempt for user: ${credentials.email}`
          );
          return null; // Returns null if the password does not match.
        }

        // 4. If authentication is successful, return the user object.
        // This object's properties will be used to populate the JWT and session.
        return {
          // Returns a user object if authentication is successful. This object is used by callbacks.
          id: typedUser.id, // User's unique ID.
          email: typedUser.email, // User's email.
          name: typedUser.name, // User's name.
          image: typedUser.image, // User's image URL.
          // Include additional fields from the User model to make them available in the session/JWT
          birthday: typedUser.birthday, // User's birthday.
          phoneNumber: typedUser.phoneNumber, // User's phone number.
        };
      },
    }),
  ],

  // 3. Pages Configuration:
  // Custom URLs for Auth.js's internal pages (e.g., login, sign out, error).
  // This allows you to use your application's custom UI for these flows.
  pages: {
    signIn: '/login', // Redirects all sign-in attempts to your custom login page (`/src/app/(auth)/login/page.tsx`).
    // signOut: "/auth/signout", // Optional: Custom sign-out page URL.
    // error: "/auth/error",     // Optional: Custom error page URL (error code passed as query param).
    // newUser: "/onboarding",   // Optional: Redirects new users after their first sign-in (e.g., for profile completion).
  },

  // 4. Session Configuration:
  // Defines how user sessions are managed and stored.
  session: {
    strategy: 'jwt', // Uses JSON Web Tokens (JWT) for session management.
    // JWT strategy is recommended for Next.js App Router and serverless environments.
    // It stores session data in a secure, signed, HTTP-only cookie.
    // maxAge: 30 * 24 * 60 * 60, // Optional: Session will last for 30 days (default is 30 days).
    // updateAge: 24 * 60 * 60, // Optional: Session refreshed after 24 hours (default is 24 hours).
  },

  // 5. Callbacks:
  // Functions that allow you to customize behavior or extend data within the authentication flow.
  callbacks: {
    /**
     * @function jwt
     * @description Executed whenever a JWT is created or updated. This is where you add
     * custom properties from your user object (obtained during `authorize`) to the JWT token.
     * The token is stored in the session cookie.
     * @param {object} params - Parameters including `token` (the JWT), `user` (the user object from provider), `account`, `profile`, `isNewUser`.
     * @returns {Promise<JWT>} The modified JWT token.
     */
    async jwt({ token, user }) {
      // This callback enhances the JWT token.
      if (user) {
        // If a user object is present (meaning a successful login/signup occurred).
        // 'user' object is populated from the `authorize` function's return value (for CredentialsProvider)
        // or from the provider's profile (for OAuth like GoogleProvider).
        // Add all desired properties from the user to the token for client-side access.
        token.id = user.id; // Adds user ID to the token.
        token.email = user.email; // Adds email to the token.
        token.name = user.name; // Adds name to the token.
        token.image = user.image; // Adds image URL to the token.
        // Add custom properties from our User model, asserting type for flexibility.
        (token as any).birthday = (user as any).birthday; // Adds birthday to the token.
        (token as any).phoneNumber = (user as any).phoneNumber; // Adds phone number to the token.
      }
      return token; // Returns the enhanced token.
    },

    /**
     * @function session
     * @description Executed whenever a session is checked or created. This is crucial for
     * exposing custom data from the JWT token to the client-side session object (via `useSession`).
     * @param {object} params - Parameters including `session` (the client-side session object), `user` (database user), `token` (the JWT token).
     * @returns {Promise<Session>} The modified session object.
     */
    async session({ session, token }) {
      // This callback shapes the client-side session.
      if (session.user) {
        // If the session contains user data.
        // Populate the session.user object with properties from the JWT token.
        // 'token.sub' is the standard JWT claim for subject (usually user ID).
        session.user.id = token.sub || token.id; // User ID from token.
        session.user.email = token.email; // Email from token.
        session.user.name = token.name; // Name from token.
        session.user.image = token.picture; // Image URL from token.
        // Assign custom properties from the token to the session user object, asserting type.
        (session.user as any).birthday = (token as any).birthday; // Birthday from token.
        (session.user as any).phoneNumber = (token as any).phoneNumber; // Phone number from token.
      }
      return session; // Returns the enhanced session object.
    },
    // Other callbacks (e.g., `signIn`, `redirect`) can be defined here for more advanced customization.
  },

  // 6. Secret:
  // A cryptographic secret string used to sign session cookies and JWTs.
  // This value must be kept absolutely secret and should be a long, randomly generated string.
  // It is essential for the security of your authentication system.
  secret: process.env.AUTH_SECRET, // Loads the secret from environment variables.

  // 7. Debug Mode:
  // Enables verbose logging for Auth.js. Highly recommended during development
  // for understanding authentication flow and troubleshooting issues.
  // Should be disabled in production.
  debug: process.env.NODE_ENV === 'development', // Enables debug logs only in development environment.
};

// --- FIX ---
// The previous export method caused conflicts with Next.js App Router.
// We now define the handler and then export its GET and POST methods directly.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; // Correctly exports named GET and POST methods.
