const pack = require('./package');

module.exports = {
  displayName: pack.name,
  name: pack.name,
  testEnvironment: '<rootDir>/src/test/mongodb',
  testPathIgnorePatterns: ['/node_modules/'],
  coverageReporters: ['lcov', 'html'],
  globalSetup: '<rootDir>/src/test/setup.js',
  resetModules: false,
  reporters: ['default'],
  transform: {
    '^.+\\.([jt]sx?)$': 'esbuild-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
};
