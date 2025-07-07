//src/components/ui/HamburgerButton.tsx 

import React from 'react';

interface HamburgerButtonProps {
  onClick: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
  ariaLabel?: string;
}

export default function HamburgerButton({ onClick, buttonRef, ariaLabel = 'Open menu' }: HamburgerButtonProps) {
  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className="bg-white text-gray-800 w-10 h-10 rounded-full shadow-md flex items-center justify-center cursor-pointer focus:outline-none hover:bg-gray-100 transition-colors"
      aria-label={ariaLabel}
    >
      &#9776;
    </button>
  );
} 