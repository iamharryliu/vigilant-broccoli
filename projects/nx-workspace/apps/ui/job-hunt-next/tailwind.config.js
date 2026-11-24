/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('../../../libs/@vigilant-broccoli/react-lib/tailwind.preset.cjs'),
  ],
  darkMode: 'class',
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/@vigilant-broccoli/react-lib/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib-checklist/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib-higher-level/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/sidebar/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/react-lib-crud-list/src/**/*.{tsx,ts,jsx,js,html}',
    '../../../libs/@vigilant-broccoli/docs-explorer/src/**/*.{tsx,ts,jsx,js,html}',
  ],
  theme: {
    extend: {
      // CollapsibleList animates its content with these; the shared preset
      // does not define them.
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
