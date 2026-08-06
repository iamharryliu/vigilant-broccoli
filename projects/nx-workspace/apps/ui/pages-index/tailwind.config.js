const { join } = require('path');

// createGlobPatternsForDependencies from '@nx/react/tailwind' is deprecated
// and removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/!(*.stories|*.spec).{ts,tsx,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-lib/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/react-utility/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-js/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-browser/src/**/!(*.stories|*.spec).{tsx,ts,jsx,js,html}',
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
