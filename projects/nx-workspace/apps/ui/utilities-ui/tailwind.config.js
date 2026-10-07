const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
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
