/***** Tailwind Config *****/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    './index.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9edff',
          200: '#baddff',
          300: '#90c7ff',
          400: '#5fa8ff',
          500: '#2f82ff',
          600: '#1161e6',
          700: '#0a4ab4',
          800: '#0d4591',
          900: '#113b75'
        }
      }
    }
  },
  plugins: []
};
