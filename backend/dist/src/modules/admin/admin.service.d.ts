import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalMerchants: number;
        totalReservations: number;
        activeBoxes: number;
    }>;
}
