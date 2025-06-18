/**
 * @file src/lib/trpc/client.tsx
 * @description This file sets up the client-side tRPC client, enabling React components to
 * make type-safe API calls to the backend. It also integrates with React Query for
 * data fetching, caching, and state management, providing a seamless developer experience.
 * This file is marked as a "use client" component.
 */

'use client'; // This is a client component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';
// Import the superjson transformer for client-side serialization/deserialization.
import superjson from 'superjson';

import { AppRouter } from '@/server/routers/_app'; // Import your AppRouter type
import { createTRPCReact } from '@trpc/react-query'; // Use createTRPCReact for App Router

// Initialize tRPC client for React components.
// This 'api' object will be used in your frontend components to make API calls.
export const api = createTRPCReact<AppRouter>();

// TRPCReactProvider component to wrap your application with tRPC and React Query contexts.
// This makes the 'api' client and query caching available throughout your React component tree.
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  // Use useState to ensure QueryClient and tRPC client are created only once.
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        // httpBatchLink is recommended for performance, batching multiple requests into one.
        httpBatchLink({
          // The URL for your tRPC API endpoint.
          // For local development, a relative path is sufficient as it's on the same origin.
          // In production, this would be an absolute URL (e.g., "https://yourdomain.com/api/trpc").
          url: '/api/trpc',
          // NEW: Explicitly add the transformer to match the server-side configuration.
          transformer: superjson,
        }),
      ],
    })
  );
  return (
    // Wrap children with api.Provider (tRPC context) and QueryClientProvider (React Query context).
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
