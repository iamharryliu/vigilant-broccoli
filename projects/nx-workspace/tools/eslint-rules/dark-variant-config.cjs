const requireDarkVariant = require('./require-dark-variant.cjs');

// Light-only palette utilities render white surfaces in dark mode; see
// docs/app-development/ui/ui-app-pattern.md#consistency-requirements. Shared
// with projects whose own `.cjs` config does not extend the root config.
module.exports = {
  files: ['**/*.tsx'],
  plugins: {
    'vigilant-broccoli': {
      rules: { 'require-dark-variant': requireDarkVariant },
    },
  },
  rules: { 'vigilant-broccoli/require-dark-variant': 'error' },
};
