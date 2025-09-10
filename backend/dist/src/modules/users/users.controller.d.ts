import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
        success: boolean;
        data: {
            id: string;
            phone: string;
            email: string;
            name: string;
            preferredLocale: string;
            notificationPreferences: import("@prisma/client/runtime/library").JsonValue;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getStats(user: any): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            completed: number;
        };
    }>;
}
