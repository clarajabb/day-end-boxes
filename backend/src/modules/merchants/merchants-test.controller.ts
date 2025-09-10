import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { MerchantsTestService } from './merchants-test.service';

@ApiTags('Merchants (Test Mode)')
@Controller('merchants-test')
export class MerchantsTestController {
  constructor(private readonly merchantsTestService: MerchantsTestService) {}

  @Get('status')
  @ApiOperation({ summary: 'Test mode status for merchants service' })
  @ApiResponse({ status: 200, description: 'Test mode information' })
  getStatus() {
    return {
      success: true,
      message: 'Merchants service running in TEST MODE',
      features: {
        database: 'In-memory (no Prisma)',
        merchantData: 'Pre-populated test merchants',
        locations: 'Beirut, Jounieh, Jal el Dib areas'
      },
      testMerchants: {
        total: 6,
        types: ['Restaurant', 'Bakery', 'Dessert Shop', 'Fast Food'],
        areas: ['Hamra', 'Verdun', 'Ashrafieh', 'Jounieh', 'Metn'],
        cuisines: ['Lebanese', 'Mediterranean', 'Vegetarian', 'Fast Food', 'Desserts']
      },
      endpoints: {
        'GET /merchants-test': 'Get all approved merchants',
        'GET /merchants-test/stats': 'Get merchant statistics',
        'GET /merchants-test/top-rated': 'Get top rated merchants',
        'GET /merchants-test/sustainable': 'Get most sustainable merchants',
        'GET /merchants-test/search': 'Search merchants by area or cuisine',
        'GET /merchants-test/:id': 'Get specific merchant details'
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all approved merchants (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Approved merchants retrieved successfully' })
  async getAllMerchants() {
    try {
      const merchants = await this.merchantsTestService.findAll();
      return {
        success: true,
        message: 'Approved merchants retrieved successfully',
        data: merchants,
        meta: {
          total: merchants.length,
          note: 'TEST MODE: Using pre-populated merchant data'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve merchants',
        error: error.message
      };
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get merchant statistics (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Merchant statistics retrieved successfully' })
  async getStats() {
    const stats = await this.merchantsTestService.getStats();
    return {
      success: true,
      message: 'Merchant statistics retrieved successfully',
      data: stats
    };
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated merchants (TEST MODE)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of merchants to return (default: 5)' })
  @ApiResponse({ status: 200, description: 'Top rated merchants retrieved successfully' })
  async getTopRated(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const merchants = await this.merchantsTestService.getTopRated(limitNum);
    return {
      success: true,
      message: `Top ${merchants.length} rated merchants retrieved successfully`,
      data: merchants
    };
  }

  @Get('sustainable')
  @ApiOperation({ summary: 'Get most sustainable merchants (TEST MODE)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of merchants to return (default: 5)' })
  @ApiResponse({ status: 200, description: 'Most sustainable merchants retrieved successfully' })
  async getMostSustainable(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    const merchants = await this.merchantsTestService.getMostSustainable(limitNum);
    return {
      success: true,
      message: `Top ${merchants.length} sustainable merchants retrieved successfully`,
      data: merchants
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search merchants by area or cuisine (TEST MODE)' })
  @ApiQuery({ name: 'area', required: false, description: 'Filter by area (e.g., Hamra, Verdun)' })
  @ApiQuery({ name: 'cuisine', required: false, description: 'Filter by cuisine (e.g., Lebanese, Vegetarian)' })
  @ApiResponse({ status: 200, description: 'Merchants search results retrieved successfully' })
  async searchMerchants(
    @Query('area') area?: string,
    @Query('cuisine') cuisine?: string
  ) {
    let merchants;
    let searchType = '';
    let searchTerm = '';

    if (area) {
      merchants = await this.merchantsTestService.findByArea(area);
      searchType = 'area';
      searchTerm = area;
    } else if (cuisine) {
      merchants = await this.merchantsTestService.findByCuisine(cuisine);
      searchType = 'cuisine';
      searchTerm = cuisine;
    } else {
      merchants = await this.merchantsTestService.findAll();
      searchType = 'all';
      searchTerm = 'no filter';
    }

    return {
      success: true,
      message: `Merchants search completed for ${searchType}: ${searchTerm}`,
      data: merchants,
      meta: {
        total: merchants.length,
        searchType,
        searchTerm
      }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific merchant details (TEST MODE)' })
  @ApiResponse({ status: 200, description: 'Merchant details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getMerchantById(@Param('id') id: string) {
    try {
      const merchant = await this.merchantsTestService.findById(id);
      return {
        success: true,
        message: 'Merchant details retrieved successfully',
        data: merchant
      };
    } catch (error) {
      return {
        success: false,
        message: 'Merchant not found',
        error: error.message
      };
    }
  }

  // Additional test endpoints
  @Get('test/all')
  @ApiOperation({ summary: 'Get all test merchants including non-approved (for testing)' })
  @ApiResponse({ status: 200, description: 'All test merchants retrieved' })
  async getAllTestMerchants() {
    const merchants = await this.merchantsTestService.getAllTestMerchants();
    return {
      success: true,
      message: `Retrieved ${merchants.length} test merchants`,
      data: merchants,
      note: 'This includes all merchants regardless of status'
    };
  }
}
