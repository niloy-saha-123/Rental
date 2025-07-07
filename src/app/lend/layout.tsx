/**
 * @file src/app/lend/layout.tsx
 * @description Custom layout for the lend page that excludes the header
 * to provide a cleaner, more focused experience for the lending flow.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lend an Item - Dhar',
  description: 'List your item for rent on Dhar',
};

export default function LendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 