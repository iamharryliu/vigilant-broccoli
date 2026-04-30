/* eslint-disable */
export default {
  displayName: '@vigilant-broccoli/vibecheck-lite',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/@vigilant-broccoli/vibecheck-lite',
};
