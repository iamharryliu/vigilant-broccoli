/* eslint-disable */
export default {
  displayName: '@prettydamntired/personal-website-api-lib',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/@prettydamntired/personal-website-api-lib',
};
