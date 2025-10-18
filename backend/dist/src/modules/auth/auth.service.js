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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
const otp_service_1 = require("../../common/otp/otp.service");
const users_service_1 = require("../users/users.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, redis, jwtService, configService, otpService, usersService) {
        this.prisma = prisma;
        this.redis = redis;
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpService = otpService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async sendOtp(phone, locale = 'ar') {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        this.logger.log(`📱 Normalized phone: ${normalizedPhone}`);
        const rateLimitKey = `otp:rate_limit:${normalizedPhone}`;
        const attempts = await this.redis.get(rateLimitKey);
        if (attempts && parseInt(attempts) >= 3) {
            throw new common_1.BadRequestException('Too many OTP requests. Please try again later.');
        }
        const otp = this.generateOtp();
        this.logger.log(`🔐 Generated OTP for ${normalizedPhone}: ${otp}`);
        const otpKey = `otp:${normalizedPhone}`;
        this.logger.log(`🔑 OTP key: ${otpKey}`);
        const otpData = {
            otp,
            attempts: 0,
            createdAt: new Date().toISOString(),
        };
        await this.redis.set(otpKey, JSON.stringify(otpData), 300);
        this.logger.log(`💾 Stored OTP in Redis with key: ${otpKey}`);
        const currentAttempts = attempts ? parseInt(attempts) + 1 : 1;
        await this.redis.set(rateLimitKey, currentAttempts.toString(), 3600);
        await this.prisma.otpVerification.create({
            data: {
                phone: normalizedPhone,
                otp: await bcrypt.hash(otp, 10),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            },
        });
        try {
            await this.otpService.sendOtp(normalizedPhone, otp, locale);
            this.logger.log(`OTP sent to ${normalizedPhone}`);
        }
        catch (error) {
            this.logger.error(`Failed to send OTP to ${normalizedPhone}:`, error);
            throw new common_1.BadRequestException('Failed to send OTP. Please try again.');
        }
    }
    async verifyOtp(phone, otp) {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const otpKey = `otp:${normalizedPhone}`;
        const otpDataStr = await this.redis.get(otpKey);
        if (!otpDataStr) {
            throw new common_1.BadRequestException('OTP has expired or is invalid');
        }
        const otpData = JSON.parse(otpDataStr);
        if (otpData.attempts >= 3) {
            await this.redis.del(otpKey);
            throw new common_1.BadRequestException('Too many invalid attempts. Please request a new OTP.');
        }
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            await this.redis.set(otpKey, JSON.stringify(otpData), 300);
            throw new common_1.BadRequestException('Invalid OTP');
        }
        await this.redis.del(otpKey);
        await this.redis.del(`otp:rate_limit:${normalizedPhone}`);
        await this.prisma.otpVerification.updateMany({
            where: {
                phone: normalizedPhone,
                verified: false,
                expiresAt: { gt: new Date() },
            },
            data: { verified: true },
        });
        let user = await this.prisma.user.findUnique({
            where: { phone: normalizedPhone },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    phone: normalizedPhone,
                    preferredLocale: 'ar',
                    notificationPreferences: {
                        pushEnabled: true,
                        smsEnabled: true,
                        emailEnabled: false,
                    },
                },
            });
            this.logger.log(`New user created: ${user.id}`);
        }
        else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });
        }
        const tokens = await this.generateTokens(user.id);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: tokens.refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                preferredLocale: user.preferredLocale,
                notificationPreferences: user.notificationPreferences,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('REFRESH_JWT_SECRET'),
            });
            const storedToken = await this.prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken,
                    userId: decoded.sub,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!storedToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const accessToken = this.jwtService.sign({ sub: decoded.sub }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            });
            return accessToken;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                preferredLocale: true,
                notificationPreferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        return user;
    }
    async updateUserProfile(userId, updateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...updateProfileDto,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                preferredLocale: true,
                notificationPreferences: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }
    async logout(userId) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
        this.logger.log(`User ${userId} logged out`);
    }
    async validateUser(userId, userType) {
        if (userType === 'merchant') {
            const merchant = await this.prisma.merchant.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    businessName: true,
                    contactName: true,
                    email: true,
                    phone: true,
                    category: true,
                    address: true,
                    status: true,
                },
            });
            if (!merchant) {
                return null;
            }
            return merchant;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId, isActive: true },
            select: {
                id: true,
                phone: true,
                name: true,
                email: true,
                preferredLocale: true,
                isActive: true,
            },
        });
        return user;
    }
    async generateTokens(userId) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId }, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync({ sub: userId }, {
                secret: this.configService.get('REFRESH_JWT_SECRET'),
                expiresIn: this.configService.get('REFRESH_JWT_EXPIRES_IN', '30d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async testRedis() {
        try {
            const testKey = 'test:redis:connection';
            const testValue = 'hello world';
            await this.redis.set(testKey, testValue, 60);
            const retrieved = await this.redis.get(testKey);
            await this.redis.del(testKey);
            return {
                success: true,
                message: 'Redis is working',
                test: {
                    set: testValue,
                    get: retrieved,
                    match: testValue === retrieved
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Redis test failed',
                error: error.message
            };
        }
    }
    async debugOtp(phone) {
        const normalizedPhone = this.normalizePhoneNumber(phone);
        const otpKey = `otp:${normalizedPhone}`;
        const otpData = await this.redis.get(otpKey);
        if (!otpData) {
            return {
                success: false,
                message: 'No OTP found for this phone number',
                phone: normalizedPhone
            };
        }
        const parsed = JSON.parse(otpData);
        return {
            success: true,
            message: 'OTP found',
            phone: normalizedPhone,
            otp: parsed.otp,
            attempts: parsed.attempts,
            createdAt: parsed.createdAt
        };
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    normalizePhoneNumber(phone) {
        let normalized = phone.replace(/\D/g, '');
        if (normalized.startsWith('961')) {
            normalized = '+' + normalized;
        }
        else if (normalized.length === 8) {
            normalized = '+961' + normalized;
        }
        return normalized;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map