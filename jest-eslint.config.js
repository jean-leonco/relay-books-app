module.exports = {
  runner: 'jest-runner-eslint',
  displayName: 'lint',
  testMatch: [
    '<rootDir>/packages/**/**/*.js',
    '<rootDir>/packages/**/**/*.jsx',
    '<rootDir>/packages/**/**/*.ts',
    '<rootDir>/packages/**/**/*.tsx',
  ],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
};
