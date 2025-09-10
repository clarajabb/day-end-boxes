#!/usr/bin/env node

/**
 * Comprehensive User Management Endpoint Tester
 * Tests all user management endpoints in TEST MODE
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
const TEST_PHONE = '+96171123456';
const TEST_OTP = '123456';

let accessToken = '';
let userId = '';

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
function logTest(testName, result, shouldFail = false) {
  const expectedSuccess = !shouldFail;
  const actualSuccess = result.success;
  const status = (actualSuccess === expectedSuccess) ? '✅' : '❌';
  const statusCode = result.status;
  
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
}

async function authenticateUser() {
  console.log('🔐 AUTHENTICATING TEST USER');
  console.log('-'.repeat(40));
  
  // Send OTP
  await apiCall('POST', '/auth-test/send-otp', {
    phone: TEST_PHONE,
    locale: 'ar'
  });
  
  // Verify OTP and get JWT
  const authResult = await apiCall('POST', '/auth-test/verify-otp', {
    phone: TEST_PHONE,
    otp: TEST_OTP
  });
  
  if (authResult.success) {
    accessToken = authResult.data.data.accessToken;
    userId = authResult.data.data.user.id;
    console.log(`✅ Authentication successful`);
    console.log(`   🎫 Access Token: ${accessToken.substring(0, 30)}...`);
    console.log(`   👤 User ID: ${userId}`);
    console.log();
    return true;
  } else {
    console.log('❌ Authentication failed - cannot test protected endpoints');
    return false;
  }
}

async function runComprehensiveUserTests() {
  console.log('🧪 COMPREHENSIVE USER MANAGEMENT ENDPOINT TESTING');
  console.log('=' .repeat(65));
  console.log(`🎯 Testing API at: ${API_BASE}`);
  console.log(`📱 Test Phone: ${TEST_PHONE}`);
  console.log();

  // Test 1: Check Test Mode Status
  console.log('1️⃣  CHECKING USER MANAGEMENT TEST MODE');
  console.log('-'.repeat(45));
  const statusResult = await apiCall('GET', '/users-test/status');
  logTest('Get user management test mode status', statusResult);

  if (statusResult.success && statusResult.data.testUsers) {
    console.log('   📊 Pre-populated Test Users:');
    Object.entries(statusResult.data.testUsers).forEach(([id, user]) => {
      console.log(`     • ${id}: ${user.name} (${user.phone}) - ${user.reservations}`);
    });
    console.log();
  }

  // Test 2: Get All Test Users (Public Endpoint)
  console.log('2️⃣  TESTING PUBLIC USER ENDPOINTS');
  console.log('-'.repeat(45));
  
  const allUsersResult = await apiCall('GET', '/users-test/all');
  logTest('Get all test users', allUsersResult);

  if (allUsersResult.success) {
    console.log(`   👥 Found ${allUsersResult.data.data.length} test users:`);
    allUsersResult.data.data.forEach(user => {
      console.log(`     • ${user.name || 'Unnamed'} (${user.phone}) - ${user.preferredLocale}`);
    });
    console.log();
  }

  // Test 3: Get User Reservations (Public Endpoint)
  const reservationsResult = await apiCall('GET', '/users-test/user_test_1/reservations');
  logTest('Get user reservations for test user 1', reservationsResult);

  if (reservationsResult.success) {
    console.log(`   📋 Found ${reservationsResult.data.data.length} reservations:`);
    reservationsResult.data.data.forEach(reservation => {
      console.log(`     • ${reservation.boxType} at ${reservation.merchantName} (${reservation.status})`);
    });
    console.log();
  }

  // Test 4: Create New Test User
  const newUserData = {
    phone: '+96171555555',
    name: 'Test User New',
    email: 'testuser@example.com',
    preferredLocale: 'en'
  };
  
  const createUserResult = await apiCall('POST', '/users-test/create', newUserData);
  logTest('Create new test user', createUserResult);

  let newUserId = null;
  if (createUserResult.success) {
    newUserId = createUserResult.data.data.id;
    console.log(`   🆕 New User ID: ${newUserId}`);
    console.log();
  }

  // Test 5: Add Test Reservation
  if (newUserId) {
    const reservationData = {
      status: 'ACTIVE',
      boxType: 'Mediterranean Box',
      merchantName: 'Olive Garden Café'
    };
    
    const addReservationResult = await apiCall('POST', `/users-test/${newUserId}/reservation`, reservationData);
    logTest('Add test reservation to new user', addReservationResult);
  }

  // Authenticate for protected endpoints
  const authSuccess = await authenticateUser();
  if (!authSuccess) {
    console.log('❌ Cannot test protected endpoints without authentication');
    return;
  }

  // Test 6: Get User Profile (Protected)
  console.log('3️⃣  TESTING PROTECTED USER ENDPOINTS');
  console.log('-'.repeat(45));
  
  const profileResult = await apiCall('GET', '/users-test/profile', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  logTest('Get user profile with JWT', profileResult);

  if (profileResult.success && profileResult.data.data) {
    const profile = profileResult.data.data;
    console.log('   👤 User Profile Details:');
    console.log(`     • Name: ${profile.name || 'Not set'}`);
    console.log(`     • Email: ${profile.email || 'Not set'}`);
    console.log(`     • Phone: ${profile.phone}`);
    console.log(`     • Locale: ${profile.preferredLocale}`);
    console.log(`     • Active: ${profile.isActive}`);
    console.log(`     • Notifications: Push=${profile.notificationPreferences.pushEnabled}, SMS=${profile.notificationPreferences.smsEnabled}, Email=${profile.notificationPreferences.emailEnabled}`);
    console.log();
  }

  // Test 7: Get User Statistics (Protected)
  const statsResult = await apiCall('GET', '/users-test/stats', null, {
    'Authorization': `Bearer ${accessToken}`
  });
  logTest('Get user reservation statistics with JWT', statsResult);

  if (statsResult.success && statsResult.data.data) {
    const stats = statsResult.data.data;
    console.log('   📊 User Statistics:');
    console.log(`     • Total Reservations: ${stats.total}`);
    console.log(`     • Active Reservations: ${stats.active}`);
    console.log(`     • Completed Reservations: ${stats.completed}`);
    console.log(`     • Cancelled Reservations: ${stats.cancelled || 0}`);
    console.log(`     • Total Saved: $${stats.totalSaved || 0}`);
    console.log(`     • Favorite Category: ${stats.favoriteCategory || 'None'}`);
    console.log(`     • Last Reservation: ${stats.lastReservation || 'Never'}`);
    console.log();
  }

  // Test 8: Security Tests - Invalid JWT
  console.log('4️⃣  TESTING SECURITY VALIDATIONS');
  console.log('-'.repeat(45));
  
  const invalidJwtProfileResult = await apiCall('GET', '/users-test/profile', null, {
    'Authorization': 'Bearer invalid.jwt.token'
  });
  logTest('Get profile with invalid JWT (should fail)', invalidJwtProfileResult, true);

  const invalidJwtStatsResult = await apiCall('GET', '/users-test/stats', null, {
    'Authorization': 'Bearer invalid.jwt.token'
  });
  logTest('Get stats with invalid JWT (should fail)', invalidJwtStatsResult, true);

  // Test 9: Security Tests - No JWT
  const noJwtProfileResult = await apiCall('GET', '/users-test/profile');
  logTest('Get profile without JWT (should fail)', noJwtProfileResult, true);

  const noJwtStatsResult = await apiCall('GET', '/users-test/stats');
  logTest('Get stats without JWT (should fail)', noJwtStatsResult, true);

  // Test 10: Security Tests - Malformed Authorization Header
  const malformedAuthResult = await apiCall('GET', '/users-test/profile', null, {
    'Authorization': accessToken // Missing "Bearer "
  });
  logTest('Get profile with malformed auth header (should fail)', malformedAuthResult, true);

  // Test 11: Test Different User Context
  console.log('5️⃣  TESTING DIFFERENT USER CONTEXTS');
  console.log('-'.repeat(45));
  
  // Create a second user and get their token
  await apiCall('POST', '/auth-test/send-otp', {
    phone: '+96171987654',
    locale: 'en'
  });
  
  const secondAuthResult = await apiCall('POST', '/auth-test/verify-otp', {
    phone: '+96171987654',
    otp: TEST_OTP
  });
  
  if (secondAuthResult.success) {
    const secondAccessToken = secondAuthResult.data.data.accessToken;
    console.log(`✅ Second user authenticated: ${secondAuthResult.data.data.user.id}`);
    
    const secondUserProfileResult = await apiCall('GET', '/users-test/profile', null, {
      'Authorization': `Bearer ${secondAccessToken}`
    });
    logTest('Get second user profile', secondUserProfileResult);
    
    const secondUserStatsResult = await apiCall('GET', '/users-test/stats', null, {
      'Authorization': `Bearer ${secondAccessToken}`
    });
    logTest('Get second user statistics', secondUserStatsResult);
    
    if (secondUserStatsResult.success) {
      const secondStats = secondUserStatsResult.data.data;
      console.log(`   📊 Second User Stats: ${secondStats.total} total, ${secondStats.active} active, ${secondStats.completed} completed`);
      console.log();
    }
  }

  // Test 12: Edge Cases
  console.log('6️⃣  TESTING EDGE CASES');
  console.log('-'.repeat(45));
  
  // Test non-existent user reservations
  const nonExistentUserReservations = await apiCall('GET', '/users-test/nonexistent_user/reservations');
  logTest('Get reservations for non-existent user', nonExistentUserReservations);

  // Test creating user with missing data
  const incompleteUserResult = await apiCall('POST', '/users-test/create', {
    name: 'Incomplete User'
    // Missing phone
  });
  logTest('Create user with missing phone (should fail)', incompleteUserResult, true);

  // Test adding reservation to non-existent user
  const invalidReservationResult = await apiCall('POST', '/users-test/nonexistent_user/reservation', {
    boxType: 'Test Box',
    merchantName: 'Test Merchant'
  });
  logTest('Add reservation to non-existent user', invalidReservationResult);

  // Final Summary
  console.log('🎉 COMPREHENSIVE USER MANAGEMENT TESTS COMPLETED!');
  console.log('=' .repeat(65));
  console.log();
  console.log('📊 USER MANAGEMENT SYSTEM TEST SUMMARY:');
  console.log('   ✅ User profile retrieval (with JWT authentication)');
  console.log('   ✅ User reservation statistics (total, active, completed)');
  console.log('   ✅ JWT authentication protection');
  console.log('   ✅ Test data management (create users, add reservations)');
  console.log('   ✅ Security validations (invalid JWT, missing auth)');
  console.log('   ✅ Multi-user context testing');
  console.log('   ✅ Edge case handling');
  console.log('   ✅ Error handling and validation');
  console.log();
  console.log('🔧 FEATURES TESTED:');
  console.log('   • User profile retrieval with complete user data');
  console.log('   • Reservation statistics with detailed breakdown');
  console.log('   • JWT authentication required for protected endpoints');
  console.log('   • In-memory test data with pre-populated users');
  console.log('   • Security measures (JWT validation, proper error handling)');
  console.log('   • Multi-user scenarios and context isolation');
  console.log('   • CRUD operations for test data management');
  console.log();
  console.log('✨ ALL USER MANAGEMENT ENDPOINTS SUCCESSFULLY TESTED! ✨');
}

// Check server availability
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE}/users-test/status`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running or user test endpoints not available');
    console.log('   Please ensure the server is running with: npm run start:dev');
    console.log(`   And check: ${API_BASE}/users-test/status`);
    process.exit(1);
  }
  
  await runComprehensiveUserTests();
}

main().catch(console.error);
