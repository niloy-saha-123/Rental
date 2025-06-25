// src/components/common/SearchBar.tsx
"use client"; // This component needs client-side interactivity for scroll detection, state, and click events

import React, { useState, useEffect, useRef } from 'react'; // Import necessary hooks

// Helper component for the Search Icon (magnifying glass)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-6 h-6 text-white" // Tailwind classes for size and color
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle> {/* Circle for the main lens */}
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line> {/* Line for the handle */}
  </svg>
);

export default function SearchBar() {
  // States for input values (same as before)
  const [location, setLocation] = useState("Current Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // States for collapse/expand behavior
  const [isCollapsed, setIsCollapsed] = useState(false); // True when the full bar is hidden
  const [lastScrollY, setLastScrollY] = useState(0); // To track scroll direction (up or down)
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false); // True if the user clicked the icon to expand

  // Refs to get direct access to the DOM elements for click-outside detection
  const searchBarRef = useRef<HTMLDivElement>(null); // Ref for the main search bar div

  // Effect for scroll detection and collapse/reappear behavior
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const collapseThreshold = 5;// User scrolls down 5px to trigger collapse.
        const expandThreshold = 50; //User scrolls up within 50px of top to trigger expand.
      // Only auto-collapse/reappear if the user hasn't manually expanded it
      if (isManuallyExpanded) {
        if (currentScrollY === 0) { // If manually expanded and user scrolls to exact top
          setIsCollapsed(false);
          setIsManuallyExpanded(false); // Reset the manual flag
        }
        // Do nothing else, bar remains open due to manual override
        setLastScrollY(currentScrollY);
        return; // Exit handleScroll early
      }

      // Auto-collapse/reappear logic (only runs if not manually expanded)
      if (currentScrollY > lastScrollY && currentScrollY > collapseThreshold) {
        // Scrolling down and passed a small threshold -> Collapse
        setIsCollapsed(true);
      } else if (currentScrollY < lastScrollY && currentScrollY < expandThreshold) {
        // Scrolling up AND within the expand threshold -> Expand
        setIsCollapsed(false);
      } else if (currentScrollY === 0) {
        // Crucial: If scrolled to the absolute top, always expand and reset manual override
        setIsCollapsed(false);
        setIsManuallyExpanded(false); // Ensure this is false for auto-collapse to work on next scroll down
      }
        setLastScrollY(currentScrollY); // Update last scroll position for next check
      }

    // Add scroll event listener when the component mounts
    window.addEventListener('scroll', handleScroll);

    // Cleanup function: Remove the event listener when the component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isManuallyExpanded]); // Re-run effect if scroll position or manual expand state changes

  // Function to handle clicks on the collapsed search icon
  const handleExpandClick = () => {
    setIsManuallyExpanded(true); // Set flag to prevent auto-collapse after manual expand
    setIsCollapsed(false);       // Force the bar to expand
    // Smoothly scroll the window to the top, so the full bar is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tailwind classes for the main search bar container
  const containerClasses = `
    fixed top-[64px] left-1/2 -translate-x-1/2 w-full max-w-4xl p-2 bg-white rounded-xl shadow-xl border border-gray-200 z-40
    transition-all duration-300 ease-in-out /* For smooth animation */
    ${isCollapsed ? 'opacity-0 scale-95 translate-y-[-100px] pointer-events-none' : 'opacity-100 scale-100 translate-y-0'} /* Collapse/expand animation */
    ${isManuallyExpanded ? 'block' : ''} /* Ensure it's always visible when manually expanded */
  `;

  // Tailwind classes for the collapsed search icon
  const collapsedIconClasses = `
    fixed top-[64] right-8 bg-[#766be0] p-3 rounded-full shadow-lg cursor-pointer z-50
    transition-all duration-300 ease-in-out /* For smooth animation */
    ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'} /* Show/hide animation */
  `;

  return (
    <>
      {/* Collapsed Search Icon (only visible when the main bar is collapsed) */}
      <div className={collapsedIconClasses} onClick={handleExpandClick}>
        <SearchIcon />
      </div>

      {/* Main Search Bar (visible when not collapsed, or when manually expanded) */}
      {/* Attach ref to this div for future use if needed, and apply dynamic classes */}
      <div ref={searchBarRef} className={containerClasses}>
        {/* Partitioned Input Fields - Using Flexbox for layout */}
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {/* Location Box */}
          <div className="flex-1 p-1 border-b sm:border-b-0 sm:border-r border-gray-200">
            <h3 className="font-serif text-lg text-gray-800 mb-0.5">Location</h3>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Current Location"
              className="w-full p-0.5 text-gray-700 focus:outline-none font-sans"
            />
          </div>

          {/* Search Bar Box (flex-[2] makes it twice as wide) */}
          <div className="flex-[2] p-2 border-b sm:border-b-0 sm:border-r border-gray-200">
            <h3 className="font-serif text-lg text-gray-800 mb-1">Search Object</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for objects..."
              className="w-full p-1 text-gray-700 focus:outline-none font-sans"
            />
          </div>

          {/* From Date Box */}
          <div className="flex-1 p-2 border-b sm:border-b-0 sm:border-r border-gray-200">
            <h3 className="font-serif text-lg text-gray-800 mb-1">From</h3>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full p-1 text-gray-700 focus:outline-none font-sans"
            />
          </div>

           {/* To Date Box */}
           <div className="flex-1 p-2"> {/* No border-r on the last item */}
             <h3 className="font-serif text-lg text-gray-800 mb-1">To</h3>
             <input
               type="date"
               value={dateTo}
               onChange={(e) => setDateTo(e.target.value)} // <-- CORRECTED LINE 141
               className="w-full p-1 text-gray-700 focus:outline-none font-sans"
             />
           </div>
           {/* NEW: Search Button Partition */}
        {/* This button will be positioned at the end of the flex row */}
        <button className="flex-none w-14 h-14 bg-[#766be0] rounded-xl shadow-md flex items-center justify-center cursor-pointer hover:bf-purple-700 transition-colors">
            <SearchIcon /> {/* The magnifying glass icon */}
        </button>


        </div>
      </div>
    </>
  );
}