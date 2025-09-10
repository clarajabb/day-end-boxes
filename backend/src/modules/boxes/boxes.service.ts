import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BoxesService {
  constructor(private prisma: PrismaService) {}

  async findNearbyBoxes(latitude: number, longitude: number, radiusKm: number = 10) {
    // Implementation will be added in next phase
    return [];
  }

  async findBoxById(id: string) {
    return await this.prisma.boxInventory.findUnique({
      where: { id },
      include: {
        boxType: {
          include: {
            merchant: true,
          },
        },
      },
    });
  }
}
