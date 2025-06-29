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

// This is the core middleware function.
export default withAuth(
  // The `middleware` function itself.
  // It receives the request and an event object.
  function middleware(req) {
    const token = req.nextauth.token; // The authentication token/session data
    const pathname = req.nextUrl.pathname; // The current request path

    // Log the path and token for debugging in development.
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Middleware: Path: ${pathname}, Token:`,
        token ? 'present' : 'absent'
      );
      // console.log("Middleware Token:", token); // Uncomment for full token data in dev
    }

    // --- Onboarding Flow Enforcement ---
    // If the user is authenticated (token exists)
    // AND they are missing required profile details (e.g., birthday, phone number)
    // AND they are NOT already on the onboarding page or Auth.js API routes,
    // then redirect them to the onboarding page.

    const isAuthRoute =
      pathname.startsWith('/login') || pathname.startsWith('/signup');
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    const isApiAuthRoute = pathname.startsWith('/api/auth'); // Auth.js internal API routes

    // TODO: The token might not have `birthday` and `phoneNumber` directly.
    // You'll need to fetch the full user profile in `protectedProcedure`'s context or a separate API.
    // For now, this check is a placeholder and assumes `birthday` and `phoneNumber` might be on the token if added there.
    // A more robust check might involve hitting a tRPC endpoint for user details.
    // const userHasMissingDetails =
    //   token && (!token.birthday || !token.phoneNumber); // Commented for now, might need later
    // For a robust check, you might fetch user from DB in middleware's `authorized` callback
    // or use a `user.getProfile` procedure in `createContext` and pass `isProfileComplete`

    // IMPORTANT: To make this robust, the 'birthday' and 'phoneNumber' need to be added to the JWT token
    // in your `src/app/api/auth/[...nextauth]/route.ts` callbacks.jwt or session.
    // Add these to your JWT and Session callbacks to make them available here.
    // For now, we'll assume they will be there based on future Auth.js callback customization.

    // If logged in, not on auth/onboarding routes, and profile is incomplete:
    if (
      token &&
      !isAuthRoute &&
      !isOnboardingRoute &&
      !isApiAuthRoute /* && userHasMissingDetails */
    ) {
      // NOTE: The `userHasMissingDetails` check needs real data on the token or a separate check.
      // For testing, you can uncomment this redirect temporarily to see the onboarding page.
      // return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // --- Route Protection Logic ---
    // Define paths that require authentication.
    const protectedPaths = [
      '/account',
      '/my-gear',
      '/onboarding', // Onboarding is itself a protected route (requires login)
      // Add other protected paths here, e.g., "/gear/new", "/bookings"
    ];

    // Check if the current path starts with any of the protected paths.
    const isProtectedPath = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    // If the user is NOT authenticated (no token) AND tries to access a protected path,
    // redirect them to the login page.
    if (!token && isProtectedPath) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow the request to proceed if no redirect conditions are met.
    return NextResponse.next();
  },
  {
    // The `callbacks.authorized` function determines if a user is authenticated.
    // It's called before the `middleware` function above.
    callbacks: {
      async authorized({ token /*, req*/ }) {
        // Return `true` if the token exists (user is authenticated), `false` otherwise.
        // This is a simple check. More complex authorization (e.g., role-based) can go here.
        // Also, this is where you could potentially fetch full user details for profile completeness check.
        // const user = token ? await db.user.findUnique({ where: { id: token.sub } }) : null;
        // if (user && (!user.birthday || !user.phoneNumber)) {
        //   return req.nextUrl.pathname.startsWith('/onboarding'); // Only allow if on onboarding page
        // }
        return !!token;
      },
    },
    // pages: { signIn: '/login' }, // Can be used for automatic redirect if authorized returns false.
  }
);

// Configure which paths the middleware should apply to.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)'],
};
