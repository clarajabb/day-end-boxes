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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
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
    async findByPhone(phone) {
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
    async updateUser(id, data) {
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
    async getUserReservationStats(userId) {
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
        const completedReservationsData = await this.prisma.reservation.findMany({
            where: { userId, status: 'COMPLETED' },
            select: { totalAmount: true },
        });
        const totalSaved = Math.round(completedReservationsData.reduce((sum, reservation) => sum + reservation.totalAmount, 0) / 1000);
        return {
            total: totalReservations,
            active: activeReservations,
            completed: completedReservations,
            cancelled: cancelledReservations,
            totalSaved: totalSaved,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map