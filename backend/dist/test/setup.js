beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.OTP_PROVIDER = 'mock';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.REFRESH_JWT_SECRET = 'test-refresh-jwt-secret';
    if (process.env.SILENT_TESTS === 'true') {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
    }
});
afterAll(() => {
    if (process.env.SILENT_TESTS === 'true') {
        console.log.mockRestore();
        console.warn.mockRestore();
    }
});
//# sourceMappingURL=setup.js.map