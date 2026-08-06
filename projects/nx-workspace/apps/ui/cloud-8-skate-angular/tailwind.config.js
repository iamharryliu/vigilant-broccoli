const { join } = require('path');

// createGlobPatternsForDependencies from '@nx/angular/tailwind' is deprecated
// and removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    join(
      __dirname,
      '../../../libs/angular/general-components/src/**/!(*.stories|*.spec).{ts,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/personal-common-js/src/**/!(*.stories|*.spec).{ts,html}',
    ),
    join(
      __dirname,
      '../../../libs/@vigilant-broccoli/common-js/src/**/!(*.stories|*.spec).{ts,html}',
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
