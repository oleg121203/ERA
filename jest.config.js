module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/era-code-analyzer-test/src/utils/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
