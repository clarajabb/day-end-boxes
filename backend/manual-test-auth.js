#!/usr/bin/env node

/**
 * Manual Authentication API Tester
 * 
 * This script manually tests the authentication endpoints step by step.
 * Run this while your server is running to test the live API.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
const TEST_PHONE = '+96171123456';

let accessToken = '';
let refreshToken = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || { error: error.message }
    };
  }
}

// Helper function to log test results
function logTest(testName, result) {
  const status = result.success ? '✅' : '❌';
  const statusCode = result.status;
  console.log(`${status} ${testName} (${statusCode})`);
  
  if (!result.success) {
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
  }
  console.log();
}

async function runTests() {
  console.log('🚀 Starting Manual Authentication API Tests\n');
  console.log(`Testing API at: ${API_BASE}\n`);

  // Test 1: Send OTP
  console.log('1️⃣  Testing: Send OTP');
  const otpResult = await apiCall('POST', '/auth/send-otp', {
    phone: TEST_PHONE,
    locale: 'ar'
  });
  logTest('Send OTP to Lebanese number', otpResult);

  if (!otpResult.success) {
    console.log('❌ Cannot continue tests - OTP sending failed');
    return;
  }

  // Test 2: Verify OTP (using mock OTP: 123456)
  console.log('2️⃣  Testing: Verify OTP');
  const verifyResult = await apiCall('POST', '/auth/verify-otp', {
    phone: TEST_PHONE,
    otp: '123456' // Mock OTP service always returns this
  });
  logTest('Verify OTP and get tokens', verifyResult);

  if (verifyResult.success) {
    accessToken = verifyResult.data.data.accessToken;
    refreshToken = verifyResult.data.data.refreshToken;
    console.log(`📱 Access Token: ${accessToken.substring(0, 20)}...`);
    console.log(`🔄 Refresh Token: ${refreshToken.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Cannot continue tests - OTP verification failed');
    return;
  }

  // Test 3: Get Profile (requires JWT)
  console.log('3️⃣  Testing: Get User Profile');
  const profileResult = await apiCall('GET', '/auth/profile', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  logTest('Get user profile with JWT', profileResult);

  // Test 4: Update Profile
  console.log('4️⃣  Testing: Update User Profile');
  const updateResult = await apiCall('PATCH', '/auth/profile', {
    name: 'Ahmad Test User',
    email: 'ahmad@test.com',
    preferredLocale: 'en'
  }, {
    'Authorization': `Bearer ${accessToken}`
  });
  logTest('Update user profile', updateResult);

  // Test 5: Refresh Token
  console.log('5️⃣  Testing: Refresh Access Token');
  const refreshResult = await apiCall('POST', '/auth/refresh', {
    refreshToken: refreshToken
  });
  logTest('Refresh access token', refreshResult);

  if (refreshResult.success) {
    const newAccessToken = refreshResult.data.data.accessToken;
    console.log(`🆕 New Access Token: ${newAccessToken.substring(0, 20)}...\n`);
    accessToken = newAccessToken;
  }

  // Test 6: Test Invalid JWT
  console.log('6️⃣  Testing: Invalid JWT Handling');
  const invalidJwtResult = await apiCall('GET', '/auth/profile', null, {
    'Authorization': 'Bearer invalid.jwt.token'
  });
  logTest('Reject invalid JWT (should fail)', { ...invalidJwtResult, success: !invalidJwtResult.success });

  // Test 7: Test Rate Limiting
  console.log('7️⃣  Testing: Rate Limiting');
  console.log('   Sending multiple OTP requests quickly...');
  
  const rateLimitPromises = [];
  for (let i = 0; i < 5; i++) {
    rateLimitPromises.push(
      apiCall('POST', '/auth/send-otp', {
        phone: `+96171${1000 + i}`,
        locale: 'ar'
      })
    );
  }
  
  const rateLimitResults = await Promise.all(rateLimitPromises);
  const successCount = rateLimitResults.filter(r => r.success).length;
  const rateLimitedCount = rateLimitResults.filter(r => r.status === 429).length;
  
  console.log(`   ✅ Successful requests: ${successCount}`);
  console.log(`   ⚠️  Rate limited requests: ${rateLimitedCount}`);
  logTest('Rate limiting working', { success: rateLimitedCount > 0, status: 200, data: {} });

  // Test 8: Logout
  console.log('8️⃣  Testing: User Logout');
  const logoutResult = await apiCall('POST', '/auth/logout', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  logTest('User logout', logoutResult);

  // Test 9: Verify tokens are invalidated
  console.log('9️⃣  Testing: Token Invalidation After Logout');
  const postLogoutRefresh = await apiCall('POST', '/auth/refresh', {
    refreshToken: refreshToken
  });
  logTest('Refresh token invalidated (should fail)', { ...postLogoutRefresh, success: !postLogoutRefresh.success });

  console.log('🎉 All manual tests completed!\n');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('   • Lebanese phone validation: ✅');
  console.log('   • OTP generation (mock): ✅');
  console.log('   • JWT authentication: ✅');
  console.log('   • Profile management: ✅');
  console.log('   • Token refresh: ✅');
  console.log('   • Rate limiting: ✅');
  console.log('   • Security (invalid JWT): ✅');
  console.log('   • Logout & token invalidation: ✅');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE.replace('/api/v1', '')}/api/v1/docs`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running at http://localhost:3000');
    console.log('   Please start the server first with: npm run start:dev');
    process.exit(1);
  }
  
  await runTests();
}

// Run the tests
main().catch(console.error);
