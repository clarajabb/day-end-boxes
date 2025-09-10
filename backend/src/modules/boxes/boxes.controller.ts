import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { BoxesService } from './boxes.service';

@ApiTags('Boxes')
@Controller('boxes')
export class BoxesController {
  constructor(private readonly boxesService: BoxesService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Get nearby available boxes' })
  async getNearbyBoxes(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 10,
  ) {
    const boxes = await this.boxesService.findNearbyBoxes(lat, lng, radius);
    return {
      success: true,
      data: boxes,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get box details' })
  async getBoxById(@Param('id') id: string) {
    const box = await this.boxesService.findBoxById(id);
    return {
      success: true,
      data: box,
    };
  }
}
