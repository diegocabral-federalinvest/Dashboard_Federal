const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  // Ignorar arquivos de teste que são configurados para Vitest
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/api/',
    '<rootDir>/__tests__/features/',
    '<rootDir>/__tests__/unit/',
    '<rootDir>/__tests__/dashboard/',
    '<rootDir>/__tests__/hooks/',
    '<rootDir>/__tests__/e2e/', // Playwright tests
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 