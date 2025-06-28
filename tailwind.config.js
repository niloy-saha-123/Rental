/**
 * @file tailwind.config.js
 * @description This file serves as the central configuration for Tailwind CSS in our project.
 * It's where we customize Tailwind's default behavior, extend its theme with our branding (colors, fonts,
 * spacing, etc.), and define plugins. This configuration is crucial for ensuring that Tailwind generates
 * the correct utility classes and styles based on our project's specific design system.
 */

const { fontFamily } = require('tailwindcss/defaultTheme'); // Imports default theme to extend fonts.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // These paths tell Tailwind CSS where to look for our classes
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For Pages Router
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For App Router
    './src/**/*.{js,ts,jsx,tsx,mdx}', // For src directory
  ],
  theme: {
    extend: {
      // For background images.
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // --- Shadcn UI Color & Border Configuration ---
      // This maps Tailwind's color names to the CSS variables defined in globals.css.
      // This is used for Shadcn UI components to be styled correctly.
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))', // This will now point to your purple color defined below
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // --- Custom Purple Theme Colors (override default primary) ---
        // These are the direct HSL values for our purple shades.
        // Make sure these match the --primary HSL values in globals.css for consistency if desired.
        // For now, these direct hex codes will be used. (TODO: change to HSL)
        'my-primary': {
          // Renamed to 'my-primary' to avoid conflict with Shadcn's primary
          DEFAULT: '#766be0', // Our main purple/indigo color
          light: '#9e99eb', // A lighter shade for backgrounds or subtle accents
          dark: '#5c52b3', // A darker shade for hover states or deeper accents
        },
      },
      // Custom border radius values for more consistent rounding.
      borderRadius: {
        lg: 'var(--radius)', // Uses the --radius CSS variable from globals.css
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem', // Example: more rounded corners
        // Ensure standard Tailwind classes like 'rounded-md' still work
      },
      // Custom font families integrated with Tailwind's defaults via CSS variables.
      fontFamily: {
        // Sets Inter as the default sans-serif font, falling back to Tailwind's system sans-serif stack.
        sans: ['var(--font-inter)', ...fontFamily.sans],
        // Sets Playfair Display as the default serif font, falling back to Tailwind's system serif stack.
        serif: ['var(--font-playfair)', ...fontFamily.serif],
      },
    },
  },
  plugins: [],
};
