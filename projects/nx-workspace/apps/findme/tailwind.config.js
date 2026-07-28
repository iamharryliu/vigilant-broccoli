// createGlobPatternsForDependencies from '@nx/next/tailwind' is deprecated and
// removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../libs/@vigilant-broccoli/common-browser/src/**/*.{tsx,ts,jsx,js,html}',
    '../../libs/@vigilant-broccoli/common-js/src/**/*.{tsx,ts,jsx,js,html}',
    '../../libs/@vigilant-broccoli/react-lib/src/**/*.{tsx,ts,jsx,js,html}',
  ],
  theme: { extend: {} },
  plugins: [],
};
