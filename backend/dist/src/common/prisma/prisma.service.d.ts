import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    softDelete(model: string, where: any): Promise<any>;
    findManyActive(model: string, args?: any): Promise<any>;
    findNearbyBoxes(latitude: number, longitude: number, radiusKm?: number, filters?: any): Promise<unknown>;
}
