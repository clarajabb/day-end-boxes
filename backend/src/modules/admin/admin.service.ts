import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    // Implementation will be added in next phase
    return {
      totalUsers: 0,
      totalMerchants: 0,
      totalReservations: 0,
      activeBoxes: 0,
    };
  }
}
