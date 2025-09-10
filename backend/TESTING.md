# 🧪 Authentication API Testing Guide

This guide covers testing all the authentication endpoints for the Day-End Boxes API.

## 📋 Test Coverage

The authentication system includes comprehensive tests for:

### ✅ **Core Functionality**
- ✅ Lebanese phone number validation (+961 prefix)
- ✅ OTP generation and verification (6-digit codes)
- ✅ JWT token management (access + refresh tokens)
- ✅ User profile management (CRUD operations)
- ✅ Rate limiting (3 OTP requests/min, 5 verify attempts/min)
- ✅ Session management and logout

### ✅ **Security Features**
- ✅ Input validation and sanitization
- ✅ JWT token validation and expiration
- ✅ Rate limiting protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Token invalidation on logout

### ✅ **Error Handling**
- ✅ Invalid phone number formats
- ✅ Expired/invalid OTP codes
- ✅ Malformed JWT tokens
- ✅ Missing authentication headers
- ✅ Rate limit exceeded responses

## 🚀 Running Tests

### Option 1: Manual Testing (Recommended)

**Prerequisites**: Server must be running on `http://localhost:3000`

```bash
# 1. Start the server in one terminal
cd backend
npm run start:dev

# 2. Run manual tests in another terminal
npm run test:manual
```

This will test all endpoints step-by-step and show you the actual API responses.

### Option 2: Automated Test Suite

```bash
# Run comprehensive test suite
npm run test:auth
```

### Option 3: Individual Endpoint Testing

You can test individual endpoints using curl or Postman:

#### 1. Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+96171123456",
    "locale": "ar"
  }'
```

#### 2. Verify OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+96171123456",
    "otp": "123456"
  }'
```

#### 3. Get Profile (requires JWT from step 2)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📱 Mock OTP Service

For testing, the OTP service is configured as "mock":
- **All OTP codes are**: `123456`
- **OTPs are logged to console** for verification
- **No real SMS is sent** during testing

## 🔍 Test Scenarios

### Phone Number Validation
- ✅ `+96171123456` (valid with prefix)
- ✅ `71123456` (valid without prefix)
- ❌ `+1234567890` (invalid country)
- ❌ `123` (too short)
- ❌ `abcdefgh` (non-numeric)

### OTP Verification
- ✅ `123456` (correct mock OTP)
- ❌ `000000` (incorrect OTP)
- ❌ `12345` (wrong length)
- ❌ `abcdef` (non-numeric)

### JWT Authentication
- ✅ Valid Bearer token in Authorization header
- ❌ Missing Authorization header
- ❌ Invalid JWT format
- ❌ Expired JWT token
- ❌ Malformed Authorization header

### Rate Limiting
- ✅ 3 OTP requests per minute allowed
- ❌ 4th OTP request returns 429 (Too Many Requests)
- ✅ 5 OTP verify attempts per minute allowed
- ❌ 6th verify attempt returns 429

## 📊 Expected Test Results

When running `npm run test:manual`, you should see:

```
🚀 Starting Manual Authentication API Tests

Testing API at: http://localhost:3000/api/v1

1️⃣  Testing: Send OTP
✅ Send OTP to Lebanese number (200)

2️⃣  Testing: Verify OTP
✅ Verify OTP and get tokens (200)
📱 Access Token: eyJhbGciOiJIUzI1NiIs...
🔄 Refresh Token: eyJhbGciOiJIUzI1NiIs...

3️⃣  Testing: Get User Profile
✅ Get user profile with JWT (200)

4️⃣  Testing: Update User Profile
✅ Update user profile (200)

5️⃣  Testing: Refresh Access Token
✅ Refresh access token (200)
🆕 New Access Token: eyJhbGciOiJIUzI1NiIs...

6️⃣  Testing: Invalid JWT Handling
✅ Reject invalid JWT (should fail) (401)

7️⃣  Testing: Rate Limiting
   ✅ Successful requests: 3
   ⚠️  Rate limited requests: 2
✅ Rate limiting working (200)

8️⃣  Testing: User Logout
✅ User logout (200)

9️⃣  Testing: Token Invalidation After Logout
✅ Refresh token invalidated (should fail) (401)

🎉 All manual tests completed!

📊 Test Summary:
   • Lebanese phone validation: ✅
   • OTP generation (mock): ✅
   • JWT authentication: ✅
   • Profile management: ✅
   • Token refresh: ✅
   • Rate limiting: ✅
   • Security (invalid JWT): ✅
   • Logout & token invalidation: ✅
```

## 🐛 Troubleshooting

### Server Not Running
```
❌ Server is not running at http://localhost:3000
   Please start the server first with: npm run start:dev
```
**Solution**: Start the server with `npm run start:dev`

### Database Connection Error
```
PrismaClientInitializationError: Database `day_end_boxes` does not exist
```
**Solution**: The tests work without database for authentication (uses mock services)

### Rate Limiting Issues
If you hit rate limits during testing:
- Wait 1 minute between test runs
- Use different phone numbers for testing
- Restart the server to reset rate limits

## 📋 API Documentation

For complete API documentation, visit:
```
http://localhost:3000/api/v1/docs
```

This provides interactive Swagger documentation where you can test endpoints directly in your browser.

## 🔧 Test Configuration

Tests are configured in:
- `test/auth.e2e-spec.ts` - Comprehensive test suite
- `manual-test-auth.js` - Manual testing script
- `test/jest-e2e.json` - Jest configuration
- `test/setup.ts` - Test environment setup

## 📈 Next Steps

After authentication tests pass:
1. Test other API modules (boxes, reservations, merchants)
2. Set up database for full integration testing
3. Test with real SMS provider (Twilio)
4. Add load testing for production readiness
