const nextEslintPluginNext = require('@next/eslint-plugin-next');
const nx = require('@nx/eslint-plugin');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    plugins: {
      '@next/next': nextEslintPluginNext,
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
  },
  ...nx.configs['flat/react-typescript'],
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
  {
    ignores: ['.next/**/*', 'apps/vb-manager-next-mobile/.next/**/*'],
  },
];
