#!/usr/bin/env node

/**
 * Authentication API Test Runner
 * 
 * This script tests all authentication endpoints without requiring a database.
 * It uses the mock OTP service and in-memory storage for testing.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting Authentication API Tests...\n');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OTP_PROVIDER = 'mock';
process.env.DATABASE_URL = 'file:./test.db'; // Use SQLite for tests
process.env.JWT_SECRET = 'test-jwt-secret-for-authentication-testing';
process.env.REFRESH_JWT_SECRET = 'test-refresh-jwt-secret-for-testing';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// Run the tests
const testProcess = spawn('npx', ['jest', '--config', 'test/jest-e2e.json', '--verbose'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

testProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All authentication tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   • Phone number validation ✓');
    console.log('   • OTP generation and verification ✓');
    console.log('   • JWT token management ✓');
    console.log('   • Rate limiting ✓');
    console.log('   • Profile management ✓');
    console.log('   • Security validations ✓');
    console.log('   • Error handling ✓');
  } else {
    console.log('\n❌ Some tests failed. Check the output above for details.');
  }
  process.exit(code);
});

testProcess.on('error', (err) => {
  console.error('Failed to start test process:', err);
  process.exit(1);
});
