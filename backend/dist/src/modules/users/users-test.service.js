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
exports.UsersTestService = void 0;
const common_1 = require("@nestjs/common");
let UsersTestService = class UsersTestService {
    constructor() {
        this.userStore = new Map();
        this.reservationStore = new Map();
        this.initializeTestData();
    }
    initializeTestData() {
        const user1 = {
            id: 'user_test_1',
            phone: '+96171123456',
            name: 'Ahmad Khalil',
            email: 'ahmad@test.com',
            preferredLocale: 'ar',
            notificationPreferences: {
                pushEnabled: true,
                smsEnabled: true,
                emailEnabled: true
            },
            isActive: true,
            createdAt: '2025-01-01T10:00:00.000Z',
            updatedAt: '2025-01-15T14:30:00.000Z'
        };
        const user2 = {
            id: 'user_test_2',
            phone: '+96171987654',
            name: 'Sara Mansour',
            email: 'sara@test.com',
            preferredLocale: 'en',
            notificationPreferences: {
                pushEnabled: true,
                smsEnabled: false,
                emailEnabled: true
            },
            isActive: true,
            createdAt: '2025-01-05T09:15:00.000Z',
            updatedAt: '2025-01-20T16:45:00.000Z'
        };
        this.userStore.set(user1.id, user1);
        this.userStore.set(user2.id, user2);
        this.reservationStore.set('user_test_1', [
            {
                id: 'reservation_1',
                userId: 'user_test_1',
                status: 'ACTIVE',
                boxType: 'Mixed Meal',
                merchantName: 'Café Central',
                createdAt: '2025-01-20T12:00:00.000Z'
            },
            {
                id: 'reservation_2',
                userId: 'user_test_1',
                status: 'COMPLETED',
                boxType: 'Bakery Box',
                merchantName: 'Fresh Bakery',
                createdAt: '2025-01-18T14:30:00.000Z'
            },
            {
                id: 'reservation_3',
                userId: 'user_test_1',
                status: 'COMPLETED',
                boxType: 'Dinner Special',
                merchantName: 'Lebanese Kitchen',
                createdAt: '2025-01-15T19:00:00.000Z'
            },
            {
                id: 'reservation_4',
                userId: 'user_test_1',
                status: 'CANCELLED',
                boxType: 'Lunch Box',
                merchantName: 'Quick Bites',
                createdAt: '2025-01-10T13:15:00.000Z'
            }
        ]);
        this.reservationStore.set('user_test_2', [
            {
                id: 'reservation_5',
                userId: 'user_test_2',
                status: 'ACTIVE',
                boxType: 'Vegetarian Box',
                merchantName: 'Green Garden',
                createdAt: '2025-01-21T11:30:00.000Z'
            },
            {
                id: 'reservation_6',
                userId: 'user_test_2',
                status: 'ACTIVE',
                boxType: 'Dessert Box',
                merchantName: 'Sweet Dreams',
                createdAt: '2025-01-19T16:00:00.000Z'
            }
        ]);
    }
    async findById(id) {
        const user = this.userStore.get(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByPhone(phone) {
        for (const user of this.userStore.values()) {
            if (user.phone === phone) {
                return user;
            }
        }
        throw new common_1.NotFoundException('User not found');
    }
    async updateUser(id, data) {
        const user = this.userStore.get(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = {
            ...user,
            ...data,
            updatedAt: new Date().toISOString()
        };
        this.userStore.set(id, updatedUser);
        return updatedUser;
    }
    async getUserReservationStats(userId) {
        const user = this.userStore.get(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userReservations = this.reservationStore.get(userId) || [];
        const stats = {
            total: userReservations.length,
            active: userReservations.filter(r => r.status === 'ACTIVE').length,
            completed: userReservations.filter(r => r.status === 'COMPLETED').length,
            cancelled: userReservations.filter(r => r.status === 'CANCELLED').length,
            totalSaved: userReservations.filter(r => r.status === 'COMPLETED').length * 15,
            favoriteCategory: this.getMostFrequentBoxType(userReservations),
            lastReservation: userReservations.length > 0
                ? userReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
                : null
        };
        return stats;
    }
    getMostFrequentBoxType(reservations) {
        if (reservations.length === 0)
            return null;
        const boxTypeCounts = reservations.reduce((acc, reservation) => {
            acc[reservation.boxType] = (acc[reservation.boxType] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(boxTypeCounts)
            .sort(([, a], [, b]) => b - a)[0][0];
    }
    async createTestUser(userData) {
        const newUser = {
            id: `user_test_${Date.now()}`,
            phone: userData.phone,
            name: userData.name || null,
            email: userData.email || null,
            preferredLocale: userData.preferredLocale || 'ar',
            notificationPreferences: userData.notificationPreferences || {
                pushEnabled: true,
                smsEnabled: true,
                emailEnabled: false
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.userStore.set(newUser.id, newUser);
        this.reservationStore.set(newUser.id, []);
        return newUser;
    }
    async createDynamicUser(userData) {
        const newUser = {
            ...userData,
            updatedAt: new Date().toISOString()
        };
        this.userStore.set(newUser.id, newUser);
        this.reservationStore.set(newUser.id, []);
        return newUser;
    }
    async addTestReservation(userId, reservationData) {
        const userReservations = this.reservationStore.get(userId) || [];
        const newReservation = {
            id: `reservation_${Date.now()}`,
            userId,
            status: reservationData.status || 'ACTIVE',
            boxType: reservationData.boxType,
            merchantName: reservationData.merchantName,
            createdAt: new Date().toISOString()
        };
        userReservations.push(newReservation);
        this.reservationStore.set(userId, userReservations);
        return newReservation;
    }
    async getAllTestUsers() {
        return Array.from(this.userStore.values());
    }
    async getUserReservations(userId) {
        return this.reservationStore.get(userId) || [];
    }
};
exports.UsersTestService = UsersTestService;
exports.UsersTestService = UsersTestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UsersTestService);
//# sourceMappingURL=users-test.service.js.map