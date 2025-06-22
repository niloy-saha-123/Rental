/**
 * @file src/app/providers.tsx
 * @description This is a client-side component specifically designed to aggregate and provide
 * all necessary React Context providers (like Auth.js's SessionProvider and tRPC's API provider)
 * to the rest of the application. By separating these into a "use client" component,
 * it correctly establishes the client-server boundary, preventing React Context errors
 * when rendered within a Server Component root layout.
 */

'use client'; // This explicitly marks this file as a Client Component

import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/lib/trpc/client'; // Note the .tsx extension

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // These providers require client-side execution.
    // They wrap your entire application to make session and tRPC available.
    <TRPCReactProvider>
      <SessionProvider>{children}</SessionProvider>
    </TRPCReactProvider>
  );
}
