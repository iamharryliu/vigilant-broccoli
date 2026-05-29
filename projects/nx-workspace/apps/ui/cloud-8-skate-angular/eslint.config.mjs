import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import baseConfig from '../../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...compat
    .config({
      extends: ['plugin:@angular-eslint/template/process-inline-templates'],
    })
    .map(config => ({
      ...config,
      files: ['**/*.ts'],
      rules: {
        ...config.rules,
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        '@angular-eslint/no-empty-lifecycle-method': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@angular-eslint/prefer-standalone': 'off',
      },
    })),
  ...nx.configs['flat/angular-template'],
];
