
process.env.GEMINI_API_KEY = 'test-api-key';

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};