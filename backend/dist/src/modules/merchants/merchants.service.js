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
exports.MerchantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
let MerchantsService = class MerchantsService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async findAll() {
        return await this.prisma.merchant.findMany({
            where: { status: 'APPROVED' },
        });
    }
    async register(merchantData) {
        const existingMerchant = await this.prisma.merchant.findFirst({
            where: {
                OR: [
                    { email: merchantData.email },
                    { phone: merchantData.phone }
                ]
            }
        });
        if (existingMerchant) {
            throw new common_1.ConflictException('Merchant with this email or phone already exists');
        }
        const hashedPassword = await bcrypt.hash(merchantData.password, 10);
        const merchant = await this.prisma.merchant.create({
            data: {
                businessName: merchantData.businessName,
                contactName: merchantData.contactName,
                email: merchantData.email,
                phone: merchantData.phone,
                passwordHash: hashedPassword,
                category: merchantData.category,
                address: merchantData.address,
                latitude: merchantData.latitude,
                longitude: merchantData.longitude,
                description: merchantData.description,
                status: 'PENDING',
            }
        });
        const payload = {
            sub: merchant.id,
            email: merchant.email,
            type: 'merchant'
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            merchant: {
                id: merchant.id,
                businessName: merchant.businessName,
                contactName: merchant.contactName,
                email: merchant.email,
                phone: merchant.phone,
                category: merchant.category,
                address: merchant.address,
                status: merchant.status,
                createdAt: merchant.createdAt
            },
            accessToken
        };
    }
    async login(email, password) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { email }
        });
        if (!merchant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (merchant.status !== 'APPROVED') {
            throw new common_1.UnauthorizedException('Account is not approved yet');
        }
        const isPasswordValid = await bcrypt.compare(password, merchant.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: merchant.id,
            email: merchant.email,
            type: 'merchant'
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            merchant: {
                id: merchant.id,
                businessName: merchant.businessName,
                contactName: merchant.contactName,
                email: merchant.email,
                phone: merchant.phone,
                category: merchant.category,
                address: merchant.address,
                status: merchant.status,
                createdAt: merchant.createdAt
            },
            accessToken
        };
    }
    async getMerchantProfile(merchantId) {
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: merchantId },
            include: {
                boxTypes: true,
                reservations: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true
                            }
                        },
                        boxInventory: {
                            include: {
                                boxType: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!merchant) {
            throw new common_1.UnauthorizedException('Merchant not found');
        }
        return merchant;
    }
    async updateMerchantProfile(merchantId, updateData) {
        const merchant = await this.prisma.merchant.update({
            where: { id: merchantId },
            data: updateData
        });
        return merchant;
    }
};
exports.MerchantsService = MerchantsService;
exports.MerchantsService = MerchantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], MerchantsService);
//# sourceMappingURL=merchants.service.js.map