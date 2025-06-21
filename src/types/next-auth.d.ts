/**
 * @file src/types/next-auth.d.ts
 * @description This file extends the default NextAuth.js (Auth.js) types for Session and JWT.
 * It allows you to add custom properties from your User model (e.g., database ID, birthday, phone number)
 * to the session object that is accessible on the client-side (`useSession`) and within JWTs.
 */

import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   * Extends the default session user to include custom properties from our User model.
   */
  interface Session {
    user: {
      id: string; // User's database ID
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // NEW: Custom properties from our User model
      birthday?: Date | null;
      phoneNumber?: string | null;
    } & DefaultSession['user'];
  }

  /**
   * The `user` object passed to the `session` callback and available on the `session` object itself.
   * Extends the default User interface to include custom properties.
   */
  interface User {
    id: string; // User's database ID
    birthday?: Date | null;
    phoneNumber?: string | null;
  }
}

declare module 'next-auth/jwt' {
  /**
   * The `JWT` token object.
   * Extends the default JWT object to include custom properties that we add in the JWT callback.
   */
  interface JWT {
    id?: string; // User's database ID
    email?: string | null;
    name?: string | null;
    picture?: string | null; // For image URL
    // NEW: Custom properties from our User model
    birthday?: Date | null;
    phoneNumber?: string | null;
  }
}
