/**
 * @file src/app/layout.tsx
 * @description This is the root layout for the entire Next.js application.
 * It defines the outermost HTML structure, including the <html> and <body> tags.
 * It serves as a wrapper for all pages and provides global elements like headers, footers,
 * and crucially, it integrates client-side providers (like authentication and tRPC)
 * by wrapping the application with the `Providers` component.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import Header from "@/components/layout/Header"; // Commented out: Header component not yet created
// import Footer from "@/components/layout/Footer"; // Commented out: Footer component not yet created

// Import the Providers Client Component
import Providers from './providers'; // Import the new Providers component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gear Up Rentals',
  description: 'Rent the gear you need, from people you trust.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        {/* Wrap the main content with the Providers Client Component */}
        {/* This establishes the client-server boundary correctly for context providers */}
        <Providers>
          <div className='flex flex-col min-h-screen'>
            {/* <Header /> Removed temporarily as component is not yet created */}
            <main className='flex-grow'>{children}</main>
            {/* <Footer /> Removed temporarily as component is not yet created */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
