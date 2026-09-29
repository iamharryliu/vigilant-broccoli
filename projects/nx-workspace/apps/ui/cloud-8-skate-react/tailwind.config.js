const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // No dark mode toggle in this app; pin to 'class' (never applied) rather
  // than the 'media' default so react-lib's dark: classes never activate off
  // the OS color scheme and mismatch the rest of the light-only site.
  darkMode: 'class',
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,tsx,html}'),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-lib/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
