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
exports.UsersTestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_test_service_1 = require("./users-test.service");
const jwt_test_auth_guard_1 = require("../auth/guards/jwt-test-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
let UsersTestController = class UsersTestController {
    constructor(usersTestService) {
        this.usersTestService = usersTestService;
    }
    getStatus() {
        return {
            success: true,
            message: 'User Management service running in TEST MODE',
            features: {
                database: 'In-memory (no Prisma)',
                userData: 'Pre-populated test users',
                reservations: 'Mock reservation statistics'
            },
            testUsers: {
                'user_test_1': {
                    phone: '+96171123456',
                    name: 'Ahmad Khalil',
                    reservations: '4 total (1 active, 2 completed, 1 cancelled)'
                },
                'user_test_2': {
                    phone: '+96171987654',
                    name: 'Sara Mansour',
                    reservations: '2 total (2 active)'
                }
            },
            endpoints: {
                'GET /users-test/profile': 'Get user profile (requires JWT)',
                'GET /users-test/stats': 'Get user reservation statistics (requires JWT)',
                'GET /users-test/all': 'Get all test users (for testing)',
                'POST /users-test/create': 'Create test user',
                'POST /users-test/:id/reservation': 'Add test reservation'
            }
        };
    }
    async getProfile(user) {
        try {
            const profile = await this.usersTestService.findById(user.sub);
            return {
                success: true,
                message: 'User profile retrieved successfully',
                data: profile,
            };
        }
        catch (error) {
            if (error.message === 'User not found') {
                const basicProfile = {
                    id: user.sub,
                    phone: user.phone || '+96171000000',
                    name: null,
                    email: null,
                    preferredLocale: 'ar',
                    notificationPreferences: {
                        pushEnabled: true,
                        smsEnabled: true,
                        emailEnabled: false
                    },
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await this.usersTestService.createDynamicUser(basicProfile);
                return {
                    success: true,
                    message: 'User profile retrieved (created from JWT)',
                    data: basicProfile,
                    note: 'TEST MODE: User not found in test data, created basic profile from JWT'
                };
            }
            throw error;
        }
    }
    async getStats(user) {
        try {
            const stats = await this.usersTestService.getUserReservationStats(user.sub);
            return {
                success: true,
                message: 'User statistics retrieved successfully',
                data: stats,
            };
        }
        catch (error) {
            if (error.message === 'User not found') {
                const basicProfile = {
                    id: user.sub,
                    phone: user.phone || '+96171000000',
                    name: null,
                    email: null,
                    preferredLocale: 'ar',
                    notificationPreferences: {
                        pushEnabled: true,
                        smsEnabled: true,
                        emailEnabled: false
                    },
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                await this.usersTestService.createDynamicUser(basicProfile);
                const emptyStats = {
                    total: 0,
                    active: 0,
                    completed: 0,
                    cancelled: 0,
                    totalSaved: 0,
                    favoriteCategory: null,
                    lastReservation: null
                };
                return {
                    success: true,
                    message: 'User statistics retrieved (empty for new user)',
                    data: emptyStats,
                    note: 'TEST MODE: User not found in test data, created user and returning empty statistics'
                };
            }
            throw error;
        }
    }
    async getAllTestUsers() {
        const users = await this.usersTestService.getAllTestUsers();
        return {
            success: true,
            message: `Retrieved ${users.length} test users`,
            data: users
        };
    }
    async getUserReservations(userId) {
        try {
            const reservations = await this.usersTestService.getUserReservations(userId);
            return {
                success: true,
                message: `Retrieved ${reservations.length} reservations for user ${userId}`,
                data: reservations
            };
        }
        catch (error) {
            return {
                success: true,
                message: 'No reservations found for user',
                data: []
            };
        }
    }
    async createTestUser(userData) {
        const user = await this.usersTestService.createTestUser(userData);
        return {
            success: true,
            message: 'Test user created successfully',
            data: user
        };
    }
    async addTestReservation(userId, reservationData) {
        try {
            const reservation = await this.usersTestService.addTestReservation(userId, reservationData);
            return {
                success: true,
                message: 'Test reservation added successfully',
                data: reservation
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to add reservation: ' + error.message
            };
        }
    }
};
exports.UsersTestController = UsersTestController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Test mode status for users service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test mode information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersTestController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_test_auth_guard_1.JwtTestAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_test_auth_guard_1.JwtTestAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user reservation statistics (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User statistics retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, get_user_decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all test users (for testing purposes)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All test users retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "getAllTestUsers", null);
__decorate([
    (0, common_1.Get)(':id/reservations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user reservations (for testing purposes)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User reservations retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "getUserReservations", null);
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create test user (for testing purposes)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Test user created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "createTestUser", null);
__decorate([
    (0, common_1.Post)(':id/reservation'),
    (0, swagger_1.ApiOperation)({ summary: 'Add test reservation for user (for testing purposes)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Test reservation added successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersTestController.prototype, "addTestReservation", null);
exports.UsersTestController = UsersTestController = __decorate([
    (0, swagger_1.ApiTags)('Users (Test Mode)'),
    (0, common_1.Controller)('users-test'),
    __metadata("design:paramtypes", [users_test_service_1.UsersTestService])
], UsersTestController);
//# sourceMappingURL=users-test.controller.js.map