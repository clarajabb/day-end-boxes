"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ReservationsService = class ReservationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserReservations(userId) {
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
        return reservations;
    }
    async createReservation(userId, boxInventoryId, quantity = 1) {
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
        const totalAmount = Math.round((boxInventory.price * quantity) / 1000);
        const pickupCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
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
                paymentMethod: 'CASH',
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
        await this.prisma.boxInventory.update({
            where: { id: boxInventoryId },
            data: {
                remainingQuantity: boxInventory.remainingQuantity - quantity,
            },
        });
        return reservation;
    }
    async cancelReservation(userId, reservationId) {
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
        await this.prisma.boxInventory.update({
            where: { id: reservation.boxInventoryId },
            data: {
                remainingQuantity: {
                    increment: 1
                }
            }
        });
        return updatedReservation;
    }
    async getMerchantReservations(merchantId) {
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
    async markReservationCompleted(merchantId, reservationId) {
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
        const updatedReservation = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                paymentStatus: 'PAID',
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map