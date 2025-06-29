/**
 * @file src/components/ui/Button.tsx
 * @description A reusable React Button component adhering to Shadcn UI's styling principles.
 * It provides a consistent look and feel across the application, supports various variants, sizes,
 * and can optionally display an icon alongside its content.
 */
'use client'; // UI components are typically client components

import * as React from 'react';
// Assuming these utilities are provided by shadcn/ui setup in src/lib/utils.ts
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority'; // For defining component variants
import { Slot } from '@radix-ui/react-slot';

// Defines the visual variants for the button using Class Variance Authority (cva).
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90', // Uses our custom primary color
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Extends standard HTML button attributes and adds Shadcn's variant props and an optional 'icon' prop.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // For advanced usage with Shadcn's Slot component
  icon?: React.ReactNode; // Optional prop to render an icon inside the button.
  suppressHydrationWarning?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, icon, children, suppressHydrationWarning, ...props },
    ref
  ) => {
    // If using asChild, it will render the child element as the button, applying button styles.
    // Otherwise, it renders a standard button.
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        suppressHydrationWarning={suppressHydrationWarning}
        {...props}
      >
        {icon && <span className='mr-2'>{icon}</span>}{' '}
        {/* Render icon if provided, with margin. */}
        {children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
