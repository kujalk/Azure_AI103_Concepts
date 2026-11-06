/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        azure: { 50: '#eff6fc', 100: '#deecf9', 500: '#0078d4', 600: '#106ebe', 700: '#005a9e', 900: '#0b2545' },
      },
    },
  },
  plugins: [],
};
