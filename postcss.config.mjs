// postcss.config.mjs
// This file tells PostCSS to use the Tailwind CSS and Autoprefixer plugins.

export default {
  plugins: {
    tailwindcss: {}, // This line loads the Tailwind CSS PostCSS plugin
    autoprefixer: {}, // This line adds vendor prefixes for broader browser compatibility
  },
};