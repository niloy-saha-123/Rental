/**
 * @file src/middleware.ts
 * @description This file defines Next.js Middleware for handling route protection and authorization.
 * It intercepts incoming requests, checks for user authentication (session token), and redirects
 * unauthenticated users away from protected routes (e.g., dashboard pages). It also enforces
 * an onboarding flow for new users (e.g., social logins) who need to complete their profile.
 * It leverages Auth.js's `withAuth` utility for streamlined authentication checks.
 */

// The `withAuth` function wraps your middleware, providing authentication utilities.
import { withAuth } from 'next-auth/middleware';
// The `NextResponse` allows you to modify the response (e.g., redirect users).
import { NextResponse } from 'next/server';

// Authentication middleware is disabled for development. Uncomment the above block to re-enable.

// Configure which paths the middleware should apply to.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
}; 
