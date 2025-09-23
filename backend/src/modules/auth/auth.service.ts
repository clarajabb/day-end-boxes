import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { OtpService } from '../../common/otp/otp.service';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
    private usersService: UsersService,
  ) {}

  async sendOtp(phone: string, locale: string = 'ar'): Promise<void> {
    // Normalize phone number
    const normalizedPhone = this.normalizePhoneNumber(phone);
    this.logger.log(`📱 Normalized phone: ${normalizedPhone}`);

    // Check rate limiting
    const rateLimitKey = `otp:rate_limit:${normalizedPhone}`;
    const attempts = await this.redis.get(rateLimitKey);
    
    if (attempts && parseInt(attempts) >= 3) {
      throw new BadRequestException('Too many OTP requests. Please try again later.');
    }

    // Generate and store OTP
    const otp = this.generateOtp();
    this.logger.log(`🔐 Generated OTP for ${normalizedPhone}: ${otp}`);
    const otpKey = `otp:${normalizedPhone}`;
    this.logger.log(`🔑 OTP key: ${otpKey}`);
    const otpData = {
      otp,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    // Store OTP with 5-minute expiration
    await this.redis.set(otpKey, JSON.stringify(otpData), 300);
    this.logger.log(`💾 Stored OTP in Redis with key: ${otpKey}`);

    // Update rate limiting
    const currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.redis.set(rateLimitKey, currentAttempts.toString(), 3600); // 1 hour

    // Store in database for audit
    await this.prisma.otpVerification.create({
      data: {
        phone: normalizedPhone,
        otp: await bcrypt.hash(otp, 10), // Hash OTP for security
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Send OTP via SMS
    try {
      await this.otpService.sendOtp(normalizedPhone, otp, locale);
      this.logger.log(`OTP sent to ${normalizedPhone}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${normalizedPhone}:`, error);
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<any> {
    const normalizedPhone = this.normalizePhoneNumber(phone);
    const otpKey = `otp:${normalizedPhone}`;

    // Get OTP data from Redis
    const otpDataStr = await this.redis.get(otpKey);
    if (!otpDataStr) {
      throw new BadRequestException('OTP has expired or is invalid');
    }

    const otpData = JSON.parse(otpDataStr);

    // Check attempts
    if (otpData.attempts >= 3) {
      await this.redis.del(otpKey);
      throw new BadRequestException('Too many invalid attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      await this.redis.set(otpKey, JSON.stringify(otpData), 300);
      throw new BadRequestException('Invalid OTP');
    }

    // Clean up OTP
    await this.redis.del(otpKey);
    await this.redis.del(`otp:rate_limit:${normalizedPhone}`);

    // Mark OTP as verified in database
    await this.prisma.otpVerification.updateMany({
      where: {
        phone: normalizedPhone,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      data: { verified: true },
    });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: normalizedPhone,
          preferredLocale: 'ar', // Default to Arabic for Lebanese users
          notificationPreferences: {
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false,
          },
        },
      });
      this.logger.log(`New user created: ${user.id}`);
    } else {
      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        preferredLocale: user.preferredLocale,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<string> {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_JWT_SECRET'),
      });

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: decoded.sub,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        { sub: decoded.sub },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        },
      );

      return accessToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<any> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async logout(userId: string): Promise<void> {
    // Invalidate all refresh tokens for the user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    this.logger.log(`User ${userId} logged out`);
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        isActive: true,
      },
    });

    return user;
  }

  private async generateTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.configService.get('REFRESH_JWT_SECRET'),
          expiresIn: this.configService.get('REFRESH_JWT_EXPIRES_IN', '30d'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async testRedis(): Promise<any> {
    try {
      const testKey = 'test:redis:connection';
      const testValue = 'hello world';
      
      await this.redis.set(testKey, testValue, 60);
      const retrieved = await this.redis.get(testKey);
      await this.redis.del(testKey);
      
      return {
        success: true,
        message: 'Redis is working',
        test: {
          set: testValue,
          get: retrieved,
          match: testValue === retrieved
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Redis test failed',
        error: error.message
      };
    }
  }

  async debugOtp(phone: string): Promise<any> {
    const normalizedPhone = this.normalizePhoneNumber(phone);
    const otpKey = `otp:${normalizedPhone}`;
    const otpData = await this.redis.get(otpKey);
    
    if (!otpData) {
      return {
        success: false,
        message: 'No OTP found for this phone number',
        phone: normalizedPhone
      };
    }
    
    const parsed = JSON.parse(otpData);
    return {
      success: true,
      message: 'OTP found',
      phone: normalizedPhone,
      otp: parsed.otp,
      attempts: parsed.attempts,
      createdAt: parsed.createdAt
    };
  }

  private generateOtp(): string {
    // For development, use a fixed OTP
    return '123456';
    // return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private normalizePhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let normalized = phone.replace(/\D/g, '');
    
    // If it starts with 961, add the + prefix
    if (normalized.startsWith('961')) {
      normalized = '+' + normalized;
    }
    // If it's 8 digits, assume it's Lebanese and add +961
    else if (normalized.length === 8) {
      normalized = '+961' + normalized;
    }
    
    return normalized;
  }
}
