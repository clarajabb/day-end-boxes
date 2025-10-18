import { Controller, Get, Post, Body, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all approved merchants (public)' })
  @ApiResponse({ status: 200, description: 'Merchants retrieved successfully' })
  async getAllMerchants() {
    const merchants = await this.merchantsService.findAll();
    return {
      success: true,
      data: merchants,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new merchant' })
  @ApiResponse({ status: 201, description: 'Merchant registered successfully' })
  @ApiResponse({ status: 409, description: 'Merchant already exists' })
  async register(@Body() registerDto: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    password: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
  }) {
    const result = await this.merchantsService.register(registerDto);
    return {
      success: true,
      data: result,
      message: 'Merchant registered successfully. Account pending approval.'
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login merchant' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: { email: string; password: string }) {
    const result = await this.merchantsService.login(loginDto.email, loginDto.password);
    return {
      success: true,
      data: result,
      message: 'Login successful'
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get merchant profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@GetUser() user: any) {
    const profile = await this.merchantsService.getMerchantProfile(user.id);
    return {
      success: true,
      data: profile
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update merchant profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@GetUser() user: any, @Body() updateDto: any) {
    const profile = await this.merchantsService.updateMerchantProfile(user.id, updateDto);
    return {
      success: true,
      data: profile,
      message: 'Profile updated successfully'
    };
  }
}
