import { PrismaService } from '../../common/prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        phone: string;
        email: string;
        name: string;
        preferredLocale: string;
        notificationPreferences: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByPhone(phone: string): Promise<{
        id: string;
        phone: string;
        email: string;
        name: string;
        preferredLocale: string;
        notificationPreferences: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, data: any): Promise<{
        id: string;
        phone: string;
        email: string;
        name: string;
        preferredLocale: string;
        notificationPreferences: import("@prisma/client/runtime/library").JsonValue;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserReservationStats(userId: string): Promise<{
        total: number;
        active: number;
        completed: number;
        cancelled: number;
        totalSaved: number;
    }>;
}
