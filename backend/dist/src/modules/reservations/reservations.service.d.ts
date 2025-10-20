import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReservationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserReservations(userId: string): Promise<({
        boxInventory: {
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
    })[]>;
    createReservation(userId: string, boxInventoryId: string, quantity?: number): Promise<{
        boxInventory: {
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
    }>;
    cancelReservation(userId: string, reservationId: string): Promise<{
        boxInventory: {
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
    }>;
    getMerchantReservations(merchantId: string): Promise<({
        user: {
            id: string;
            phone: string;
            email: string;
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
    })[]>;
    markReservationCompleted(merchantId: string, reservationId: string): Promise<{
        user: {
            id: string;
            phone: string;
            email: string;
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
    }>;
}
