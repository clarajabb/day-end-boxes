import { UsersTestService } from './users-test.service';
export declare class UsersTestController {
    private readonly usersTestService;
    constructor(usersTestService: UsersTestService);
    getStatus(): {
        success: boolean;
        message: string;
        features: {
            database: string;
            userData: string;
            reservations: string;
        };
        testUsers: {
            user_test_1: {
                phone: string;
                name: string;
                reservations: string;
            };
            user_test_2: {
                phone: string;
                name: string;
                reservations: string;
            };
        };
        endpoints: {
            'GET /users-test/profile': string;
            'GET /users-test/stats': string;
            'GET /users-test/all': string;
            'POST /users-test/create': string;
            'POST /users-test/:id/reservation': string;
        };
    };
    getProfile(user: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        note?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            id: any;
            phone: any;
            name: any;
            email: any;
            preferredLocale: string;
            notificationPreferences: {
                pushEnabled: boolean;
                smsEnabled: boolean;
                emailEnabled: boolean;
            };
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        };
        note: string;
    }>;
    getStats(user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            active: number;
            completed: number;
            cancelled: number;
            totalSaved: number;
            favoriteCategory: string;
            lastReservation: any;
        };
        note?: undefined;
    } | {
        success: boolean;
        message: string;
        data: {
            total: number;
            active: number;
            completed: number;
            cancelled: number;
            totalSaved: number;
            favoriteCategory: any;
            lastReservation: any;
        };
        note: string;
    }>;
    getAllTestUsers(): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
    getUserReservations(userId: string): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
    createTestUser(userData: {
        phone: string;
        name?: string;
        email?: string;
        preferredLocale?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            phone: any;
            name: any;
            email: any;
            preferredLocale: any;
            notificationPreferences: any;
            isActive: boolean;
            createdAt: string;
            updatedAt: string;
        };
    }>;
    addTestReservation(userId: string, reservationData: {
        status?: string;
        boxType: string;
        merchantName: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            id: string;
            userId: string;
            status: any;
            boxType: any;
            merchantName: any;
            createdAt: string;
        };
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
}
