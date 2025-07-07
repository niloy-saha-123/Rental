"use client";

import Link from 'next/link';

interface HomeButtonProps {
  className?: string;
  showText?: boolean;
}

export default function HomeButton({ className = "", showText = true }: HomeButtonProps) {
  return (
    <Link 
      href="/" 
      className={`flex items-center gap-2 text-white no-underline hover:opacity-80 transition-opacity ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="w-8 h-8"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      {showText && <span className="font-bold text-xl">Rental</span>}
    </Link>
  );
} 