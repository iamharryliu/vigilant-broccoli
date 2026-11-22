const plugin = require('tailwindcss/plugin');
const tokens = require('./src/theme-tokens.json');

module.exports = {
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
      // Offsets reproduce Tailwind's defaults (sm 2px, DEFAULT 4px, md 6px, lg 8px) at the
      // 0.5rem default; a small --radius clamps the negative results to 0.
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        DEFAULT: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 6px)',
      },
    },
  },
  plugins: [
    plugin(({ addBase, config }) => {
      addBase({
        ':root': tokens.light,
        '.light': tokens.light,
        '.dark': tokens.dark,
      });
      if (config('darkMode') === 'media') {
        addBase({
          '@media (prefers-color-scheme: dark)': {
            ':root:not(.light):not(.dark)': tokens.dark,
          },
        });
      }
    }),
  ],
};
