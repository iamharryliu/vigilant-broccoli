export default {
  displayName: 'local-manager-next',
  preset: '../../../jest.preset.js',
  coverageDirectory: '../../../coverage/apps/ui/local-manager-next',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
};
