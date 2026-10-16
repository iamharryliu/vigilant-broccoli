const { join } = require('path');

// createGlobPatternsForDependencies from '@nx/react/tailwind' is deprecated
// and removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  darkMode: 'class',
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/!(*.stories|*.spec).{ts,tsx,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-sandbox/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-lib/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-js/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-browser/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-utility/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
  ],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
