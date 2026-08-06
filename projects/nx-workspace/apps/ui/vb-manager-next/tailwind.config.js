// createGlobPatternsForDependencies from '@nx/next/tailwind' is deprecated and
// removed in Nx v24; the lib globs below mirror its last computed output.
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/@vigilant-broccoli/react-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/common-js/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/common-browser/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/common-node/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/google-workspace/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-utility/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/github-workspace-js/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/next-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-sandbox/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/ci/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/github-workspace/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/llm-schemas/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/vibecheck-lite/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/llm-tools/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/money-movement/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/links/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/deployment/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/resume/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-music-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/personal-common-js/src/**/*.{tsx,ts,jsx,js,html}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
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
      keyframes: {
        slideDown: {
          from: { height: '0', opacity: '0' },
          to: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
          },
        },
        slideUp: {
          from: {
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
          },
          to: { height: '0', opacity: '0' },
        },
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
        slideDown: 'slideDown 200ms ease-out',
        slideUp: 'slideUp 200ms ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
