import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    createReservation(userId: string, boxInventoryId: string): Promise<any>;
    getUserReservations(userId: string): Promise<({
        boxInventory: {
            boxType: {
                merchant: {
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
                };
            } & {
                id: string;
                name: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                merchantId: string;
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
        expiresAt: Date;
        userId: string;
        merchantId: string;
        status: import(".prisma/client").$Enums.ReservationStatus;
        boxInventoryId: string;
        pickupCode: string;
        totalAmount: number;
        reservedAt: Date;
        completedAt: Date | null;
        cancelledAt: Date | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        paymentMethod: string | null;
    })[]>;
}
