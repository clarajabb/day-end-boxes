# Day-End Boxes API Testing Guide

## Overview
This guide provides comprehensive documentation for testing all API endpoints in the Day-End Boxes backend using Postman. The API follows RESTful conventions and uses JWT authentication for protected endpoints.

## Base Configuration
- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **API Documentation**: `http://localhost:3000/api/v1/docs` (Swagger UI)

## Authentication Flow
1. Send OTP to phone number
2. Verify OTP to get JWT tokens
3. Use access token for authenticated requests
4. Refresh token when access token expires

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Health Check
**GET** `/auth/health`
- **Description**: Check if authentication service is running
- **Authentication**: None required
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "message": "Authentication service is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "endpoints": {
    "POST /auth/send-otp": "Send OTP to Lebanese phone number",
    "POST /auth/verify-otp": "Verify OTP and get JWT tokens",
    "POST /auth/refresh": "Refresh access token",
    "GET /auth/profile": "Get user profile (requires JWT)",
    "PATCH /auth/profile": "Update user profile (requires JWT)",
    "POST /auth/logout": "Logout user (requires JWT)"
  }
}
```

### 1.2 Send OTP
**POST** `/auth/send-otp`
- **Description**: Send OTP to Lebanese phone number
- **Authentication**: None required
- **Rate Limit**: 3 requests per minute
- **Request Body**:
```json
{
  "phone": "+96171123456",
  "locale": "ar"
}
```
- **Field Validation**:
  - `phone`: Lebanese phone number format (+96171123456 or 71123456)
  - `locale`: "ar" or "en"
- **Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 1.3 Verify OTP
**POST** `/auth/verify-otp`
- **Description**: Verify OTP and get JWT tokens
- **Authentication**: None required
- **Rate Limit**: 5 attempts per minute
- **Request Body**:
```json
{
  "phone": "+96171123456",
  "otp": "123456"
}
```
- **Field Validation**:
  - `phone`: Lebanese phone number format
  - `otp`: Exactly 6 digits
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "phone": "+96171123456",
      "name": null,
      "email": null,
      "preferredLocale": "ar",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 1.4 Refresh Token
**POST** `/auth/refresh`
- **Description**: Refresh access token using refresh token
- **Authentication**: None required
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.5 Get Profile
**GET** `/auth/profile`
- **Description**: Get current user profile
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phone": "+96171123456",
    "name": "Ahmad Khalil",
    "email": "ahmad@example.com",
    "preferredLocale": "ar",
    "notificationPreferences": {
      "pushEnabled": true,
      "smsEnabled": true,
      "emailEnabled": false
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.6 Update Profile
**PATCH** `/auth/profile`
- **Description**: Update user profile
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
```json
{
  "name": "Ahmad Khalil",
  "email": "ahmad@example.com",
  "preferredLocale": "ar",
  "notificationPreferences": {
    "pushEnabled": true,
    "smsEnabled": true,
    "emailEnabled": false
  }
}
```
- **Field Validation**:
  - All fields are optional
  - `email`: Valid email format
  - `preferredLocale`: "ar" or "en"
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phone": "+96171123456",
    "name": "Ahmad Khalil",
    "email": "ahmad@example.com",
    "preferredLocale": "ar",
    "notificationPreferences": {
      "pushEnabled": true,
      "smsEnabled": true,
      "emailEnabled": false
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 1.7 Logout
**POST** `/auth/logout`
- **Description**: Logout user and invalidate tokens
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. USERS ENDPOINTS

### 2.1 Get User Profile
**GET** `/users/profile`
- **Description**: Get current user profile (alternative endpoint)
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phone": "+96171123456",
    "name": "Ahmad Khalil",
    "email": "ahmad@example.com",
    "preferredLocale": "ar",
    "notificationPreferences": {
      "pushEnabled": true,
      "smsEnabled": true,
      "emailEnabled": false
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2.2 Get User Statistics
**GET** `/users/stats`
- **Description**: Get user reservation statistics
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "total": 4,
    "active": 1,
    "completed": 2,
    "cancelled": 1,
    "totalSaved": 25.50,
    "favoriteCategory": "Restaurant",
    "lastReservation": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 3. MERCHANTS ENDPOINTS

### 3.1 Get All Merchants
**GET** `/merchants`
- **Description**: Get all approved merchants
- **Authentication**: None required
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "merchant_1",
      "name": "Al Falamanki",
      "description": "Traditional Lebanese restaurant",
      "cuisine": "Lebanese",
      "area": "Hamra",
      "address": "Hamra Street, Beirut",
      "phone": "+96112345678",
      "email": "info@alfalamanki.com",
      "rating": 4.5,
      "isSustainable": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 4. BOXES ENDPOINTS

### 4.1 Get Nearby Boxes
**GET** `/boxes/nearby`
- **Description**: Get nearby available boxes
- **Authentication**: None required
- **Query Parameters**:
  - `lat`: Latitude (required)
  - `lng`: Longitude (required)
  - `radius`: Search radius in km (optional, default: 10)
- **Example**: `/boxes/nearby?lat=33.8938&lng=35.5018&radius=5`
- **Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "box_1",
      "merchantId": "merchant_1",
      "merchantName": "Al Falamanki",
      "boxType": "Mixed Lebanese",
      "originalPrice": 15.00,
      "discountedPrice": 7.50,
      "discountPercentage": 50,
      "availableQuantity": 5,
      "pickupTime": "18:00-20:00",
      "description": "Mixed Lebanese dishes",
      "allergens": ["gluten", "dairy"],
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 4.2 Get Box Details
**GET** `/boxes/:id`
- **Description**: Get specific box details
- **Authentication**: None required
- **Path Parameters**:
  - `id`: Box ID
- **Example**: `/boxes/box_1`
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "box_1",
    "merchantId": "merchant_1",
    "merchantName": "Al Falamanki",
    "merchantAddress": "Hamra Street, Beirut",
    "merchantPhone": "+96112345678",
    "boxType": "Mixed Lebanese",
    "originalPrice": 15.00,
    "discountedPrice": 7.50,
    "discountPercentage": 50,
    "availableQuantity": 5,
    "pickupTime": "18:00-20:00",
    "description": "Mixed Lebanese dishes including hummus, falafel, and tabbouleh",
    "allergens": ["gluten", "dairy"],
    "ingredients": ["chickpeas", "tahini", "parsley", "tomatoes"],
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 5. RESERVATIONS ENDPOINTS

### 5.1 Get User Reservations
**GET** `/reservations`
- **Description**: Get current user's reservations
- **Authentication**: Bearer Token required
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "reservation_1",
      "userId": "user_123",
      "boxId": "box_1",
      "merchantName": "Al Falamanki",
      "boxType": "Mixed Lebanese",
      "quantity": 1,
      "totalPrice": 7.50,
      "status": "active",
      "pickupTime": "18:00-20:00",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 6. ADMIN ENDPOINTS

### 6.1 Get Dashboard Stats
**GET** `/admin/stats`
- **Description**: Get admin dashboard statistics
- **Authentication**: None required (should be protected in production)
- **Request Body**: None
- **Expected Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalMerchants": 25,
    "totalReservations": 500,
    "totalRevenue": 2500.00,
    "activeReservations": 45,
    "completedReservations": 400,
    "cancelledReservations": 55,
    "averageRating": 4.3,
    "topMerchants": [
      {
        "id": "merchant_1",
        "name": "Al Falamanki",
        "reservations": 50,
        "rating": 4.5
      }
    ]
  }
}
```

