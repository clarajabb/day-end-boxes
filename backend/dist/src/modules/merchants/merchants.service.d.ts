import { PrismaService } from '../../common/prisma/prisma.service';
export declare class MerchantsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        phone: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        status: import(".prisma/client").$Enums.MerchantStatus;
        businessName: string;
        contactName: string;
        category: import(".prisma/client").$Enums.MerchantCategory;
        address: string;
        latitude: number;
        longitude: number;
        businessLicense: string | null;
        profileImage: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue;
        passwordHash: string;
    }[]>;
}
