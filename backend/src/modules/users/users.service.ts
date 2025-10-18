import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        notificationPreferences: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByPhone(phone: string) {
    return await this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        notificationPreferences: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, data: any) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        preferredLocale: true,
        notificationPreferences: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserReservationStats(userId: string) {
    const [totalReservations, activeReservations, completedReservations, cancelledReservations] = await Promise.all([
      this.prisma.reservation.count({
        where: { userId },
      }),
      this.prisma.reservation.count({
        where: { userId, status: 'ACTIVE' },
      }),
      this.prisma.reservation.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.reservation.count({
        where: { userId, status: 'CANCELLED' },
      }),
    ]);

    // Calculate total saved amount
    const completedReservationsData = await this.prisma.reservation.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { totalAmount: true },
    });

    const totalSaved = Math.round(completedReservationsData.reduce((sum, reservation) => sum + reservation.totalAmount, 0) / 1000); // Convert LBP to USD

    return {
      total: totalReservations,
      active: activeReservations,
      completed: completedReservations,
      cancelled: cancelledReservations,
      totalSaved: totalSaved,
    };
  }
}
