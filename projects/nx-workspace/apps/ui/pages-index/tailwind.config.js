const { join } = require('path');

// createGlobPatternsForDependencies from '@nx/react/tailwind' is deprecated
// and removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
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
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
