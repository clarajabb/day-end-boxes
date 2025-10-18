import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    getUserReservations(user: any): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    createReservation(user: any, createReservationDto: {
        boxInventoryId: string;
        quantity: number;
    }): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    cancelReservation(user: any, reservationId: string): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    getMerchantReservations(user: any): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    markReservationCompleted(user: any, reservationId: string): Promise<{
        success: boolean;
        data: {
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
        };
        message: string;
    }>;
}
