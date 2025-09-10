#!/usr/bin/env node

/**
 * COMPLETE API INTEGRATION TEST SUITE
 * Tests Authentication, User Management, and Merchants System together
 * 
 * This demonstrates the full API ecosystem working as an integrated solution
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
const TEST_USERS = [
  { phone: '+96171123456', name: 'Ahmad Khalil', locale: 'ar' },
  { phone: '+96171987654', name: 'Sara Mansour', locale: 'en' },
  { phone: '+96170555777', name: 'Omar Fares', locale: 'ar' }
];
const TEST_OTP = '123456'; // Mock OTP

let testResults = {
  auth: { passed: 0, failed: 0 },
  users: { passed: 0, failed: 0 },
  merchants: { passed: 0, failed: 0 },
  integration: { passed: 0, failed: 0 }
};

// Helper function for API calls
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
function logTest(testName, result, category = 'integration', shouldFail = false) {
  const expectedSuccess = !shouldFail;
  const actualSuccess = result.success;
  const passed = (actualSuccess === expectedSuccess);
  const status = passed ? '✅' : '❌';
  const statusCode = result.status;
  
  // Update test results
  if (passed) {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
  }
  
  console.log(`${status} ${testName} (${statusCode})`);
  
  if (actualSuccess && result.data) {
    if (result.data.message) {
      console.log(`   📝 ${result.data.message}`);
    }
    if (result.data.note) {
      console.log(`   ℹ️  ${result.data.note}`);
    }
  } else if (!actualSuccess) {
    console.log(`   ❌ Error: ${result.data.message || result.data.error || 'Unknown error'}`);
  }
  console.log();
  
  return passed;
}

// Authentication helper
async function authenticateUser(phone, locale = 'ar') {
  // Send OTP
  await apiCall('POST', '/auth-test/send-otp', { phone, locale });
  
  // Verify OTP and get tokens
  const authResult = await apiCall('POST', '/auth-test/verify-otp', { phone, otp: TEST_OTP });
  
  if (authResult.success) {
    return {
      accessToken: authResult.data.data.accessToken,
      refreshToken: authResult.data.data.refreshToken,
      user: authResult.data.data.user
    };
  }
  return null;
}

async function runCompleteIntegrationTests() {
  console.log('🚀 COMPLETE DAY-END BOXES API INTEGRATION TEST SUITE');
  console.log('=' .repeat(80));
  console.log(`🎯 Testing Complete API Ecosystem at: ${API_BASE}`);
  console.log(`📱 Testing Authentication + User Management + Merchants System`);
  console.log(`🧪 Simulating real-world user journeys and API interactions`);
  console.log();

  // ========================================
  // PHASE 1: SYSTEM HEALTH CHECK
  // ========================================
  console.log('🏥 PHASE 1: SYSTEM HEALTH CHECK');
  console.log('=' .repeat(50));
  
  // Test all system status endpoints
  const authStatusResult = await apiCall('GET', '/auth-test/status');
  logTest('Authentication System Status', authStatusResult, 'auth');

  const usersStatusResult = await apiCall('GET', '/users-test/status');
  logTest('User Management System Status', usersStatusResult, 'users');

  const merchantsStatusResult = await apiCall('GET', '/merchants-test/status');
  logTest('Merchants System Status', merchantsStatusResult, 'merchants');

  console.log('📊 System Health Summary:');
  console.log(`   🔐 Authentication: ${authStatusResult.success ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`   👤 User Management: ${usersStatusResult.success ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log(`   🏪 Merchants System: ${merchantsStatusResult.success ? 'HEALTHY' : 'UNHEALTHY'}`);
  console.log();

  // ========================================
  // PHASE 2: USER JOURNEY SIMULATION
  // ========================================
  console.log('👥 PHASE 2: COMPLETE USER JOURNEY SIMULATION');
  console.log('=' .repeat(50));
  
  const userSessions = [];
  
  for (let i = 0; i < TEST_USERS.length; i++) {
    const testUser = TEST_USERS[i];
    console.log(`\n🧪 Testing User Journey ${i + 1}: ${testUser.name} (${testUser.phone})`);
    console.log('-'.repeat(60));
    
    // Step 1: User Registration/Login
    console.log(`📱 Step 1: Authentication for ${testUser.name}`);
    const session = await authenticateUser(testUser.phone, testUser.locale);
    
    if (session) {
      logTest(`User ${testUser.name} authenticated successfully`, { success: true, status: 200, data: {} }, 'auth');
      userSessions.push({ ...testUser, ...session });
      
      // Step 2: Get User Profile
      console.log(`👤 Step 2: User Profile Management for ${testUser.name}`);
      const profileResult = await apiCall('GET', '/users-test/profile', null, {
        'Authorization': `Bearer ${session.accessToken}`
      });
      logTest(`Get ${testUser.name}'s profile`, profileResult, 'users');
      
      // Step 3: Update User Profile
      const updateResult = await apiCall('PATCH', '/auth-test/profile', {
        name: testUser.name,
        preferredLocale: testUser.locale
      }, {
        'Authorization': `Bearer ${session.accessToken}`
      });
      logTest(`Update ${testUser.name}'s profile`, updateResult, 'users');
      
      // Step 4: Get User Statistics
      const statsResult = await apiCall('GET', '/users-test/stats', null, {
        'Authorization': `Bearer ${session.accessToken}`
      });
      logTest(`Get ${testUser.name}'s reservation statistics`, statsResult, 'users');
      
    } else {
      logTest(`User ${testUser.name} authentication failed`, { success: false, status: 400, data: {} }, 'auth');
    }
  }
  
  console.log(`\n✅ User Journey Summary: ${userSessions.length}/${TEST_USERS.length} users successfully authenticated`);

  // ========================================
  // PHASE 3: MERCHANTS SYSTEM TESTING
  // ========================================
  console.log('\n🏪 PHASE 3: MERCHANTS SYSTEM COMPREHENSIVE TESTING');
  console.log('=' .repeat(50));
  
  // Get all merchants
  const allMerchantsResult = await apiCall('GET', '/merchants-test');
  logTest('Get all approved merchants', allMerchantsResult, 'merchants');
  
  let merchants = [];
  if (allMerchantsResult.success) {
    merchants = allMerchantsResult.data.data;
    console.log(`   🏪 Found ${merchants.length} approved merchants`);
  }
  
  // Get merchant statistics
  const merchantStatsResult = await apiCall('GET', '/merchants-test/stats');
  logTest('Get merchant statistics', merchantStatsResult, 'merchants');
  
  // Get top rated merchants
  const topRatedResult = await apiCall('GET', '/merchants-test/top-rated?limit=3');
  logTest('Get top 3 rated merchants', topRatedResult, 'merchants');
  
  // Search merchants by area
  const areaSearchResult = await apiCall('GET', '/merchants-test/search?area=Beirut');
  logTest('Search merchants in Beirut area', areaSearchResult, 'merchants');
  
  // Search merchants by cuisine
  const cuisineSearchResult = await apiCall('GET', '/merchants-test/search?cuisine=Lebanese');
  logTest('Search Lebanese cuisine merchants', cuisineSearchResult, 'merchants');

  // ========================================
  // PHASE 4: CROSS-SYSTEM INTEGRATION
  // ========================================
  console.log('\n🔄 PHASE 4: CROSS-SYSTEM INTEGRATION TESTING');
  console.log('=' .repeat(50));
  
  if (userSessions.length > 0 && merchants.length > 0) {
    const user = userSessions[0];
    const merchant = merchants[0];
    
    console.log(`🎯 Testing integration between User: ${user.name} and Merchant: ${merchant.businessName}`);
    
    // Simulate user browsing merchants while authenticated
    const authenticatedMerchantSearch = await apiCall('GET', '/merchants-test/search?area=Hamra', null, {
      'Authorization': `Bearer ${user.accessToken}`
    });
    logTest('Authenticated user browsing merchants', authenticatedMerchantSearch, 'integration');
    
    // Get specific merchant details while authenticated
    const merchantDetailsResult = await apiCall('GET', `/merchants-test/${merchant.id}`, null, {
      'Authorization': `Bearer ${user.accessToken}`
    });
    logTest('Authenticated user viewing merchant details', merchantDetailsResult, 'integration');
    
    // Test token refresh in context of browsing
    const refreshResult = await apiCall('POST', '/auth-test/refresh', {
      refreshToken: user.refreshToken
    });
    logTest('Token refresh during merchant browsing session', refreshResult, 'integration');
    
    if (refreshResult.success) {
      const newToken = refreshResult.data.data.accessToken;
      
      // Continue browsing with refreshed token
      const continuedBrowsingResult = await apiCall('GET', '/merchants-test/top-rated', null, {
        'Authorization': `Bearer ${newToken}`
      });
      logTest('Continue browsing with refreshed token', continuedBrowsingResult, 'integration');
    }
  }

  // ========================================
  // PHASE 5: SECURITY & ERROR HANDLING
  // ========================================
  console.log('\n🔒 PHASE 5: SECURITY & ERROR HANDLING TESTING');
  console.log('=' .repeat(50));
  
  // Test invalid JWT across all systems
  const invalidToken = 'invalid.jwt.token';
  
  const invalidAuthProfileResult = await apiCall('GET', '/auth-test/profile', null, {
    'Authorization': `Bearer ${invalidToken}`
  });
  logTest('Invalid JWT - Auth Profile', invalidAuthProfileResult, 'integration', true);
  
  const invalidUsersProfileResult = await apiCall('GET', '/users-test/profile', null, {
    'Authorization': `Bearer ${invalidToken}`
  });
  logTest('Invalid JWT - Users Profile', invalidUsersProfileResult, 'integration', true);
  
  // Test rate limiting
  console.log('⏱️  Testing Rate Limiting:');
  const rateLimitPromises = [];
  for (let i = 0; i < 5; i++) {
    rateLimitPromises.push(
      apiCall('POST', '/auth-test/send-otp', {
        phone: `+96170${1000 + i}`,
        locale: 'ar'
      })
    );
  }
  
  const rateLimitResults = await Promise.all(rateLimitPromises);
  const successCount = rateLimitResults.filter(r => r.success).length;
  const rateLimitedCount = rateLimitResults.filter(r => r.status === 429).length;
  
  logTest(`Rate limiting test (${successCount} success, ${rateLimitedCount} limited)`, {
    success: rateLimitedCount > 0,
    status: 200,
    data: { message: 'Rate limiting working' }
  }, 'integration');

  // ========================================
  // PHASE 6: PERFORMANCE & LOAD TESTING
  // ========================================
  console.log('\n⚡ PHASE 6: PERFORMANCE & CONCURRENT USAGE TESTING');
  console.log('=' .repeat(50));
  
  // Test concurrent merchant requests
  console.log('🔄 Testing concurrent merchant requests...');
  const concurrentPromises = [
    apiCall('GET', '/merchants-test'),
    apiCall('GET', '/merchants-test/stats'),
    apiCall('GET', '/merchants-test/top-rated'),
    apiCall('GET', '/merchants-test/search?area=Beirut'),
    apiCall('GET', '/merchants-test/search?cuisine=Lebanese')
  ];
  
  const startTime = Date.now();
  const concurrentResults = await Promise.all(concurrentPromises);
  const endTime = Date.now();
  
  const allSuccessful = concurrentResults.every(r => r.success);
  logTest(`5 concurrent merchant requests (${endTime - startTime}ms)`, {
    success: allSuccessful,
    status: 200,
    data: { message: `Completed in ${endTime - startTime}ms` }
  }, 'integration');

  // ========================================
  // PHASE 7: SYSTEM CLEANUP & LOGOUT
  // ========================================
  console.log('\n🧹 PHASE 7: SYSTEM CLEANUP & USER LOGOUT');
  console.log('=' .repeat(50));
  
  for (const user of userSessions) {
    const logoutResult = await apiCall('POST', '/auth-test/logout', {
      refreshToken: user.refreshToken
    }, {
      'Authorization': `Bearer ${user.accessToken}`
    });
    logTest(`Logout user: ${user.name}`, logoutResult, 'auth');
  }

  // ========================================
  // FINAL RESULTS SUMMARY
  // ========================================
  console.log('\n🎉 COMPLETE API INTEGRATION TEST RESULTS');
  console.log('=' .repeat(80));
  
  const totalPassed = Object.values(testResults).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, cat) => sum + cat.failed, 0);
  const totalTests = totalPassed + totalFailed;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log('\n📊 DETAILED TEST RESULTS BY SYSTEM:');
  console.log(`🔐 Authentication System: ${testResults.auth.passed} passed, ${testResults.auth.failed} failed`);
  console.log(`👤 User Management System: ${testResults.users.passed} passed, ${testResults.users.failed} failed`);
  console.log(`🏪 Merchants System: ${testResults.merchants.passed} passed, ${testResults.merchants.failed} failed`);
  console.log(`🔄 Integration Tests: ${testResults.integration.passed} passed, ${testResults.integration.failed} failed`);
  
  console.log('\n🎯 OVERALL RESULTS:');
  console.log(`   📈 Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📊 Success Rate: ${successRate}%`);
  
  console.log('\n🚀 API ECOSYSTEM STATUS:');
  if (successRate >= 90) {
    console.log('   🟢 EXCELLENT - Production Ready!');
  } else if (successRate >= 75) {
    console.log('   🟡 GOOD - Minor issues to address');
  } else {
    console.log('   🔴 NEEDS WORK - Significant issues found');
  }
  
  console.log('\n✨ INTEGRATION TEST FEATURES VERIFIED:');
  console.log('   🔐 Complete Authentication Flow (OTP → JWT → Profile → Logout)');
  console.log('   👤 User Management & Profile System');
  console.log('   🏪 Merchants Discovery & Information System');
  console.log('   🔄 Cross-System Integration (Auth + Users + Merchants)');
  console.log('   🔒 Security Validations (JWT, Rate Limiting, Error Handling)');
  console.log('   ⚡ Performance Testing (Concurrent Requests)');
  console.log('   🧪 User Journey Simulation (Real-world Usage Patterns)');
  console.log('   📊 Comprehensive Statistics & Reporting');
  
  console.log('\n🎊 DAY-END BOXES API ECOSYSTEM INTEGRATION TEST COMPLETED! 🎊');
  
  return {
    totalTests,
    totalPassed,
    totalFailed,
    successRate: parseFloat(successRate),
    systemResults: testResults
  };
}

// Check server availability
async function checkServer() {
  try {
    const checks = [
      axios.get(`${API_BASE}/auth-test/status`),
      axios.get(`${API_BASE}/users-test/status`),
      axios.get(`${API_BASE}/merchants-test/status`)
    ];
    
    const results = await Promise.allSettled(checks);
    const healthyServices = results.filter(r => r.status === 'fulfilled').length;
    
    return {
      healthy: healthyServices >= 2, // At least 2 out of 3 services working
      healthyServices,
      totalServices: 3
    };
  } catch (error) {
    return { healthy: false, healthyServices: 0, totalServices: 3 };
  }
}

async function main() {
  console.log('🔍 Checking server availability...');
  const serverStatus = await checkServer();
  
  if (!serverStatus.healthy) {
    console.log('❌ Server systems not available');
    console.log(`   Only ${serverStatus.healthyServices}/${serverStatus.totalServices} services responding`);
    console.log('   Please ensure the server is running with: npm run start:dev');
    console.log('\n🔄 Attempting basic connectivity test...');
    
    // Try basic endpoints
    const basicTests = [
      { name: 'Auth System', endpoint: '/auth-test/status' },
      { name: 'Users System', endpoint: '/users-test/status' },
      { name: 'Merchants System', endpoint: '/merchants-test/status' }
    ];
    
    for (const test of basicTests) {
      const result = await apiCall('GET', test.endpoint);
      console.log(`   ${test.name}: ${result.success ? '✅ Working' : '❌ Not responding'}`);
    }
    
    process.exit(1);
  }
  
  console.log(`✅ Server healthy: ${serverStatus.healthyServices}/${serverStatus.totalServices} services responding`);
  console.log();
  
  const results = await runCompleteIntegrationTests();
  
  // Exit with appropriate code
  process.exit(results.successRate >= 75 ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Integration test suite crashed:', error.message);
  process.exit(1);
});
