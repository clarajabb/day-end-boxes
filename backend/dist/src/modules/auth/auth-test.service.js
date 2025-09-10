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
var AuthTestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTestService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthTestService = AuthTestService_1 = class AuthTestService {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthTestService_1.name);
        this.otpStore = new Map();
        this.rateLimitStore = new Map();
        this.userStore = new Map();
        this.refreshTokenStore = new Map();
    }
    async sendOtp(phone, locale = 'ar') {
        try {
            const normalizedPhone = this.normalizePhoneNumber(phone);
            const rateLimitKey = `otp:${normalizedPhone}`;
            const now = new Date();
            const rateLimit = this.rateLimitStore.get(rateLimitKey);
            if (rateLimit && rateLimit.count >= 3 && now < rateLimit.resetTime) {
                throw new common_1.BadRequestException('Too many OTP requests. Please try again later.');
            }
            if (!rateLimit || now >= rateLimit.resetTime) {
                this.rateLimitStore.set(rateLimitKey, {
                    count: 1,
                    resetTime: new Date(now.getTime() + 60 * 1000)
                });
            }
            else {
                rateLimit.count++;
            }
            const otp = this.generateOtp();
            this.otpStore.set(normalizedPhone, {
                otp,
                attempts: 0,
                createdAt: now
            });
            this.logger.log(`📱 OTP for ${normalizedPhone}: ${otp}`);
            this.logger.log(`🚀 Mock SMS sent to ${normalizedPhone} in ${locale}`);
            this.cleanupExpiredOtps();
        }
        catch (error) {
            this.logger.error(`Error sending OTP: ${error.message}`);
            throw error;
        }
    }
    async verifyOtp(phone, otp) {
        try {
            const normalizedPhone = this.normalizePhoneNumber(phone);
            const rateLimitKey = `verify:${normalizedPhone}`;
            const now = new Date();
            const rateLimit = this.rateLimitStore.get(rateLimitKey);
            if (rateLimit && rateLimit.count >= 5 && now < rateLimit.resetTime) {
                throw new common_1.BadRequestException('Too many verification attempts. Please try again later.');
            }
            if (!rateLimit || now >= rateLimit.resetTime) {
                this.rateLimitStore.set(rateLimitKey, {
                    count: 1,
                    resetTime: new Date(now.getTime() + 60 * 1000)
                });
            }
            else {
                rateLimit.count++;
            }
            const storedOtpData = this.otpStore.get(normalizedPhone);
            if (!storedOtpData) {
                throw new common_1.BadRequestException('OTP has expired or is invalid');
            }
            const otpAge = now.getTime() - storedOtpData.createdAt.getTime();
            if (otpAge > 5 * 60 * 1000) {
                this.otpStore.delete(normalizedPhone);
                throw new common_1.BadRequestException('OTP has expired');
            }
            if (storedOtpData.attempts >= 3) {
                this.otpStore.delete(normalizedPhone);
                throw new common_1.BadRequestException('Too many incorrect attempts');
            }
            if (storedOtpData.otp !== otp) {
                storedOtpData.attempts++;
                throw new common_1.BadRequestException('Invalid OTP');
            }
            this.otpStore.delete(normalizedPhone);
            let user = this.userStore.get(normalizedPhone);
            if (!user) {
                user = {
                    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    phone: normalizedPhone,
                    name: null,
                    email: null,
                    preferredLocale: 'ar',
                    notificationPreferences: {
                        pushEnabled: true,
                        smsEnabled: true,
                        emailEnabled: false
                    },
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                };
                this.userStore.set(normalizedPhone, user);
            }
            const accessToken = this.jwtService.sign({ sub: user.id, phone: user.phone }, { expiresIn: '15m' });
            const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, {
                secret: this.configService.get('REFRESH_JWT_SECRET', 'fallback-refresh-secret'),
                expiresIn: '30d'
            });
            this.refreshTokenStore.set(refreshToken, {
                userId: user.id,
                expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
            });
            return {
                accessToken,
                refreshToken,
                user
            };
        }
        catch (error) {
            this.logger.error(`Error verifying OTP: ${error.message}`);
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const tokenData = this.refreshTokenStore.get(refreshToken);
            if (!tokenData || new Date() > tokenData.expiresAt) {
                throw new common_1.UnauthorizedException('Invalid or expired refresh token');
            }
            const user = Array.from(this.userStore.values()).find(u => u.id === tokenData.userId);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const accessToken = this.jwtService.sign({ sub: user.id, phone: user.phone }, { expiresIn: '15m' });
            return { accessToken };
        }
        catch (error) {
            this.logger.error(`Error refreshing token: ${error.message}`);
            throw error;
        }
    }
    async getUserProfile(userId) {
        const user = Array.from(this.userStore.values()).find(u => u.id === userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async updateUserProfile(userId, updateData) {
        const user = Array.from(this.userStore.values()).find(u => u.id === userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        Object.assign(user, updateData, { updatedAt: new Date().toISOString() });
        this.userStore.set(user.phone, user);
        return user;
    }
    async logout(refreshToken) {
        this.refreshTokenStore.delete(refreshToken);
    }
    normalizePhoneNumber(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('961')) {
            return '+' + cleaned;
        }
        else if (cleaned.startsWith('71') || cleaned.startsWith('70') || cleaned.startsWith('76') || cleaned.startsWith('78') || cleaned.startsWith('79')) {
            return '+961' + cleaned;
        }
        else if (cleaned.startsWith('1') || cleaned.startsWith('3') || cleaned.startsWith('81')) {
            return '+961' + cleaned;
        }
        if (!cleaned.startsWith('961') && cleaned.length >= 8) {
            throw new common_1.BadRequestException('Phone number must be a valid Lebanese number (+961)');
        }
        return '+' + cleaned;
    }
    generateOtp() {
        return '123456';
    }
    cleanupExpiredOtps() {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        for (const [phone, data] of this.otpStore.entries()) {
            if (data.createdAt < fiveMinutesAgo) {
                this.otpStore.delete(phone);
            }
        }
    }
};
exports.AuthTestService = AuthTestService;
exports.AuthTestService = AuthTestService = AuthTestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], AuthTestService);
//# sourceMappingURL=auth-test.service.js.map