const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
    //These paths tell Tailwind Css where to look fo your classes
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}', // If you use Pages Router
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // For App Router
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

            },
            //Add cutom font families here as CSS variables
            fontFamily: {
                sans: ['var(--font-inter)',...fontFamily.sans], // Sets Inter as default sans-serif
                serif:['var(--font-playfair)',...fontFamily.serif], // Sets Playfair Display as default serif
            },
        },
    },
    plugins:[],
}