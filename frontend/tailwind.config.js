/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'scrollbar': '#888', // You can set this to any color you'd like
      },
      spacing: {
        'scrollbar-width': '8px', // You can set the width of the scrollbar here
      },
    },
  },
  plugins: [require('tailwind-scrollbar'),],
}