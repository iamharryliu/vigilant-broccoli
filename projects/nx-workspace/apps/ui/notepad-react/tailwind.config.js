const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  darkMode: 'class',
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,tsx,html}'),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/{react-lib,react-utility,react-music-lib}/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
  ],
  theme: { extend: {} },
  plugins: [],
};
