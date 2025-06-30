/**
 * @file src/components/ui/Button.tsx
 * @description A highly reusable and versatile React Button component designed to adhere to Shadcn UI's
 * styling principles and best practices. It provides a consistent look and feel across the application
 * for all interactive button elements.
 *
 * This component supports:
 * - **Various Visual Variants:** Such as 'default' (primary color), 'outline', 'secondary', 'destructive', 'ghost', and 'link' styles, defined using `class-variance-authority` (cva).
 * - **Different Sizes:** Including 'default', 'sm' (small), 'lg' (large), and 'icon' specific sizes.
 * - **Optional Icon Display:** Can render any React node (like an SVG icon) alongside its text content, positioned with a right margin.
 * - **Polymorphic Rendering with `asChild`:** When the `asChild` prop is set to `true`, the component will render its child element (instead of a native `<button>`), effectively merging its styling and props onto that child. This is useful for integrating with other Radix UI primitives or custom components while retaining Button's styling.
 * - **Accessibility & Responsiveness:** Built with focus states, disabled states, and responsive design considerations.
 * - **Reusability:** This component is intended to be used anywhere a clickable button is needed across your entire application, from forms (login, signup) to navigation and actions within dashboards.
 */
'use client'; // Marks this file as a client component, meaning it runs in the browser.

import * as React from 'react'; // Imports React.
// Imports the `cn` utility function from our local utils file for combining Tailwind CSS classes.
import { cn } from '@/lib/utils';
// Imports `cva` and `VariantProps` for creating component variants with conditional styling.
import { cva, type VariantProps } from 'class-variance-authority';
// Imports `Slot` from `@radix-ui/react-slot` for polymorphic component rendering.
import { Slot } from '@radix-ui/react-slot';

// Defines the visual variants for the button using Class Variance Authority (cva).
// This generates a function that returns a Tailwind CSS class string based on selected variants.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      // Defines the different visual styles based on the `variant` prop.
      variant: {
        // Default button style: uses the 'primary' color defined in tailwind.config.js
        // 'text-primary-foreground' will be the text color that contrasts well with 'primary' background.
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        // Destructive variant: for actions like deleting.
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // Outline variant: border with transparent background.
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        // Secondary variant: alternative background color.
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        // Ghost variant: text-only, with subtle hover effect.
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        // Link variant: appears as a text link but functions as a button.
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        // Defines different size presets for the button.
        default: 'h-10 px-4 py-2', // Default size, typical height and padding.
        sm: 'h-9 px-3', // Small size.
        lg: 'h-11 px-8', // Large size.
        icon: 'h-10 w-10', // Icon-only size, square shape.
      },
    },
    defaultVariants: {
      // Sets the default variant and size if none are explicitly provided.
      variant: 'default',
      size: 'default',
    },
  }
);

// Extends standard HTML button attributes and adds Shadcn's variant props and an optional 'icon' prop.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, // Inherits all standard HTML button attributes.
    VariantProps<typeof buttonVariants> {
  // Inherits types for the 'variant' and 'size' props from cva.
  asChild?: boolean; // Optional prop from Radix UI's Slot; if true, the component's child is rendered as the button.
  icon?: React.ReactNode; // Optional prop to render an icon (any React element) inside the button.
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>( // Uses React.forwardRef to allow parent components to pass a ref to the underlying DOM element.
  (
    { className, variant, size, asChild = false, icon, children, ...props },
    ref
  ) => {
    // Determines which component to render: Slot (if asChild is true) or a native 'button' element.
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))} // Combines base button styles with variant/size styles and any custom classes.
        ref={ref} // Passes the ref down to the rendered DOM element.
        {...props} // Spreads any other HTML attributes passed to the Button component.
      >
        {icon && <span className='mr-2'>{icon}</span>}{' '}
        {/* Conditionally renders the icon with margin if provided. */}
        {children}{' '}
        {/* Renders the primary content (text or other elements) of the button. */}
      </Comp>
    );
  }
);
Button.displayName = 'Button'; // Sets a display name for easier debugging in React DevTools.

export { Button, buttonVariants }; // Exports the Button component and its variants.
