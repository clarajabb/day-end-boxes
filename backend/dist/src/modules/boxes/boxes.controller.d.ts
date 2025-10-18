import { BoxesService } from './boxes.service';
export declare class BoxesController {
    private readonly boxesService;
    constructor(boxesService: BoxesService);
    getNearbyBoxes(lat: number, lng: number, radius?: number): Promise<{
        success: boolean;
        data: {
            id: string;
            merchantId: string;
            merchantName: string;
            boxType: string;
            originalPrice: number;
            discountedPrice: number;
            discountPercentage: number;
            availableQuantity: number;
            pickupTime: string;
            description: string;
            allergens: string[];
            isAvailable: boolean;
            createdAt: Date;
            availableDate: Date;
            merchantAddress: string;
            merchantCategory: import(".prisma/client").$Enums.MerchantCategory;
        }[];
    }>;
    getBoxById(id: string): Promise<{
        success: boolean;
        data: {
            boxType: {
                merchant: {
                    id: string;
                    phone: string;
                    email: string;
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
                    passwordHash: string;
                };
            } & {
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
    }>;
}
