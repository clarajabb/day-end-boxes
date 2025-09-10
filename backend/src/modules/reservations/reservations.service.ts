import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async createReservation(userId: string, boxInventoryId: string) {
    // Implementation will be added in next phase
    return null;
  }

  async getUserReservations(userId: string) {
    return await this.prisma.reservation.findMany({
      where: { userId },
      include: {
        boxInventory: {
          include: {
            boxType: {
              include: {
                merchant: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
