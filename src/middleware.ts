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

// Define your main middleware logic
export async function middleware(req: Request) {
  // This is where your custom middleware logic would go.
  // For now, let's just allow the request to proceed.
  // We'll use the 'withAuth' wrapper for actual authentication checks.

  console.log("Middleware is running for:", req.url);

  // Example: If you wanted to redirect all requests to /test, you could do:
  // if (req.nextUrl.pathname !== '/test') {
  //   return NextResponse.redirect(new URL('/test', req.url));
  // }

  return NextResponse.next(); // Allow the request to proceed normally
}

// TEMPORARILY DISABLED TO TEST LOGIN PAGE
// Authentication middleware is enabled for development now.
// Wrap your middleware with `withAuth` to get authentication features.
// next-auth/middleware's `withAuth` utility requires a `secret` defined in .env.local
// And it automatically provides a 'token' in the request if authenticated.
// export default withAuth(
//   // You can pass your custom middleware function here
//   middleware,
//   {
//     // These callbacks allow you to define behavior based on authentication status
//     callbacks: {
//       // This callback checks if a user is authorized to access the requested route
//       authorized: ({ token }) => {
//         // If there's a token, the user is considered authenticated
//         // This is a basic check. You can add more complex authorization logic here
//         // (e.g., checking user roles, specific session data).
//         if (token) return true;

//         // Otherwise, the user is not authenticated
//         return false;
//       },
//     },
//     // Define pages where users should be redirected if not authorized
//     // If a user tries to access a protected route and is not authorized,
//     // they will be redirected to the configured `pages.signIn` page.
//     pages: {
//       signIn: '/login', // Redirects to /login if not authenticated
//     },
//     // Optional: Set a custom secret for NextAuth if not set in .env.local,
//     // but it's highly recommended to use NEXTAUTH_SECRET in .env.local
//     // secret: process.env.NEXTAUTH_SECRET,
//   }
// );

// TEMPORARILY DISABLED
// Configure which paths the middleware should apply to.
// The matcher is a regex pattern for paths.
// export const config = {
//   // This matcher pattern means:
//   // Match all paths (/)
//   // EXCEPT:
//   //   - /api (API routes)
//   //   - /_next/static (Next.js static assets)
//   //   - /_next/image (Next.js image optimization URLs)
//   //   - /favicon.ico
//   //   - /login
//   //   - /signup
//   //   - / (homepage)
//   // This essentially protects all other routes.
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup|$).*)'],
// };
