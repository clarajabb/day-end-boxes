import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthTestService } from './auth-test.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtTestAuthGuard } from './guards/jwt-test-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  UpdateProfileDto,
} from './dto';

@ApiTags('Authentication (Test Mode)')
@Controller('auth-test')
export class AuthTestController {
  constructor(private readonly authTestService: AuthTestService) {}

  @Get('status')
  @ApiOperation({ summary: 'Test mode status' })
  @ApiResponse({ status: 200, description: 'Test mode information' })
  getStatus() {
    return {
      success: true,
      message: 'Authentication service running in TEST MODE',
      note: 'All OTPs are: 123456',
      features: {
        database: 'In-memory (no Prisma)',
        redis: 'In-memory (no Redis)',
        otp: 'Mock service (always 123456)',
        rateLimiting: 'In-memory implementation'
      },
      endpoints: {
        'POST /auth-test/send-otp': 'Send OTP (always 123456)',
        'POST /auth-test/verify-otp': 'Verify OTP and get tokens',
        'POST /auth-test/refresh': 'Refresh access token',
        'GET /auth-test/profile': 'Get user profile',
        'PATCH /auth-test/profile': 'Update user profile',
        'POST /auth-test/logout': 'Logout user'
      }
    };
  }

  @Get('debug')
  @ApiOperation({ summary: 'Debug endpoint to test JWT validation (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Debug info returned' })
  debug(@Req() req: any) {
    const authHeader = req.headers.authorization;
    return {
      success: true,
      message: 'Debug endpoint working',
      authHeader: authHeader,
      hasBearer: authHeader?.startsWith('Bearer '),
      note: 'This endpoint does not require authentication'
    };
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Send OTP to phone number (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number or rate limited' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    await this.authTestService.sendOtp(sendOtpDto.phone, sendOtpDto.locale);
    return {
      success: true,
      message: 'OTP sent successfully',
      note: 'TEST MODE: Check console logs for OTP (always 123456)'
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify OTP and get JWT tokens (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authTestService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.otp,
    );

    return {
      success: true,
      message: 'OTP verified successfully',
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const result = await this.authTestService.refreshToken(
      refreshTokenDto.refreshToken,
    );

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@GetUser() user: any) {
    const profile = await this.authTestService.getUserProfile(user.sub);
    return {
      success: true,
      data: profile,
    };
  }

  @Patch('profile')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedProfile = await this.authTestService.updateUserProfile(
      user.sub,
      updateProfileDto,
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    };
  }

  @Post('logout')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Body() body: { refreshToken?: string }) {
    try {
      if (body.refreshToken) {
        await this.authTestService.logout(body.refreshToken);
      }
      return {
        success: true,
        message: 'Logged out successfully',
        note: 'TEST MODE: Token invalidated from in-memory store'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Logout failed',
        error: error.message
      };
    }
  }
}
