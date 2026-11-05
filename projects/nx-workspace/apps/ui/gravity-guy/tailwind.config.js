/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  content: [
    './src/**/*.{ts,tsx}',
    '../../../libs/@vigilant-broccoli/react-lib/src/**/*.{ts,tsx}',
  ],
  plugins: [],
};
