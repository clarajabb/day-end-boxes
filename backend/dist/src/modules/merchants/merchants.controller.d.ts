import { MerchantsService } from './merchants.service';
export declare class MerchantsController {
    private readonly merchantsService;
    constructor(merchantsService: MerchantsService);
    getAllMerchants(): Promise<{
        success: boolean;
        data: {
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
        }[];
    }>;
}
