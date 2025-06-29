/**
 * @file src/app/layout.tsx
 * @description This is the root layout for the entire Next.js application.
 * It defines the outermost HTML structure, including the <html> and <body> tags.
 * It serves as a wrapper for all pages and provides global elements like headers, footers,
 * and crucially, it integrates client-side providers (like authentication and tRPC)
 * by wrapping the application with the `Providers` component.
 */

import type { Metadata } from 'next'; // Imports Metadata type for SEO.
import { Inter, Playfair_Display } from 'next/font/google'; // Import fonts, including Playfair_Display.
import '@/app/global.css'; // Imports global CSS styles.
import Header from '../components/layout/Header'; // Imports Header component.

// Import the Providers Client Component
import Providers from './providers'; // Imports our client-side Providers wrapper component.

//Define font objects. Playfair Display for headings, Inter for body/UI
// `display: 'swap'` loads quickly; `variable: '--font-name'` makes it accessible in CSS
const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair', // Defines a CSS variable for Playfair font.
});
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // Defines a CSS variable for Inter font.
});

// Defines metadata for the application (e.g., for SEO).
export const metadata: Metadata = {
  title: 'Rental', // Title displayed in the browser tab.
  description: 'Rent anything you need, lend anything you own.', // Meta description for search engines.
};

// Default export function for the RootLayout component.
// It receives 'children' which represents the content of the current page/nested layout.
export default function RootLayout({
  children, // Content to be rendered within this layout.
}: {
  children: React.ReactNode; // Defines children as a React node.
}) {
  return (
    <html lang='en' className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning={true}>
        {/* Wrap the main content with the Providers Client Component */}
        {/* This establishes the client-server boundary correctly for context providers */}
        <Providers>
          {/* Wraps the entire application with client-side context providers. */}
          <Header /> {/* Header component, now active. */}
          <main>{children}</main>
          {/* Main content area, renders page.tsx content. */}
          <footer className='p-4 bg-gray-100 text-center text-gray-700'>
            Your Footer Content Here {/* Footer content, now active. */}
          </footer>
        </Providers>
      </body>
    </html>
  );
}
