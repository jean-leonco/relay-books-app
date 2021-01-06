const pack = require('./package');

module.exports = {
  displayName: pack.name,
  name: pack.name,
  testPathIgnorePatterns: ['/node_modules/', './dist'],
  coverageReporters: ['lcov', 'html'],
  resetModules: false,
  reporters: ['default'],
  transform: {
    '^.+\\.(js|ts|tsx)?$': '<rootDir>/src/babel-transformer',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$',
  moduleFileExtensions: ['ts', 'js', 'tsx', 'json'],
};
