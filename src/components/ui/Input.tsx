/**
 * @file src/components/ui/Input.tsx
 * @description A reusable React Input component adhering to Shadcn UI's styling principles.
 * It provides consistent styling for various input types and is a foundational form element.
 */
'use client'; // UI components are typically client components

import * as React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility is from src/lib/utils.ts

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
