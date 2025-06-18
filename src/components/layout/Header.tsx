// src/components/layout/Header.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

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
    <header className="p-4 bg-[#03A6A1] text-white flex justify-between items-center relative font-serif shadow-lg">

      {/* Top Left - Home Icon (SVG) */}
      <a href="/" className="text-white no-underline hover:opacity-80 transition-opacity">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24" // Defines the coordinate system for the SVG
          className="w-8 h-8" // Tailwind classes: w-8 sets width to 32px, h-8 sets height to 32px (bigger icon)
          stroke="currentColor" // Sets the outline color to the current text color (which is white from the header)
          strokeWidth="2" // Sets the thickness of the outline
          fill="#006666" // Sets the fill color (inside) to a darker teal/green for the "green inside" effect
          strokeLinecap="round" // Styles for the stroke (rounded caps)
          strokeLinejoin="round" // Styles for the stroke (rounded joins)
        >
          {/* Path data for the house shape - this draws the icon */}
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> {/* Main house shape */}
          <polyline points="9 22 9 12 15 12 15 22"></polyline> {/* Door/window part of the house */}
        </svg>
      </a>

      {/* Middle - Dhar text */}
      <div className="text-2xl font-bold absolute left-1/2 -translate-x-1/2">Dhar</div>

      {/* Top Right - Hamburger Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="bg-transparent border-none text-white text-3xl cursor-pointer p-2 focus:outline-none ml-auto"
      >
        &#9776;
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-full right-0 bg-gray-800 text-white border border-gray-700 rounded-lg min-w-[200px] z-50 shadow-xl overflow-hidden"
        >
          <ul className="list-none m-0 p-0">
            <li className="p-3 border-b border-gray-700 last:border-b-0">
              <a href="/help-center" className="text-white no-underline block hover:text-teal-300 transition-colors">
                ? Help Center
              </a>
            </li>
            <li className="p-3 border-b border-gray-700 last:border-b-0">
              <a href="/lend" className="text-white no-underline block hover:text-teal-300 transition-colors">
                Become a lender
              </a>
            </li>
            <li className="p-3">
              <a href="/change-distance" className="text-white no-underline block hover:text-teal-300 transition-colors">
                Change distance (radius)
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}



    