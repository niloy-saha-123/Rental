// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import SearchBar from '@/components/common/Searchbar'; // Import your new SearchBar component (adjusted path)

export default function Home() {
  return (
    // Replaced inline style with Tailwind classes for padding, display, flex-direction, min-height, font and background
    <main className='p-8 flex flex-col items-center min-h-[calc(100vh-120px)] font-sans bg-gray-50'>
      {/* The SearchBar component, which is now fixed at the top*/}
      <SearchBar />
      {/* Spacer div to push main content down, considering fixed search bar height */}
      {/* Adjust pt-xxl based on the actual height of your search bar + desired spacing */}
      <div className='pt-44 sm:pt-48 md:pt-52'></div>{' '}
      {/* Placeholder for adequate spacing */}
      {/* Placeholder for Populated Objects */}
      <section className='mt-12 w-full max-w-6xl'>
        {' '}
        {/* Replaced inline styles with Tailwind classes */}
        <h2 className='text-left mb-6 text-3xl font-serif text-gray-800'>
          Listings Nearby
        </h2>{' '}
        {/* Changed text, added font-serif, text-color, size */}
        {/* Tailwind Grid classes: grid, grid-cols-auto-fill-minmax-250 (custom class below), gap-6 */}
        <div className='grid grid-cols-auto-fill-minmax-250 gap-6'>
          {Array.from({ length: 12 }).map(
            (
              _,
              index // Creates 12 items for scrolling
            ) => (
              <div
                key={index}
                className='border border-gray-200 rounded-lg p-4 bg-white shadow-md'
              >
                <h3 className='font-serif text-xl mb-2 text-gray-800'>
                  {index % 2 === 0 ? 'PS5 Console' : 'Electric Drill'}
                </h3>{' '}
                {/* Added font-serif, text-color */}
                <p className='text-sm text-gray-600 mb-2'>
                  {index % 2 === 0
                    ? 'Gaming console with controllers.'
                    : 'Heavy duty drill with bits.'}
                </p>
                <p className='font-bold text-lg text-teal-600'>
                  ${index % 2 === 0 ? 20 : 15}/day
                </p>{' '}
                {/* Added text-teal-600 */}
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}
