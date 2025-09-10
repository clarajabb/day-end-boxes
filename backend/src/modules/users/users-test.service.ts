import { Injectable, NotFoundException } from '@nestjs/common';

/**
 * Test version of UsersService that works without database
 * This allows us to test the user management endpoints without external dependencies
 */
@Injectable()
export class UsersTestService {
  // In-memory storage for testing
  private userStore = new Map<string, any>();
  private reservationStore = new Map<string, any[]>(); // userId -> reservations

  constructor() {
    // Initialize with some test data
    this.initializeTestData();
  }

  private initializeTestData() {
    // Test user 1
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

    // Test user 2
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

    // Test reservations for user 1
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

    // Test reservations for user 2
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

  async findById(id: string) {
    const user = this.userStore.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByPhone(phone: string) {
    for (const user of this.userStore.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    throw new NotFoundException('User not found');
  }

  async updateUser(id: string, data: any) {
    const user = this.userStore.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user data
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    };

    this.userStore.set(id, updatedUser);
    return updatedUser;
  }

  async getUserReservationStats(userId: string) {
    // Check if user exists
    const user = this.userStore.get(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userReservations = this.reservationStore.get(userId) || [];

    const stats = {
      total: userReservations.length,
      active: userReservations.filter(r => r.status === 'ACTIVE').length,
      completed: userReservations.filter(r => r.status === 'COMPLETED').length,
      cancelled: userReservations.filter(r => r.status === 'CANCELLED').length,
      // Additional useful stats
      totalSaved: userReservations.filter(r => r.status === 'COMPLETED').length * 15, // Assume $15 saved per completed reservation
      favoriteCategory: this.getMostFrequentBoxType(userReservations),
      lastReservation: userReservations.length > 0 
        ? userReservations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : null
    };

    return stats;
  }

  // Helper method to get most frequent box type
  private getMostFrequentBoxType(reservations: any[]): string | null {
    if (reservations.length === 0) return null;

    const boxTypeCounts = reservations.reduce((acc, reservation) => {
      acc[reservation.boxType] = (acc[reservation.boxType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(boxTypeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0][0];
  }

  // Additional test helper methods
  async createTestUser(userData: any) {
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
    this.reservationStore.set(newUser.id, []); // Initialize empty reservations
    return newUser;
  }

  // Create dynamic user from JWT data (for users created by auth service)
  async createDynamicUser(userData: any) {
    const newUser = {
      ...userData,
      updatedAt: new Date().toISOString()
    };

    this.userStore.set(newUser.id, newUser);
    this.reservationStore.set(newUser.id, []); // Initialize empty reservations
    return newUser;
  }

  async addTestReservation(userId: string, reservationData: any) {
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

  // Get all test users (for testing purposes)
  async getAllTestUsers() {
    return Array.from(this.userStore.values());
  }

  // Get all reservations for a user (for testing purposes)
  async getUserReservations(userId: string) {
    return this.reservationStore.get(userId) || [];
  }
}
