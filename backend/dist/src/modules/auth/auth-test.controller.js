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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthTestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_test_service_1 = require("./auth-test.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const get_user_decorator_1 = require("./decorators/get-user.decorator");
const dto_1 = require("./dto");
let AuthTestController = class AuthTestController {
    constructor(authTestService) {
        this.authTestService = authTestService;
    }
    getStatus() {
        return {
            success: true,
            message: 'Authentication service running in TEST MODE',
            note: 'All OTPs are: 123456',
            features: {
                database: 'In-memory (no Prisma)',
                redis: 'In-memory (no Redis)',
                otp: 'Mock service (always 123456)',
                rateLimiting: 'In-memory implementation'
            },
            endpoints: {
                'POST /auth-test/send-otp': 'Send OTP (always 123456)',
                'POST /auth-test/verify-otp': 'Verify OTP and get tokens',
                'POST /auth-test/refresh': 'Refresh access token',
                'GET /auth-test/profile': 'Get user profile',
                'PATCH /auth-test/profile': 'Update user profile',
                'POST /auth-test/logout': 'Logout user'
            }
        };
    }
    async sendOtp(sendOtpDto) {
        await this.authTestService.sendOtp(sendOtpDto.phone, sendOtpDto.locale);
        return {
            success: true,
            message: 'OTP sent successfully',
            note: 'TEST MODE: Check console logs for OTP (always 123456)'
        };
    }
    async verifyOtp(verifyOtpDto) {
        const result = await this.authTestService.verifyOtp(verifyOtpDto.phone, verifyOtpDto.otp);
        return {
            success: true,
            message: 'OTP verified successfully',
            data: result,
        };
    }
    async refreshToken(refreshTokenDto) {
        const result = await this.authTestService.refreshToken(refreshTokenDto.refreshToken);
        return {
            success: true,
            message: 'Token refreshed successfully',
            data: result,
        };
    }
    async getProfile(user) {
        const profile = await this.authTestService.getUserProfile(user.sub);
        return {
            success: true,
            data: profile,
        };
    }
    async updateProfile(user, updateProfileDto) {
        const updatedProfile = await this.authTestService.updateUserProfile(user.sub, updateProfileDto);
        return {
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile,
        };
    }
    async logout(body) {
        await this.authTestService.logout(body.refreshToken);
        return {
            success: true,
            message: 'Logged out successfully',
        };
    }
};
exports.AuthTestController = AuthTestController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Test mode status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test mode information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthTestController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Send OTP to phone number (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid phone number or rate limited' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendOtpDto]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Verify OTP and get JWT tokens (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'OTP verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid OTP' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Logout user (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthTestController.prototype, "logout", null);
exports.AuthTestController = AuthTestController = __decorate([
    (0, swagger_1.ApiTags)('Authentication (Test Mode)'),
    (0, common_1.Controller)('auth-test'),
    __metadata("design:paramtypes", [auth_test_service_1.AuthTestService])
], AuthTestController);
//# sourceMappingURL=auth-test.controller.js.map