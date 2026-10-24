import baseConfig, { unusedVariablesConfig } from '../../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';

export default [
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  ...baseConfig,
  ...nx.configs['flat/react'],
  unusedVariablesConfig,
];
