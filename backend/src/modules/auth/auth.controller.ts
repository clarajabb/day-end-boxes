import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import {
  SendOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  UpdateProfileDto,
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
} from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for authentication service' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      success: true,
      message: 'Authentication service is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /auth/send-otp': 'Send OTP to Lebanese phone number',
        'POST /auth/verify-otp': 'Verify OTP and get JWT tokens',
        'POST /auth/refresh': 'Refresh access token',
        'GET /auth/profile': 'Get user profile (requires JWT)',
        'PATCH /auth/profile': 'Update user profile (requires JWT)',
        'POST /auth/logout': 'Logout user (requires JWT)'
      }
    };
  }

  @Get('debug-otp')
  @ApiOperation({ summary: 'Debug endpoint to show current OTP (for development only)' })
  @ApiResponse({ status: 200, description: 'Current OTP information' })
  async debugOtp(@Query('phone') phone: string) {
    return await this.authService.debugOtp(phone);
  }

  @Get('test-redis')
  @ApiOperation({ summary: 'Test Redis connection' })
  @ApiResponse({ status: 200, description: 'Redis test result' })
  async testRedis() {
    return await this.authService.testRedis();
  }

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    await this.authService.sendOtp(sendOtpDto.phone, sendOtpDto.locale);
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Verify OTP and get access token' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid OTP' })
  @ApiResponse({ status: 429, description: 'Too many attempts' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(
      verifyOtpDto.phone,
      verifyOtpDto.otp,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    const accessToken = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );

    return {
      success: true,
      data: { accessToken },
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@GetUser() user: any) {
    const profile = await this.authService.getUserProfile(user.id);
    return {
      success: true,
      data: profile,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @GetUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedProfile = await this.authService.updateUserProfile(
      user.id,
      updateProfileDto,
    );

    return {
      success: true,
      data: updatedProfile,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@GetUser() user: any) {
    await this.authService.logout(user.id);
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // Email/Password Authentication Endpoints
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user with email and password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'User already exists or validation error' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      message: 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid current password' })
  async changePassword(
    @GetUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, changePasswordDto);
    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
