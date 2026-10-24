/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  darkMode: 'class',
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/@vigilant-broccoli/react-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib-auth/src/**/*.{tsx,ts,jsx,js,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
