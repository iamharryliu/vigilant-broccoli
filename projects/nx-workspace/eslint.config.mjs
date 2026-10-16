import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/assets/**', '**/next-env.d.ts'],
  },
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { 'react-hooks': reactHooks, import: importPlugin },
    settings: {
      // Without these the plugin skips non-.js files and finds no cycles.
      'import/extensions': ['.ts', '.tsx', '.js', '.jsx'],
      'import/resolver': {
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
      },
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            // react-lib stays atomic: higher-level components live in
            // react-lib-higher-level so editing them does not redeploy every
            // UI app that consumes react-lib.
            {
              sourceTag: 'type:primitive',
              notDependOnLibsWithTags: ['type:higher-level'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // A cycle can pass typecheck and lint yet crash at runtime once bundled
      // (a constant read before its module initializes), so fail it here.
      'import/no-cycle': 'error',
      complexity: [
        'warn',
        {
          max: 10,
        },
      ],
    },
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'error',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-extra-semi': 'error',
    },
  },
  {
    files: ['**/tailwind.config.js'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map(config => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
      },
    })),
];
