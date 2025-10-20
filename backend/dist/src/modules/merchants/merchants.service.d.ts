import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class MerchantsService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    findAll(): Promise<{
        id: string;
        phone: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MerchantStatus;
        description: string | null;
        businessName: string;
        contactName: string;
        category: import(".prisma/client").$Enums.MerchantCategory;
        address: string;
        latitude: number;
        longitude: number;
        businessLicense: string | null;
        profileImage: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    register(merchantData: {
        businessName: string;
        contactName: string;
        email: string;
        phone: string;
        password: string;
        category: string;
        address: string;
        latitude: number;
        longitude: number;
        description?: string;
    }): Promise<{
        merchant: {
            id: string;
            businessName: string;
            contactName: string;
            email: string;
            phone: string;
            category: import(".prisma/client").$Enums.MerchantCategory;
            address: string;
            status: import(".prisma/client").$Enums.MerchantStatus;
            createdAt: Date;
        };
        accessToken: string;
    }>;
    login(email: string, password: string): Promise<{
        merchant: {
            id: string;
            businessName: string;
            contactName: string;
            email: string;
            phone: string;
            category: import(".prisma/client").$Enums.MerchantCategory;
            address: string;
            status: "APPROVED";
            createdAt: Date;
        };
        accessToken: string;
    }>;
    getMerchantProfile(merchantId: string): Promise<{
        reservations: ({
            user: {
                id: string;
                phone: string;
                name: string;
            };
            boxInventory: {
                boxType: {
                    id: string;
                    name: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    merchantId: string;
                    description: string;
                    category: import(".prisma/client").$Enums.BoxCategory;
                    originalPrice: number;
                    discountedPrice: number;
                    allergens: string[];
                    dietaryInfo: import(".prisma/client").$Enums.DietaryInfo[];
                    images: string[];
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                merchantId: string;
                status: import(".prisma/client").$Enums.InventoryStatus;
                boxTypeId: string;
                availableDate: Date;
                originalQuantity: number;
                remainingQuantity: number;
                price: number;
                pickupStartTime: Date;
                pickupEndTime: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            boxInventoryId: string;
            merchantId: string;
            status: import(".prisma/client").$Enums.ReservationStatus;
            pickupCode: string;
            totalAmount: number;
            reservedAt: Date;
            expiresAt: Date;
            completedAt: Date | null;
            cancelledAt: Date | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
        })[];
        boxTypes: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            description: string;
            category: import(".prisma/client").$Enums.BoxCategory;
            originalPrice: number;
            discountedPrice: number;
            allergens: string[];
            dietaryInfo: import(".prisma/client").$Enums.DietaryInfo[];
            images: string[];
        }[];
    } & {
        id: string;
        phone: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MerchantStatus;
        description: string | null;
        businessName: string;
        contactName: string;
        category: import(".prisma/client").$Enums.MerchantCategory;
        address: string;
        latitude: number;
        longitude: number;
        businessLicense: string | null;
        profileImage: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateMerchantProfile(merchantId: string, updateData: any): Promise<{
        id: string;
        phone: string;
        email: string;
        passwordHash: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.MerchantStatus;
        description: string | null;
        businessName: string;
        contactName: string;
        category: import(".prisma/client").$Enums.MerchantCategory;
        address: string;
        latitude: number;
        longitude: number;
        businessLicense: string | null;
        profileImage: string | null;
        operatingHours: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
