const { join } = require('path');

// createGlobPatternsForDependencies from '@nx/react/tailwind' is deprecated
// and removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    join(__dirname, 'index.html'),
    join(
      __dirname,
      '{src,pages,components,app}/**/!(*.stories|*.spec).{ts,tsx,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/resume/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-browser/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-js/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/personal-common-js/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
