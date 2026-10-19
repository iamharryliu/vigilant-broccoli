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

// Apply after Nx language and React presets, which downgrade this rule to a warning.
export const unusedVariablesConfig = {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};

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
            // Layering: apps may use anything. Composite UI lives in
            // type:higher-level libs and narrow-audience UI (auth, calendar,
            // media) in type:domain libs, so editing one does not redeploy
            // every app that consumes the atomic type:primitive react-lib.
            // Domain libs may not import each other, or one domain edit would
            // again fan out to every other domain's consumers.
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
            {
              sourceTag: 'type:primitive',
              onlyDependOnLibsWithTags: ['type:util', 'type:primitive'],
            },
            {
              sourceTag: 'type:domain',
              onlyDependOnLibsWithTags: ['type:util', 'type:primitive'],
            },
            {
              sourceTag: 'type:higher-level',
              onlyDependOnLibsWithTags: [
                'type:util',
                'type:primitive',
                'type:domain',
                'type:higher-level',
              ],
            },
          ],
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
  ...nx.configs['flat/javascript'],
  unusedVariablesConfig,
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
    })),
];
