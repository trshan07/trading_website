// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E6E9F0',
          100: '#CCD3E1',
          200: '#99A7C3',
          300: '#667BA5',
          400: '#334F87',
          500: '#002366',
          600: '#001F5C',
          700: '#001A4D',
          800: '#00143D',
          900: '#000F2E',
        },
        gold: {
          50: '#FDF8E6',
          100: '#FBF1CC',
          200: '#F7E399',
          300: '#F3D566',
          400: '#EFC733',
          500: '#EBB900',
          600: '#D4A700',
          700: '#B88F00',
          800: '#9C7700',
          900: '#7F5F00',
        },
      },
      fontFamily: {
        'raleway': ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
}