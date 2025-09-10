import { Controller, Get, UseGuards, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { UsersTestService } from './users-test.service';
import { JwtTestAuthGuard } from '../auth/guards/jwt-test-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Users (Test Mode)')
@Controller('users-test')
export class UsersTestController {
  constructor(private readonly usersTestService: UsersTestService) {}

  @Get('status')
  @ApiOperation({ summary: 'Test mode status for users service' })
  @ApiResponse({ status: 200, description: 'Test mode information' })
  getStatus() {
    return {
      success: true,
      message: 'User Management service running in TEST MODE',
      features: {
        database: 'In-memory (no Prisma)',
        userData: 'Pre-populated test users',
        reservations: 'Mock reservation statistics'
      },
      testUsers: {
        'user_test_1': {
          phone: '+96171123456',
          name: 'Ahmad Khalil',
          reservations: '4 total (1 active, 2 completed, 1 cancelled)'
        },
        'user_test_2': {
          phone: '+96171987654',
          name: 'Sara Mansour',
          reservations: '2 total (2 active)'
        }
      },
      endpoints: {
        'GET /users-test/profile': 'Get user profile (requires JWT)',
        'GET /users-test/stats': 'Get user reservation statistics (requires JWT)',
        'GET /users-test/all': 'Get all test users (for testing)',
        'POST /users-test/create': 'Create test user',
        'POST /users-test/:id/reservation': 'Add test reservation'
      }
    };
  }

  @Get('debug')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Debug JWT authentication (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'JWT authentication working' })
  debugAuth(@GetUser() user: any) {
    return {
      success: true,
      message: 'JWT authentication is working!',
      user: user,
      note: 'This endpoint just returns the JWT payload'
    };
  }

  @Get('profile')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@GetUser() user: any) {
    try {
      // Try to find existing user first
      let profile;
      try {
        profile = await this.usersTestService.findById(user.sub || user.id);
      } catch (error) {
        // User not found, create from JWT data
        profile = {
          id: user.sub || user.id,
          phone: user.phone || '+96171000000',
          name: null,
          email: null,
          preferredLocale: 'ar',
          notificationPreferences: {
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store this user for future requests
        await this.usersTestService.createDynamicUser(profile);
      }
      
      return {
        success: true,
        message: 'User profile retrieved successfully',
        data: profile,
        note: 'TEST MODE: Using in-memory user data'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        error: error.message
      };
    }
  }

  @Get('stats')
  @UseGuards(JwtTestAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user reservation statistics (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getStats(@GetUser() user: any) {
    try {
      // Try to get stats for existing user
      let stats;
      try {
        stats = await this.usersTestService.getUserReservationStats(user.sub || user.id);
      } catch (error) {
        // User not found, create user and return empty stats
        const basicProfile = {
          id: user.sub || user.id,
          phone: user.phone || '+96171000000',
          name: null,
          email: null,
          preferredLocale: 'ar',
          notificationPreferences: {
            pushEnabled: true,
            smsEnabled: true,
            emailEnabled: false
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await this.usersTestService.createDynamicUser(basicProfile);
        
        stats = {
          total: 0,
          active: 0,
          completed: 0,
          cancelled: 0,
          totalSaved: 0,
          favoriteCategory: null,
          lastReservation: null
        };
      }
      
      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats,
        note: 'TEST MODE: Using in-memory reservation data'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve user statistics',
        error: error.message
      };
    }
  }

  // Additional test endpoints
  @Get('all')
  @ApiOperation({ summary: 'Get all test users (for testing purposes)' })
  @ApiResponse({ status: 200, description: 'All test users retrieved' })
  async getAllTestUsers() {
    const users = await this.usersTestService.getAllTestUsers();
    return {
      success: true,
      message: `Retrieved ${users.length} test users`,
      data: users
    };
  }

  @Get(':id/reservations')
  @ApiOperation({ summary: 'Get user reservations (for testing purposes)' })
  @ApiResponse({ status: 200, description: 'User reservations retrieved' })
  async getUserReservations(@Param('id') userId: string) {
    try {
      const reservations = await this.usersTestService.getUserReservations(userId);
      return {
        success: true,
        message: `Retrieved ${reservations.length} reservations for user ${userId}`,
        data: reservations
      };
    } catch (error) {
      return {
        success: true,
        message: 'No reservations found for user',
        data: []
      };
    }
  }

  @Post('create')
  @ApiOperation({ summary: 'Create test user (for testing purposes)' })
  @ApiResponse({ status: 201, description: 'Test user created successfully' })
  async createTestUser(@Body() userData: {
    phone: string;
    name?: string;
    email?: string;
    preferredLocale?: string;
  }) {
    const user = await this.usersTestService.createTestUser(userData);
    return {
      success: true,
      message: 'Test user created successfully',
      data: user
    };
  }

  @Post(':id/reservation')
  @ApiOperation({ summary: 'Add test reservation for user (for testing purposes)' })
  @ApiResponse({ status: 201, description: 'Test reservation added successfully' })
  async addTestReservation(
    @Param('id') userId: string,
    @Body() reservationData: {
      status?: string;
      boxType: string;
      merchantName: string;
    }
  ) {
    try {
      const reservation = await this.usersTestService.addTestReservation(userId, reservationData);
      return {
        success: true,
        message: 'Test reservation added successfully',
        data: reservation
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to add reservation: ' + error.message
      };
    }
  }
}
