import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

/**
 * Test version of AuthService that works without database/Redis
 * This allows us to test the authentication endpoints without external dependencies
 */
@Injectable()
export class AuthTestService {
  private readonly logger = new Logger(AuthTestService.name);
  
  // In-memory storage for testing
  private otpStore = new Map<string, { otp: string; attempts: number; createdAt: Date }>();
  private rateLimitStore = new Map<string, { count: number; resetTime: Date }>();
  private userStore = new Map<string, any>();
  private refreshTokenStore = new Map<string, { userId: string; expiresAt: Date }>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sendOtp(phone: string, locale: string = 'ar'): Promise<void> {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phone);

      // Check rate limiting (3 per minute)
      const rateLimitKey = `otp:${normalizedPhone}`;
      const now = new Date();
      const rateLimit = this.rateLimitStore.get(rateLimitKey);
      
      if (rateLimit && rateLimit.count >= 3 && now < rateLimit.resetTime) {
        throw new BadRequestException('Too many OTP requests. Please try again later.');
      }

      // Reset rate limit if time has passed
      if (!rateLimit || now >= rateLimit.resetTime) {
        this.rateLimitStore.set(rateLimitKey, {
          count: 1,
          resetTime: new Date(now.getTime() + 60 * 1000) // 1 minute
        });
      } else {
        rateLimit.count++;
      }

      // Generate and store OTP
      const otp = this.generateOtp();
      this.otpStore.set(normalizedPhone, {
        otp,
        attempts: 0,
        createdAt: now
      });

      // Mock sending OTP (log to console)
      this.logger.log(`📱 OTP for ${normalizedPhone}: ${otp}`);
      this.logger.log(`🚀 Mock SMS sent to ${normalizedPhone} in ${locale}`);

      // Clean up expired OTPs
      this.cleanupExpiredOtps();

    } catch (error) {
      this.logger.error(`Error sending OTP: ${error.message}`);
      throw error;
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: any;
  }> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phone);
      
      // Check rate limiting for verify attempts (5 per minute)
      const rateLimitKey = `verify:${normalizedPhone}`;
      const now = new Date();
      const rateLimit = this.rateLimitStore.get(rateLimitKey);
      
      if (rateLimit && rateLimit.count >= 5 && now < rateLimit.resetTime) {
        throw new BadRequestException('Too many verification attempts. Please try again later.');
      }

      // Update rate limiting
      if (!rateLimit || now >= rateLimit.resetTime) {
        this.rateLimitStore.set(rateLimitKey, {
          count: 1,
          resetTime: new Date(now.getTime() + 60 * 1000)
        });
      } else {
        rateLimit.count++;
      }

      // Get stored OTP
      const storedOtpData = this.otpStore.get(normalizedPhone);
      if (!storedOtpData) {
        throw new BadRequestException('OTP has expired or is invalid');
      }

      // Check if OTP has expired (5 minutes)
      const otpAge = now.getTime() - storedOtpData.createdAt.getTime();
      if (otpAge > 5 * 60 * 1000) {
        this.otpStore.delete(normalizedPhone);
        throw new BadRequestException('OTP has expired');
      }

      // Check OTP attempts
      if (storedOtpData.attempts >= 3) {
        this.otpStore.delete(normalizedPhone);
        throw new BadRequestException('Too many incorrect attempts');
      }

      // Verify OTP
      if (storedOtpData.otp !== otp) {
        storedOtpData.attempts++;
        throw new BadRequestException('Invalid OTP');
      }

      // OTP is correct, clean up
      this.otpStore.delete(normalizedPhone);

      // Create or get user
      let user = this.userStore.get(normalizedPhone);
      if (!user) {
        user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          phone: normalizedPhone,
          name: null,
          email: null,
          preferredLocale: 'ar',
          notificationPreferences: {
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };
        this.userStore.set(normalizedPhone, user);
      }

      // Generate tokens
      const accessToken = this.jwtService.sign(
        { sub: user.id, phone: user.phone },
        { expiresIn: '15m' }
      );

      const refreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        { 
          secret: this.configService.get('REFRESH_JWT_SECRET', 'fallback-refresh-secret'),
          expiresIn: '30d' 
        }
      );

      // Store refresh token
      this.refreshTokenStore.set(refreshToken, {
        userId: user.id,
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      return {
        accessToken,
        refreshToken,
        user
      };

    } catch (error) {
      this.logger.error(`Error verifying OTP: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Check if refresh token exists
      const tokenData = this.refreshTokenStore.get(refreshToken);
      if (!tokenData || new Date() > tokenData.expiresAt) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Find user
      const user = Array.from(this.userStore.values()).find(u => u.id === tokenData.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        { sub: user.id, phone: user.phone },
        { expiresIn: '15m' }
      );

      return { accessToken };

    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    let user = Array.from(this.userStore.values()).find(u => u.id === userId);
    
    // If user not found, create a basic profile (common in test scenarios)
    if (!user) {
      user = {
        id: userId,
        phone: '+96171000000', // Default phone
        name: null,
        email: null,
        preferredLocale: 'ar',
        notificationPreferences: {
          pushEnabled: true,
          smsEnabled: true,
          emailEnabled: false
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store this user for future requests
      this.userStore.set(userId, user);
    }
    
    return user;
  }

  async updateUserProfile(userId: string, updateData: any): Promise<any> {
    // Get or create user profile first
    let user = await this.getUserProfile(userId);

    // Update user data
    Object.assign(user, updateData, { updatedAt: new Date().toISOString() });
    
    // Update in store
    this.userStore.set(user.phone, user);
    
    return user;
  }

  async logout(refreshToken: string): Promise<void> {
    // Remove refresh token
    this.refreshTokenStore.delete(refreshToken);
  }

  // Helper methods
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Lebanese numbers
    if (cleaned.startsWith('961')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('71') || cleaned.startsWith('70') || cleaned.startsWith('76') || cleaned.startsWith('78') || cleaned.startsWith('79')) {
      return '+961' + cleaned;
    } else if (cleaned.startsWith('1') || cleaned.startsWith('3') || cleaned.startsWith('81')) {
      return '+961' + cleaned;
    }
    
    // If it doesn't match Lebanese patterns, validate it anyway
    if (!cleaned.startsWith('961') && cleaned.length >= 8) {
      throw new BadRequestException('Phone number must be a valid Lebanese number (+961)');
    }
    
    return '+' + cleaned;
  }

  private generateOtp(): string {
    // For testing, always return the same OTP
    return '123456';
  }

  private cleanupExpiredOtps(): void {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    for (const [phone, data] of this.otpStore.entries()) {
      if (data.createdAt < fiveMinutesAgo) {
        this.otpStore.delete(phone);
      }
    }
  }
}
