import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Authentication System (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  // Test data
  const validPhone = '+96171123456';
  const validPhoneLocal = '71123456';
  const invalidPhone = '+1234567890';
  const validOtp = '123456'; // This will be the mock OTP
  const invalidOtp = '000000';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Set global prefix
    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. POST /api/v1/auth/send-otp', () => {
    it('should send OTP to valid Lebanese phone number with +961 prefix', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: validPhone,
          locale: 'ar'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'OTP sent successfully'
      });
    });

    it('should send OTP to valid Lebanese phone number without prefix', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: validPhoneLocal,
          locale: 'en'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'OTP sent successfully'
      });
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: invalidPhone,
          locale: 'ar'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Phone number must be a valid Lebanese number');
    });

    it('should reject missing phone number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          locale: 'ar'
        })
        .expect(400);
    });

    it('should reject invalid locale', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: validPhone,
          locale: 'fr' // Invalid locale
        })
        .expect(400);
    });

    it('should apply rate limiting (3 requests per minute)', async () => {
      // Send 3 requests quickly
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/send-otp')
          .send({
            phone: `+96171${1000 + i}`,
            locale: 'ar'
          })
          .expect(200);
      }

      // 4th request should be rate limited
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: '+96171999999',
          locale: 'ar'
        })
        .expect(429);
    });
  });

  describe('2. POST /api/v1/auth/verify-otp', () => {
    beforeEach(async () => {
      // Send OTP first
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: validPhone,
          locale: 'ar'
        })
        .expect(200);
    });

    it('should verify valid OTP and return JWT tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: validPhone,
          otp: validOtp
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      
      // Store tokens for later tests
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
      userId = response.body.data.user.id;

      // Validate user object structure
      expect(response.body.data.user).toEqual({
        id: expect.any(String),
        phone: validPhone,
        name: null,
        email: null,
        preferredLocale: 'ar',
        notificationPreferences: {
          pushEnabled: true,
          smsEnabled: true,
          emailEnabled: false
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      // Validate JWT token format
      expect(accessToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);
      expect(refreshToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);
    });

    it('should reject invalid OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: validPhone,
          otp: invalidOtp
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid OTP');
    });

    it('should reject expired/non-existent OTP session', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: '+96171999999', // Phone that didn't receive OTP
          otp: validOtp
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('OTP has expired or is invalid');
    });

    it('should reject malformed OTP', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: validPhone,
          otp: '12345' // Too short
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: validPhone,
          otp: 'abcdef' // Non-numeric
        })
        .expect(400);
    });

    it('should apply rate limiting (5 attempts per minute)', async () => {
      // Try invalid OTP 5 times
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/verify-otp')
          .send({
            phone: validPhone,
            otp: '99999' + i
          })
          .expect(400);
      }

      // 6th attempt should be rate limited
      await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({
          phone: validPhone,
          otp: '999999'
        })
        .expect(429);
    });
  });

  describe('3. POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: refreshToken
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.accessToken).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/);
      
      // Update access token for further tests
      accessToken = response.body.data.accessToken;
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid.refresh.token'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('4. GET /api/v1/auth/profile', () => {
    it('should get user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: userId,
        phone: validPhone,
        name: null,
        email: null,
        preferredLocale: 'ar',
        notificationPreferences: {
          pushEnabled: true,
          smsEnabled: true,
          emailEnabled: false
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should reject request without JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid JWT', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);
    });

    it('should reject request with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', accessToken) // Missing "Bearer "
        .expect(401);
    });
  });

  describe('5. PATCH /api/v1/auth/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        name: 'Ahmad Khalil',
        email: 'ahmad@example.com',
        preferredLocale: 'en',
        notificationPreferences: {
          pushEnabled: false,
          smsEnabled: true,
          emailEnabled: true
        }
      };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        id: userId,
        phone: validPhone,
        name: 'Ahmad Khalil',
        email: 'ahmad@example.com',
        preferredLocale: 'en',
        notificationPreferences: {
          pushEnabled: false,
          smsEnabled: true,
          emailEnabled: true
        },
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('should update partial profile data', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Ahmad Updated'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Ahmad Updated');
      // Other fields should remain unchanged
      expect(response.body.data.email).toBe('ahmad@example.com');
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email'
        })
        .expect(400);
    });

    it('should reject invalid locale', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          preferredLocale: 'fr' // Invalid locale
        })
        .expect(400);
    });

    it('should reject request without JWT', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .send({
          name: 'Test'
        })
        .expect(401);
    });
  });

  describe('6. POST /api/v1/auth/logout', () => {
    it('should logout user with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should invalidate refresh token after logout', async () => {
      // Try to use the refresh token after logout
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: refreshToken
        })
        .expect(401);
    });

    it('should reject request without JWT', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle concurrent OTP requests for same phone', async () => {
      const promises = Array(3).fill(null).map(() =>
        request(app.getHttpServer())
          .post('/api/v1/auth/send-otp')
          .send({
            phone: '+96171888888',
            locale: 'ar'
          })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed (within rate limit)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle SQL injection attempts in phone number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: "+96171123456'; DROP TABLE users; --",
          locale: 'ar'
        })
        .expect(400); // Should be rejected by validation
    });

    it('should handle XSS attempts in profile update', async () => {
      // First authenticate
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({ phone: '+96171777777', locale: 'ar' });

      const authResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '+96171777777', otp: validOtp });

      const token = authResponse.body.data.accessToken;

      await request(app.getHttpServer())
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '<script>alert("xss")</script>'
        })
        .expect(200); // Should accept but sanitize
    });

    it('should handle extremely long input values', async () => {
      const longString = 'a'.repeat(1000);
      
      await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: longString,
          locale: 'ar'
        })
        .expect(400);
    });
  });

  describe('Response Format Validation', () => {
    it('should have consistent success response format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: '+96171555555',
          locale: 'ar'
        });

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should have consistent error response format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/send-otp')
        .send({
          phone: 'invalid',
          locale: 'ar'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    });
  });
});
