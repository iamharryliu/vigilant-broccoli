// createGlobPatternsForDependencies from '@nx/next/tailwind' is deprecated and
// removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/@vigilant-broccoli/common-browser/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/common-js/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib-higher-level/src/**/*.{tsx,ts,jsx,js,html}',
  ],
  theme: {
    extend: {
      keyframes: {
        'countdown-pop': {
          '0%': { opacity: '0', transform: 'scale(1.8)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
        },
        // The controls guide loops one 5 s cycle: walk up, right, down, left,
        // then drop. Each key's animation-delay picks its 1 s step.
        'key-press': {
          '0%, 16%': {
            transform: 'translateY(2px)',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
          },
          '20%, 100%': { transform: 'translateY(0)' },
        },
        'demo-walk': {
          '0%, 80%, 100%': { transform: 'translate(0, 0)' },
          '20%': { transform: 'translate(0, -2.5rem)' },
          '40%': { transform: 'translate(2.5rem, -2.5rem)' },
          '60%': { transform: 'translate(2.5rem, 0)' },
        },
        'demo-drop': {
          '0%, 80%': { opacity: '0', transform: 'scale(0.5)' },
          '84%, 96%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(1.3)' },
        },
      },
      animation: {
        'countdown-pop': 'countdown-pop 1s ease-out',
        'key-press': 'key-press 5s linear infinite',
        'demo-walk': 'demo-walk 5s ease-in-out infinite',
        'demo-drop': 'demo-drop 5s ease-out infinite',
      },
    },
  },
  plugins: [],
};
