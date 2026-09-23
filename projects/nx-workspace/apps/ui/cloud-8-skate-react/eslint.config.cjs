const nx = require('@nx/eslint-plugin');
const tseslint = require('typescript-eslint');

module.exports = [
  {
    ignores: ['**/public/**', '**/dist/**'],
  },
  ...tseslint.configs.recommended,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
