// src/app/page.tsx
"use client";

import React, { useState } from 'react';

export default function Home() {
  const [location, setLocation] = useState("Current Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    // Replaced inline style with Tailwind classes for padding, display, flex-direction, min-height, font and background
    <main className="p-8 flex flex-col items-center min-h-[calc(100vh-120px)] font-sans bg-gray-50">

      {/* Large "Dhar" heading REMOVED as discussed */}

      {/* 4 Horizontal Expandable Boxes */}
      {/* Replaced inline styles with Tailwind classes for layout, gap, width, wrap, margin */}
      <div className="flex justify-center gap-4 w-full max-w-5xl flex-wrap mt-8 mb-12">
        {/* Location Box */}
        {/* Replaced inline styles with Tailwind classes for border, padding, rounded, flex, min-width, shadow, background */}
        <div className="border border-gray-300 p-4 rounded-lg flex-1 min-w-[150px] shadow-md bg-white">
          <h3 className="font-serif text-lg mb-2 text-gray-800">Location</h3> {/* Added font-serif, text-color */}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            // Replaced inline input styles with Tailwind classes for width, padding, border, rounded, focus styles
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
          />
        </div>

        {/* Search Bar Box */}
        <div className="border border-gray-300 p-4 rounded-lg flex-1 min-w-[150px] shadow-md bg-white">
          <h3 className="font-serif text-lg mb-2 text-gray-800">Search Object</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for objects..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
          />
        </div>

        {/* From Date Box */}
        <div className="border border-gray-300 p-4 rounded-lg flex-1 min-w-[120px] shadow-md bg-white">
          <h3 className="font-serif text-lg mb-2 text-gray-800">From</h3>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
          />
        </div>

        {/* To Date Box */}
        <div className="border border-gray-300 p-4 rounded-lg flex-1 min-w-[120px] shadow-md bg-white">
          <h3 className="font-serif text-lg mb-2 text-gray-800">To</h3>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
          />
        </div>
      </div>

      {/* Placeholder for Populated Objects */}
      <section className="mt-12 w-full max-w-6xl"> {/* Replaced inline styles with Tailwind classes */}
        <h2 className="text-left mb-6 text-3xl font-serif text-gray-800">Listings Nearby</h2> {/* Changed text, added font-serif, text-color, size */}
        {/* Tailwind Grid classes: grid, grid-cols-auto-fill-minmax-250 (custom class below), gap-6 */}
        <div className="grid grid-cols-auto-fill-minmax-250 gap-6">
          {Array.from({ length: 12 }).map((_, index) => ( // Creates 12 items for scrolling
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-md">
              <h3 className="font-serif text-xl mb-2 text-gray-800">{index % 2 === 0 ? 'PS5 Console' : 'Electric Drill'}</h3> {/* Added font-serif, text-color */}
              <p className="text-sm text-gray-600 mb-2">{index % 2 === 0 ? 'Gaming console with controllers.' : 'Heavy duty drill with bits.'}</p>
              <p className="font-bold text-lg text-teal-600">${index % 2 === 0 ? 20 : 15}/day</p> {/* Added text-teal-600 */}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}