---

## 7. TEST MODE ENDPOINTS

The API also includes test mode endpoints for development and testing purposes. These endpoints use in-memory data and mock services.

### 7.1 Authentication Test Endpoints
- **Base URL**: `http://localhost:3000/api/v1/auth-test`
- **Note**: All OTPs are `123456` in test mode

#### Test Status
**GET** `/auth-test/status`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Authentication service running in TEST MODE",
  "note": "All OTPs are: 123456",
  "features": {
    "database": "In-memory (no Prisma)",
    "redis": "In-memory (no Redis)",
    "otp": "Mock service (always 123456)",
    "rateLimiting": "In-memory implementation"
  }
}
```

#### Debug Endpoint
**GET** `/auth-test/debug`
- **Description**: Test JWT validation without authentication
- **Expected Response**:
```json
{
  "success": true,
  "message": "Debug endpoint working",
  "authHeader": null,
  "hasBearer": false,
  "note": "This endpoint does not require authentication"
}
```

### 7.2 Users Test Endpoints
- **Base URL**: `http://localhost:3000/api/v1/users-test`

#### Test Status
**GET** `/users-test/status`
- **Expected Response**:
```json
{
  "success": true,
  "message": "User Management service running in TEST MODE",
  "features": {
    "database": "In-memory (no Prisma)",
    "userData": "Pre-populated test users",
    "reservations": "Mock reservation statistics"
  },
  "testUsers": {
    "user_test_1": {
      "phone": "+96171123456",
      "name": "Ahmad Khalil",
      "reservations": "4 total (1 active, 2 completed, 1 cancelled)"
    }
  }
}
```

### 7.3 Merchants Test Endpoints
- **Base URL**: `http://localhost:3000/api/v1/merchants-test`

