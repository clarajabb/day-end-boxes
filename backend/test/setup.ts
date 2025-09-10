// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.OTP_PROVIDER = 'mock';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.REFRESH_JWT_SECRET = 'test-refresh-jwt-secret';
  
  // Mock console.log to reduce noise during tests
  if (process.env.SILENT_TESTS === 'true') {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  }
});

afterAll(() => {
  // Restore console methods
  if (process.env.SILENT_TESTS === 'true') {
    (console.log as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  }
});
