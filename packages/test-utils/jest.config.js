const pkg = require('./package');

module.exports = {
  rootDir: './',
  name: pkg.name,
  displayName: pkg.name.toUpperCase(),
  testPathIgnorePatterns: ['/node_modules/', './build'],
  coverageReporters: ['lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/setupTestFramework.js'],
  globalSetup: '<rootDir>/test/setup.js',
  globalTeardown: '<rootDir>/test/teardown.js',
  transform: {
    // '^.+\\.(js|jsx|ts|tsx)?$': require.resolve('babel-jest'),
    '^.+\\.(js|jsx|ts|tsx)?$': '<rootDir>/test/babel-transformer',
  },
};
