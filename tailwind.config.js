// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme'); // Imports default theme to extend fonts.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // These paths tell Tailwind CSS where to look for your classes
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If you use Pages Router
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // For App Router
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Ensure src directory is included (from main's content)
  ],
  theme: {
    extend: {
      // Background images (from main)
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // --- Shadcn UI Color & Border Configuration (from main) ---
      // This maps Tailwind's color names to the CSS variables defined in globals.css.
      // This is crucial for Shadcn UI components to be styled correctly.
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
        // --- Your Custom Purple Theme Colors (integrated with main's color structure) ---
        // These are the direct HSL values for your purple shades.
        // Make sure these match the --primary HSL values in globals.css for consistency if desired.
        // For now, these direct hex codes will be used.
        'my-primary': { // Renamed from 'primary' to 'my-primary' to avoid conflict with Shadcn's primary
          DEFAULT: '#766be0', // Your main purple/indigo color
          light: '#9e99eb', // A lighter shade for backgrounds or subtle accents
          dark: '#5c52b3', // A darker shade for hover states or deeper accents
        },
      },
      // Custom border radius values for more consistent rounding (from main).
      borderRadius: {
        lg: 'var(--radius)', // Uses the --radius CSS variable from globals.css
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem', // Example: more rounded corners
        // Ensure standard Tailwind classes like 'rounded-md' still work
      },
      // Custom font families integrated with Tailwind's defaults via CSS variables (from your branch).
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        serif: ['var(--font-playfair)', ...fontFamily.serif],
      },
    },
  },
  plugins: [],
};