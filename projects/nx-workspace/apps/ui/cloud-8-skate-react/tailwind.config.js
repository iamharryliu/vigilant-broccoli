const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  // The `d` toggle sets the class on <html> and can override the OS setting.
  darkMode: 'class',
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,tsx,html}'),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-lib/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-lib-higher-level/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
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
