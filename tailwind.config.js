/**
 * @file tailwind.config.js
 * @description This file serves as the central configuration for Tailwind CSS in your project.
 * It's where you customize Tailwind's default behavior, extend its theme with your branding (colors, fonts,
 * spacing, etc.), and define plugins. This configuration is crucial for ensuring that Tailwind generates
 * the correct utility classes and styles based on your project's specific design system.
 */
const { fontFamily } = require('tailwindcss/defaultTheme'); // Imports default theme to extend fonts.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // These paths tell Tailwind CSS where to look for your classes
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Ensure src directory is included
  ],
  theme: {
    extend: {
      // Your friend's additions for background images.
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // --- Shadcn UI Color & Border Configuration ---
      // This maps Tailwind's color names to the CSS variables defined in globals.css.
      // This is crucial for Shadcn UI components to be styled correctly.
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))', // This will now point to your purple color defined in globals.css
          foreground: 'hsl(var(--primary-foreground))', // Text color for primary background
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground)',
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
        // --- Your Custom Purple Theme Colors (Direct Hex/HSL for specific overrides or non-Shadcn use) ---
        // These can be used with classes like `bg-app-purple` or `text-app-purple-light`.
        // They are separate from Shadcn's primary, but can be linked in globals.css.
        'app-purple': {
          // Renamed from 'my-primary' to avoid confusion, use `app-purple`
          DEFAULT: '#766be0', // Your main purple/indigo color
          light: '#9e99eb', // A lighter shade
          dark: '#5c52b3', // A darker shade
        },
      },
      // Custom border radius values for more consistent rounding.
      borderRadius: {
        lg: 'var(--radius)', // Uses the --radius CSS variable from globals.css for large rounding
        md: 'calc(var(--radius) - 2px)', // Medium rounding based on --radius
        sm: 'calc(var(--radius) - 4px)', // Small rounding based on --radius
        xl: '1rem', // Extra large rounding
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
