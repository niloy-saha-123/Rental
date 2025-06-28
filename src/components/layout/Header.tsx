// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && buttonRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="p-4 bg-[#766be0] text-white flex justify-between items-center relative font-serif shadow-lg z-50">

      {/* Top Left - Home Icon (SVG) */}
      <a href="/" className="flex items-center gap-2 text-white no-underline hover:opacity-80 transition-opacity">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24" // Defines the coordinate system for the SVG
          className="w-8 h-8" // Tailwind classes: w-8 sets width to 32px, h-8 sets height to 32px (bigger icon)
          stroke="currentColor"
          fill="none" // Sets the outline color to the current text color (which is white from the header)
          strokeWidth="2" // Sets the thickness of the outline
          strokeLinecap="round" // Styles for the stroke (rounded caps)
          strokeLinejoin="round" // Styles for the stroke (rounded joins)
        >

        
          {/* Path data for the house shape - this draws the icon */}
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> {/* Main house shape */}
          <polyline points="9 22 9 12 15 12 15 22"></polyline> {/* Door/window part of the house */}
        </svg>
        <span className="font-bold text-xl">Rental</span>
      </a>
      {/* Group Lend an Item button and Hamburger in a flex container on the right */}
      <div className="flex items-center gap-2 ml-auto">
        <Link href="/lend" className="mr-4 px-4 py-2 bg-white text-gray-800 rounded-full shadow-md hover:bg-gray-100 transition-colors flex items-center justify-center font-sans text-sm">
          Lend an Item
        </Link>
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="bg-white text-gray-800 w-10 h-10 rounded-full shadow-md flex items-center justify-center cursor-pointer focus:outline-none hover:bg-gray-100 transition-colors"
        >
          &#9776;
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          // Removed overflow-hidden from here
          className="absolute top-full right-0 mt-2 bg-white text-gray-800 border border-gray-300 rounded-lg min-w-[200px] z-50 shadow-xl"
        >
          {/* THE NEW ARROW/CARET: Two divs for fill and border (Corrected Technique) */}
          {/* Outer triangle (border color) - positioned slightly higher */}
          <div
            className="absolute -top-[10px] right-7 w-0 h-0"
            style={{
              borderLeft: '9px solid transparent',    // Transparent left border
              borderRight: '9px solid transparent',   // Transparent right border
              borderBottom: '9px solid #d1d5db',    // Solid border pointing UP (matches gray-300)
            }}
          ></div>
          {/* Inner triangle (white fill) - positioned slightly lower than border triangle */}
          <div
            className="absolute -top-2 right-7 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid white',     // Solid border pointing UP (white fill)
            }}
          ></div>

        
          
          <ul className="list-none m-0 p-0">
            <li className="p-3 border-b border-gray-300 last:border-b-0">
              <a href="/help-center" className="text-gray-800 no-underline block hover:text-purple-600 transition-colors">
                ? Help Center
              </a>
            </li>
            <li className="p-3 border-b border-gray-300 last:border-b-0">
              <Link href="/lend" className="text-gray-800 no-underline block hover:text-purple-600 transition-colors">
                Lend an item
              </Link>
            </li>
            <li className="p-3">
              <a href="/change-distance" className="text-gray-800 no-underline block  hover:text-purple-600 transition-colors">
                Change distance (radius)
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}



    