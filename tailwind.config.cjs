/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/styles/custom.scss'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stroke: '#E2E8F0',
        black: '#1C2434',
        'black-2': '#010101',
        primary: '#60a5fa',
        boxdark: '#334459',
        'boxdark-2': '#263444',
        strokedark: '#475f7d',
      },
      boxShadow: {
        default: '0px 8px 13px -3px rgba(0, 0, 0, 0.07)',
      },
      backgroundImage: {
        'light-gradient': `
          radial-gradient(at 13.814868431089122% 36.55432836575234%, hsla(33.33333333333323, 100%, 98.23529411764707%, 1) 0%, hsla(33.33333333333323, 100%, 98.23529411764707%, 0) 100%),
          radial-gradient(at 26.757512289394448% 14.55716430928402%, hsla(201.99999999999997, 100%, 94.11764705882352%, 1) 0%, hsla(201.99999999999997, 100%, 94.11764705882352%, 0) 100%),
          radial-gradient(at 71.81123062379334% 73.35997062171711%, hsla(201.99999999999997, 100%, 94.11764705882352%, 1) 0%, hsla(201.99999999999997, 100%, 94.11764705882352%, 0) 100%),
          radial-gradient(at 80.67571417506147% 77.36934613667599%, hsla(33.33333333333323, 100%, 98.23529411764707%, 1) 0%, hsla(33.33333333333323, 100%, 98.23529411764707%, 0) 100%)
        `,
        'dark-gradient': `
          radial-gradient(at 50% 50%, hsla(210, 29%, 27%, 0.8) 0%, hsla(210, 29%, 27%, 0) 100%)
        `,
      },
    },
  },
  plugins: [],
};
