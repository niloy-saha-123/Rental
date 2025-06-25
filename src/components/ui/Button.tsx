// src/components/ui/Button.tsx
'use client'; // UI components are typically client components

import * as React from 'react';
// You would typically import cva and cn from shadcn/ui utils here
// import { cva, type VariantProps } from "class-variance-authority";
// import { cn } from "@/lib/utils";

// Minimal Button component for now
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Add any custom props here if needed, e.g., variant, size
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        className={`px-4 py-2 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${className || ''}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
