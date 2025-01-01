module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/fixtures/'
  ],
  setupFiles: ['./test/setup.js'],
  // Добавляем конфигурацию вывода
  verbose: true,
  reporters: [
    'default',
    ['jest-progress-bar-reporter', {}],
    ['./test/custom-reporter.js', {}]
  ],
  displayName: {
    name: '🤖 Gemini Assistant Tests',
    color: 'blue'
  }
};
