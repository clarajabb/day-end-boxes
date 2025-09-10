import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private redis;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): Redis | null;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(key: string): Promise<number>;
    exists(key: string): Promise<number>;
    ttl(key: string): Promise<number>;
    sadd(key: string, member: string): Promise<number>;
    srem(key: string, member: string): Promise<number>;
    smembers(key: string): Promise<string[]>;
    sismember(key: string, member: string): Promise<number>;
    acquireLock(lockKey: string, ttlSeconds?: number, lockValue?: string): Promise<boolean>;
    releaseLock(lockKey: string, lockValue?: string): Promise<boolean>;
    acquireMultipleLocks(lockKeys: string[], ttlSeconds?: number): Promise<{
        success: boolean;
        lockValue?: string;
    }>;
    releaseMultipleLocks(lockKeys: string[], lockValue: string): Promise<number>;
    setReservationTTL(reservationId: string, data: any, ttlSeconds: number): Promise<void>;
    getReservationTTL(reservationId: string): Promise<any | null>;
    deleteReservationTTL(reservationId: string): Promise<number>;
    cacheInventoryQuantity(boxInventoryId: string, quantity: number, ttlSeconds?: number): Promise<void>;
    getCachedInventoryQuantity(boxInventoryId: string): Promise<number | null>;
    updateCachedInventoryQuantity(boxInventoryId: string, change: number): Promise<number | null>;
    addUserReservation(userId: string, merchantId: string, reservationId: string, ttlSeconds: number): Promise<void>;
    removeUserReservation(userId: string, merchantId: string, reservationId: string): Promise<number>;
    getUserActiveReservations(userId: string, merchantId: string): Promise<string[]>;
    ping(): Promise<string>;
}
