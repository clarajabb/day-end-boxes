import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async getUserReservations(userId: string) {
    const reservations = await this.prisma.reservation.findMany({
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

    // totalAmount is already converted to USD during creation, no need to convert again
    return reservations;
  }

  async createReservation(userId: string, boxInventoryId: string, quantity: number = 1) {
    // Get the box inventory to check availability and get merchant info
    const boxInventory = await this.prisma.boxInventory.findUnique({
      where: { id: boxInventoryId },
      include: {
        boxType: {
          include: {
            merchant: true,
          },
        },
      },
    });

    if (!boxInventory) {
      throw new Error('Box inventory not found');
    }

    if (boxInventory.remainingQuantity < quantity) {
      throw new Error('Not enough boxes available');
    }

    // Calculate total amount (convert from LBP to USD: 1000 LBP = 1 USD)
    const totalAmount = Math.round((boxInventory.price * quantity) / 1000);

    // Generate pickup code (simple 6-digit code)
    const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create the reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        boxInventoryId,
        merchantId: boxInventory.boxType.merchantId,
        status: 'ACTIVE',
        pickupCode,
        totalAmount,
        reservedAt: new Date(),
        expiresAt,
        paymentStatus: 'PENDING',
        paymentMethod: 'CASH', // Default to cash payment
      },
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
    });

    // Update the remaining quantity
    await this.prisma.boxInventory.update({
      where: { id: boxInventoryId },
      data: {
        remainingQuantity: boxInventory.remainingQuantity - quantity,
      },
    });

    return reservation;
  }

  async cancelReservation(userId: string, reservationId: string) {
    // Find the reservation
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: reservationId,
        userId: userId,
        status: 'ACTIVE'
      },
      include: {
        boxInventory: true
      }
    });

    if (!reservation) {
      throw new Error('Reservation not found or already cancelled');
    }

    // Update reservation status to cancelled
    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
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
    });

    // Restore the quantity to the box inventory
    await this.prisma.boxInventory.update({
      where: { id: reservation.boxInventoryId },
      data: {
        remainingQuantity: {
          increment: 1 // Assuming quantity is always 1 for now
        }
      }
    });

    return updatedReservation;
  }

  async getMerchantReservations(merchantId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { merchantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        boxInventory: {
          include: {
            boxType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reservations;
  }

  async markReservationCompleted(merchantId: string, reservationId: string) {
    // Find the reservation and verify it belongs to this merchant
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        id: reservationId,
        merchantId: merchantId,
        status: 'ACTIVE'
      }
    });

    if (!reservation) {
      throw new Error('Reservation not found or already completed');
    }

    // Update reservation status
    const updatedReservation = await this.prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        paymentStatus: 'PAID', // Assume payment is completed when picked up
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        boxInventory: {
          include: {
            boxType: true
          }
        }
      }
    });

    return updatedReservation;
  }
}
