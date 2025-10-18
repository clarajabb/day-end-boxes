import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user reservations' })
  @ApiResponse({ status: 200, description: 'User reservations retrieved successfully' })
  async getUserReservations(@GetUser() user: any) {
    const reservations = await this.reservationsService.getUserReservations(user.id);
    return {
      success: true,
      data: reservations,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new reservation' })
  @ApiResponse({ status: 201, description: 'Reservation created successfully' })
  async createReservation(
    @GetUser() user: any,
    @Body() createReservationDto: { boxInventoryId: string; quantity: number }
  ) {
    const reservation = await this.reservationsService.createReservation(
      user.id,
      createReservationDto.boxInventoryId,
      createReservationDto.quantity
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({ status: 200, description: 'Reservation cancelled successfully' })
  async cancelReservation(
    @GetUser() user: any,
    @Param('id') reservationId: string
  ) {
    const reservation = await this.reservationsService.cancelReservation(
      user.id,
      reservationId
    );
    return {
      success: true,
      data: reservation,
    };
  }

  @Get('merchant')
  @ApiOperation({ summary: 'Get merchant reservations' })
  @ApiResponse({ status: 200, description: 'Merchant reservations retrieved successfully' })
  async getMerchantReservations(@GetUser() user: any) {
    const reservations = await this.reservationsService.getMerchantReservations(user.id);
    return {
      success: true,
      data: reservations,
    };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark reservation as completed (merchant only)' })
  @ApiResponse({ status: 200, description: 'Reservation marked as completed' })
  async markReservationCompleted(
    @GetUser() user: any,
    @Param('id') reservationId: string
  ) {
    const reservation = await this.reservationsService.markReservationCompleted(
      user.id,
      reservationId
    );
    return {
      success: true,
      data: reservation,
      message: 'Reservation marked as completed'
    };
  }
}
