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
exports.BoxesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let BoxesService = class BoxesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findNearbyBoxes(latitude, longitude, radiusKm = 10) {
        const latRange = radiusKm / 111;
        const lngRange = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));
        const minLat = latitude - latRange;
        const maxLat = latitude + latRange;
        const minLng = longitude - lngRange;
        const maxLng = longitude + lngRange;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const boxes = await this.prisma.boxInventory.findMany({
            where: {
                status: 'ACTIVE',
                remainingQuantity: {
                    gt: 0
                },
                availableDate: {
                    gte: today
                },
                merchant: {
                    latitude: {
                        gte: minLat,
                        lte: maxLat
                    },
                    longitude: {
                        gte: minLng,
                        lte: maxLng
                    }
                }
            },
            include: {
                boxType: true,
                merchant: {
                    select: {
                        id: true,
                        businessName: true,
                        address: true,
                        latitude: true,
                        longitude: true,
                        category: true
                    }
                }
            },
            orderBy: {
                availableDate: 'asc'
            }
        });
        const filteredBoxes = boxes.filter(box => {
            const distance = this.calculateDistance(latitude, longitude, box.merchant.latitude, box.merchant.longitude);
            return distance <= radiusKm;
        });
        return filteredBoxes.map(box => ({
            id: box.id,
            merchantId: box.merchant.id,
            merchantName: box.merchant.businessName,
            boxType: box.boxType.name,
            originalPrice: Math.round(box.boxType.originalPrice / 1000),
            discountedPrice: Math.round(box.price / 1000),
            discountPercentage: Math.round(((box.boxType.originalPrice - box.price) / box.boxType.originalPrice) * 100),
            availableQuantity: box.remainingQuantity,
            pickupTime: `${box.pickupStartTime.toTimeString().slice(0, 5)}-${box.pickupEndTime.toTimeString().slice(0, 5)}`,
            description: box.boxType.description,
            allergens: box.boxType.allergens,
            isAvailable: box.remainingQuantity > 0,
            createdAt: box.createdAt,
            availableDate: box.availableDate,
            merchantAddress: box.merchant.address,
            merchantCategory: box.merchant.category
        }));
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async findBoxById(id) {
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
};
exports.BoxesService = BoxesService;
exports.BoxesService = BoxesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BoxesService);
//# sourceMappingURL=boxes.service.js.map