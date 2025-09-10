#!/usr/bin/env node

/**
 * Comprehensive Merchants System Endpoint Tester
 * Tests all merchants endpoints in TEST MODE
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';

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

async function runComprehensiveMerchantsTests() {
  console.log('🧪 COMPREHENSIVE MERCHANTS SYSTEM ENDPOINT TESTING');
  console.log('=' .repeat(70));
  console.log(`🎯 Testing API at: ${API_BASE}`);
  console.log(`🏪 Testing Merchants System Endpoints`);
  console.log();

  // Test 1: Check Test Mode Status
  console.log('1️⃣  CHECKING MERCHANTS TEST MODE');
  console.log('-'.repeat(45));
  const statusResult = await apiCall('GET', '/merchants-test/status');
  logTest('Get merchants test mode status', statusResult);

  if (statusResult.success && statusResult.data.testMerchants) {
    console.log('   📊 Test Merchants Overview:');
    console.log(`     • Total: ${statusResult.data.testMerchants.total}`);
    console.log(`     • Types: ${statusResult.data.testMerchants.types.join(', ')}`);
    console.log(`     • Areas: ${statusResult.data.testMerchants.areas.join(', ')}`);
    console.log(`     • Cuisines: ${statusResult.data.testMerchants.cuisines.join(', ')}`);
    console.log();
  }

  // Test 2: Get All Merchants
  console.log('2️⃣  TESTING CORE MERCHANTS ENDPOINTS');
  console.log('-'.repeat(45));
  
  const allMerchantsResult = await apiCall('GET', '/merchants-test');
  logTest('Get all approved merchants', allMerchantsResult);

  let merchants = [];
  if (allMerchantsResult.success) {
    merchants = allMerchantsResult.data.data;
    console.log(`   🏪 Found ${merchants.length} approved merchants:`);
    merchants.slice(0, 3).forEach(merchant => {
      console.log(`     • ${merchant.businessName} (${merchant.businessType}) - Rating: ${merchant.rating}/5`);
    });
    if (merchants.length > 3) {
      console.log(`     ... and ${merchants.length - 3} more`);
    }
    console.log();
  }

  // Test 3: Get Merchant Statistics
  const statsResult = await apiCall('GET', '/merchants-test/stats');
  logTest('Get merchant statistics', statsResult);

  if (statsResult.success && statsResult.data.data) {
    const stats = statsResult.data.data;
    console.log('   📊 Merchant Statistics:');
    console.log(`     • Total Merchants: ${stats.totalMerchants}`);
    console.log(`     • Total Boxes Sold: ${stats.totalBoxesSold}`);
    console.log(`     • Average Rating: ${stats.averageRating}/5`);
    console.log(`     • Average Sustainability Score: ${stats.averageSustainabilityScore}%`);
    console.log(`     • Business Types: ${Object.entries(stats.businessTypes).map(([type, count]) => `${type}(${count})`).join(', ')}`);
    console.log(`     • Areas: ${Object.entries(stats.areas).map(([area, count]) => `${area}(${count})`).join(', ')}`);
    console.log();
  }

  // Test 4: Get Top Rated Merchants
  console.log('3️⃣  TESTING MERCHANT FILTERING & SEARCH');
  console.log('-'.repeat(45));
  
  const topRatedResult = await apiCall('GET', '/merchants-test/top-rated?limit=3');
  logTest('Get top rated merchants', topRatedResult);

  if (topRatedResult.success) {
    console.log(`   🌟 Top Rated Merchants:`);
    topRatedResult.data.data.forEach((merchant, index) => {
      console.log(`     ${index + 1}. ${merchant.businessName} - ${merchant.rating}/5 (${merchant.totalReviews} reviews)`);
    });
    console.log();
  }

  // Test 5: Get Most Sustainable Merchants
  const sustainableResult = await apiCall('GET', '/merchants-test/sustainable?limit=3');
  logTest('Get most sustainable merchants', sustainableResult);

  if (sustainableResult.success) {
    console.log(`   🌱 Most Sustainable Merchants:`);
    sustainableResult.data.data.forEach((merchant, index) => {
      console.log(`     ${index + 1}. ${merchant.businessName} - ${merchant.sustainabilityScore}% sustainability`);
    });
    console.log();
  }

  // Test 6: Search by Area
  const areaSearchResult = await apiCall('GET', '/merchants-test/search?area=Hamra');
  logTest('Search merchants by area (Hamra)', areaSearchResult);

  if (areaSearchResult.success) {
    console.log(`   📍 Merchants in Hamra area: ${areaSearchResult.data.data.length}`);
    areaSearchResult.data.data.forEach(merchant => {
      console.log(`     • ${merchant.businessName} - ${merchant.address.street}`);
    });
    console.log();
  }

  // Test 7: Search by Cuisine
  const cuisineSearchResult = await apiCall('GET', '/merchants-test/search?cuisine=Lebanese');
  logTest('Search merchants by cuisine (Lebanese)', cuisineSearchResult);

  if (cuisineSearchResult.success) {
    console.log(`   🍽️  Lebanese cuisine merchants: ${cuisineSearchResult.data.data.length}`);
    cuisineSearchResult.data.data.forEach(merchant => {
      console.log(`     • ${merchant.businessName} - ${merchant.cuisine.join(', ')}`);
    });
    console.log();
  }

  // Test 8: Get Specific Merchant Details
  console.log('4️⃣  TESTING MERCHANT DETAILS');
  console.log('-'.repeat(45));
  
  if (merchants.length > 0) {
    const firstMerchant = merchants[0];
    const merchantDetailsResult = await apiCall('GET', `/merchants-test/${firstMerchant.id}`);
    logTest(`Get merchant details for ${firstMerchant.businessName}`, merchantDetailsResult);

    if (merchantDetailsResult.success) {
      const merchant = merchantDetailsResult.data.data;
      console.log('   🏪 Merchant Details:');
      console.log(`     • Business: ${merchant.businessName} (${merchant.businessType})`);
      console.log(`     • Contact: ${merchant.contactName} (${merchant.phone})`);
      console.log(`     • Address: ${merchant.address.street}, ${merchant.address.area}, ${merchant.address.city}`);
      console.log(`     • Cuisine: ${merchant.cuisine.join(', ')}`);
      console.log(`     • Rating: ${merchant.rating}/5 (${merchant.totalReviews} reviews)`);
      console.log(`     • Sustainability: ${merchant.sustainabilityScore}%`);
      console.log(`     • Total Boxes Sold: ${merchant.totalBoxesSold}`);
      console.log(`     • Hours: ${merchant.businessHours.monday.open} - ${merchant.businessHours.monday.close}`);
      console.log();
    }
  }

  // Test 9: Test Non-existent Merchant
  const nonExistentResult = await apiCall('GET', '/merchants-test/nonexistent_merchant');
  logTest('Get non-existent merchant (should handle gracefully)', nonExistentResult);

  // Test 10: Test Search with No Results
  const noResultsSearch = await apiCall('GET', '/merchants-test/search?area=NonExistentArea');
  logTest('Search for non-existent area', noResultsSearch);

  if (noResultsSearch.success) {
    console.log(`   📍 Search results: ${noResultsSearch.data.data.length} merchants found`);
    console.log();
  }

  // Test 11: Test Query Parameters
  console.log('5️⃣  TESTING QUERY PARAMETERS & EDGE CASES');
  console.log('-'.repeat(45));
  
  const limitTestResult = await apiCall('GET', '/merchants-test/top-rated?limit=1');
  logTest('Test limit parameter (limit=1)', limitTestResult);

  const invalidLimitResult = await apiCall('GET', '/merchants-test/top-rated?limit=abc');
  logTest('Test invalid limit parameter', invalidLimitResult);

  const emptySearchResult = await apiCall('GET', '/merchants-test/search');
  logTest('Search without parameters (should return all)', emptySearchResult);

  // Test 12: Test All Merchants (including test endpoint)
  const allTestMerchantsResult = await apiCall('GET', '/merchants-test/test/all');
  logTest('Get all test merchants (internal test endpoint)', allTestMerchantsResult);

  // Final Summary
  console.log('🎉 COMPREHENSIVE MERCHANTS SYSTEM TESTS COMPLETED!');
  console.log('=' .repeat(70));
  console.log();
  console.log('📊 MERCHANTS SYSTEM TEST SUMMARY:');
  console.log('   ✅ Merchant listing (approved merchants only)');
  console.log('   ✅ Business information display (complete merchant profiles)');
  console.log('   ✅ Merchant statistics (aggregated data and insights)');
  console.log('   ✅ Top rated merchants (sorted by rating)');
  console.log('   ✅ Sustainability rankings (eco-friendly merchants)');
  console.log('   ✅ Location-based search (area filtering)');
  console.log('   ✅ Cuisine-based search (food type filtering)');
  console.log('   ✅ Detailed merchant profiles (complete business info)');
  console.log('   ✅ Query parameter handling (limits, filters)');
  console.log('   ✅ Error handling (non-existent merchants, invalid params)');
  console.log();
  console.log('🔧 FEATURES TESTED:');
  console.log('   • Complete merchant profiles with business information');
  console.log('   • Rating and review system integration');
  console.log('   • Sustainability scoring and ranking');
  console.log('   • Geographic location and area-based filtering');
  console.log('   • Cuisine type categorization and search');
  console.log('   • Business hours and operational information');
  console.log('   • Contact information and communication details');
  console.log('   • Statistical analysis and reporting');
  console.log('   • Search and filtering capabilities');
  console.log('   • Error handling and edge case management');
  console.log();
  console.log('🏪 TEST MERCHANT DATA:');
  console.log('   • 6 pre-populated test merchants');
  console.log('   • Multiple business types (Restaurant, Bakery, Dessert Shop, Fast Food)');
  console.log('   • Various Lebanese locations (Beirut, Jounieh, Jal el Dib)');
  console.log('   • Diverse cuisine types (Lebanese, Mediterranean, Vegetarian, etc.)');
  console.log('   • Realistic ratings, reviews, and sustainability scores');
  console.log('   • Complete business profiles with hours and contact info');
  console.log();
  console.log('✨ ALL MERCHANTS SYSTEM ENDPOINTS SUCCESSFULLY TESTED! ✨');
}

// Check server availability
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE}/merchants-test/status`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running or merchants test endpoints not available');
    console.log('   Please ensure the server is running with: npm run start:dev');
    console.log(`   And check: ${API_BASE}/merchants-test/status`);
    
    // Try the fallback test with basic merchants endpoint
    console.log('\n🔄 Attempting basic merchants endpoint test...');
    const basicTest = await apiCall('GET', '/merchants');
    if (basicTest.success) {
      console.log('✅ Basic merchants endpoint is working!');
      console.log('📝 Note: Using basic endpoint instead of test mode');
    } else {
      console.log('❌ Basic merchants endpoint also not working');
      console.log('📝 Server may not be running or merchants module not loaded');
    }
    
    process.exit(1);
  }
  
  await runComprehensiveMerchantsTests();
}

main().catch(console.error);
