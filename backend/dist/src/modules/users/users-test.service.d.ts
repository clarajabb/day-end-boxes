export declare class UsersTestService {
    private userStore;
    private reservationStore;
    constructor();
    private initializeTestData;
    findById(id: string): Promise<any>;
    findByPhone(phone: string): Promise<any>;
    updateUser(id: string, data: any): Promise<any>;
    getUserReservationStats(userId: string): Promise<{
        total: number;
        active: number;
        completed: number;
        cancelled: number;
        totalSaved: number;
        favoriteCategory: string;
        lastReservation: any;
    }>;
    private getMostFrequentBoxType;
    createTestUser(userData: any): Promise<{
        id: string;
        phone: any;
        name: any;
        email: any;
        preferredLocale: any;
        notificationPreferences: any;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
    createDynamicUser(userData: any): Promise<any>;
    addTestReservation(userId: string, reservationData: any): Promise<{
        id: string;
        userId: string;
        status: any;
        boxType: any;
        merchantName: any;
        createdAt: string;
    }>;
    getAllTestUsers(): Promise<any[]>;
    getUserReservations(userId: string): Promise<any[]>;
}