#### Test Status
**GET** `/merchants-test/status`
- **Expected Response**:
```json
{
  "success": true,
  "message": "Merchants service running in TEST MODE",
  "features": {
    "database": "In-memory (no Prisma)",
    "merchantData": "Pre-populated test merchants",
    "locations": "Beirut, Jounieh, Jal el Dib areas"
  },
  "testMerchants": {
    "total": 6,
    "types": ["Restaurant", "Bakery", "Dessert Shop", "Fast Food"],
    "areas": ["Hamra", "Verdun", "Ashrafieh", "Jounieh", "Metn"]
  }
}
```

---

## 8. ERROR RESPONSES

### Common Error Formats

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Phone number must be a valid Lebanese number"
    }
  ]
}
```

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

#### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Box with ID 'box_123' not found"
}
```

#### Rate Limited (429)
```json
{
  "success": false,
  "message": "Too many requests",
  "error": "Rate limit exceeded. Try again later."
}
```

#### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Something went wrong on our end"
}
```

---

## 9. POSTMAN COLLECTION SETUP

### Environment Variables
Create a Postman environment with these variables:
- `base_url`: `http://localhost:3000/api/v1`
- `access_token`: (will be set after login)
- `refresh_token`: (will be set after login)
- `user_id`: (will be set after login)

### Collection Structure
1. **Authentication**
   - Health Check
   - Send OTP
   - Verify OTP
   - Refresh Token
   - Get Profile
   - Update Profile
   - Logout

2. **Users**
   - Get Profile
   - Get Stats

3. **Merchants**
   - Get All Merchants

4. **Boxes**
   - Get Nearby Boxes
   - Get Box Details

5. **Reservations**
   - Get User Reservations

6. **Admin**
   - Get Dashboard Stats

7. **Test Mode**
   - Auth Test Status
   - Users Test Status
   - Merchants Test Status

### Pre-request Scripts
For authenticated endpoints, add this pre-request script:
```javascript
if (pm.environment.get("access_token")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("access_token")
    });
}
```

### Test Scripts
For login endpoint, add this test script to save tokens:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data) {
        pm.environment.set("access_token", response.data.accessToken);
        pm.environment.set("refresh_token", response.data.refreshToken);
        pm.environment.set("user_id", response.data.user.id);
    }
}
```

---

## 10. TESTING WORKFLOW

### Step-by-Step Testing Process

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Test Health Check**
   - GET `/auth/health`
   - Should return 200 with service status

3. **Test Authentication Flow**
   - POST `/auth/send-otp` with valid Lebanese phone number
   - POST `/auth/verify-otp` with phone and OTP (123456 in test mode)
   - Save the access token from response

4. **Test Authenticated Endpoints**
   - GET `/auth/profile` with Bearer token
   - PATCH `/auth/profile` with Bearer token
   - GET `/users/stats` with Bearer token
   - GET `/reservations` with Bearer token

5. **Test Public Endpoints**
   - GET `/merchants`
   - GET `/boxes/nearby` with lat/lng parameters
   - GET `/boxes/:id` with valid box ID
   - GET `/admin/stats`

6. **Test Error Cases**
   - Invalid phone number format
   - Wrong OTP code
   - Expired/invalid token
   - Missing required fields

7. **Test Rate Limiting**
   - Send multiple OTP requests quickly
   - Should get 429 error after limit

8. **Test Token Refresh**
   - POST `/auth/refresh` with refresh token
   - Should get new access token

### Test Data
- **Phone Numbers**: Use Lebanese format (+96171123456)
- **OTP**: Always 123456 in test mode
- **Coordinates**: Beirut area (lat: 33.8938, lng: 35.5018)
- **Box IDs**: Use IDs from nearby boxes response

---

## 11. TROUBLESHOOTING

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 3000
   - Check CORS configuration in main.ts

2. **Authentication Errors**
   - Verify token is properly formatted in Authorization header
   - Check if token has expired (15 minutes default)
   - Use refresh token to get new access token

3. **Validation Errors**
   - Check phone number format (Lebanese numbers only)
   - Verify OTP is exactly 6 digits
   - Ensure required fields are provided

4. **Rate Limiting**
   - Wait 1 minute between OTP requests
   - Use test mode endpoints for faster testing

5. **Database Issues**
   - Test mode uses in-memory data
   - Production mode requires database setup

### Debug Tips
- Use test mode endpoints for easier debugging
- Check console logs for detailed error messages
- Use Swagger UI at `/api/v1/docs` for interactive testing
- Monitor network tab for request/response details

---

This comprehensive guide covers all API endpoints with detailed request/response examples. Use this as a reference for thorough testing of your Day-End Boxes backend API.

