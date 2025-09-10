import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<{
        success: boolean;
        data: {
            totalUsers: number;
            totalMerchants: number;
            totalReservations: number;
            activeBoxes: number;
        };
    }>;
}
