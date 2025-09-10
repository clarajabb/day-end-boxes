import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD') || undefined,
        maxRetriesPerRequest: 3,
        connectTimeout: 5000, // 5 second timeout
      });

      this.redis.on('connect', () => {
        this.logger.log('🔴 Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.warn('🔴 Redis connection error - running in test mode:', error.message);
      });

      this.redis.on('close', () => {
        this.logger.warn('🔴 Redis connection closed');
      });

      // Test connection with timeout
      await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
      ]);
      
    } catch (error) {
      this.logger.warn('⚠️ Redis connection failed - running without Redis');
      this.redis = null; // Set to null so we can handle it gracefully
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.logger.log('🔴 Redis disconnected');
    }
  }

  getClient(): Redis | null {
    return this.redis;
  }

  // Basic Redis operations
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return; // Gracefully handle no Redis
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null; // Gracefully handle no Redis
    return await this.redis.get(key);
  }

  async del(key: string): Promise<number> {
    if (!this.redis) return 0; // Gracefully handle no Redis
    return await this.redis.del(key);
  }

  async exists(key: string): Promise<number> {
    if (!this.redis) return 0; // Gracefully handle no Redis
    return await this.redis.exists(key);
  }

  async ttl(key: string): Promise<number> {
    if (!this.redis) return -1; // Gracefully handle no Redis
    return await this.redis.ttl(key);
  }

  // Set operations for tracking user reservations
  async sadd(key: string, member: string): Promise<number> {
    if (!this.redis) return 0; // Gracefully handle no Redis
    return await this.redis.sadd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    if (!this.redis) return 0; // Gracefully handle no Redis
    return await this.redis.srem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.redis) return []; // Gracefully handle no Redis
    return await this.redis.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    if (!this.redis) return 0; // Gracefully handle no Redis
    return await this.redis.sismember(key, member);
  }

  // Distributed locking for reservation system
  async acquireLock(
    lockKey: string, 
    ttlSeconds: number = 30, 
    lockValue?: string
  ): Promise<boolean> {
    if (!this.redis) return true; // Always allow in test mode
    const value = lockValue || `${Date.now()}-${Math.random()}`;
    const result = await this.redis.set(lockKey, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async releaseLock(lockKey: string, lockValue?: string): Promise<boolean> {
    if (!this.redis) return true; // Always allow in test mode
    
    if (!lockValue) {
      // Simple delete if no value verification needed
      const result = await this.redis.del(lockKey);
      return result === 1;
    }

    // Lua script to atomically check value and delete
    const luaScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    const result = await this.redis.eval(luaScript, 1, lockKey, lockValue);
    return result === 1;
  }

  // Multiple lock acquisition for complex operations
  async acquireMultipleLocks(
    lockKeys: string[], 
    ttlSeconds: number = 30
  ): Promise<{ success: boolean; lockValue?: string }> {
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    // Lua script for atomic multiple lock acquisition
    const luaScript = `
      local keys = KEYS
      local ttl = ARGV[1]
      local lockValue = ARGV[2]
      
      -- Try to acquire all locks
      for i = 1, #keys do
        local result = redis.call('SET', keys[i], lockValue, 'EX', ttl, 'NX')
        if not result then
          -- Failed to acquire lock, release any acquired locks
          for j = 1, i - 1 do
            redis.call('DEL', keys[j])
          end
          return 0
        end
      end
      return 1
    `;

    const result = await this.redis.eval(
      luaScript, 
      lockKeys.length, 
      ...lockKeys, 
      ttlSeconds.toString(), 
      lockValue
    );

    return {
      success: result === 1,
      lockValue: result === 1 ? lockValue : undefined,
    };
  }

  async releaseMultipleLocks(
    lockKeys: string[], 
    lockValue: string
  ): Promise<number> {
    // Lua script for atomic multiple lock release
    const luaScript = `
      local keys = KEYS
      local lockValue = ARGV[1]
      local released = 0
      
      for i = 1, #keys do
        if redis.call('GET', keys[i]) == lockValue then
          released = released + redis.call('DEL', keys[i])
        end
      end
      return released
    `;

    return await this.redis.eval(
      luaScript, 
      lockKeys.length, 
      ...lockKeys, 
      lockValue
    ) as number;
  }

  // Reservation-specific operations
  async setReservationTTL(
    reservationId: string, 
    data: any, 
    ttlSeconds: number
  ): Promise<void> {
    const key = `reservation:ttl:${reservationId}`;
    await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
  }

  async getReservationTTL(reservationId: string): Promise<any | null> {
    const key = `reservation:ttl:${reservationId}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteReservationTTL(reservationId: string): Promise<number> {
    const key = `reservation:ttl:${reservationId}`;
    return await this.redis.del(key);
  }

  // Inventory caching
  async cacheInventoryQuantity(
    boxInventoryId: string, 
    quantity: number, 
    ttlSeconds: number = 3600
  ): Promise<void> {
    const key = `inventory:quantity:${boxInventoryId}`;
    await this.redis.setex(key, ttlSeconds, quantity.toString());
  }

  async getCachedInventoryQuantity(boxInventoryId: string): Promise<number | null> {
    const key = `inventory:quantity:${boxInventoryId}`;
    const quantity = await this.redis.get(key);
    return quantity ? parseInt(quantity) : null;
  }

  async updateCachedInventoryQuantity(
    boxInventoryId: string, 
    change: number
  ): Promise<number | null> {
    const key = `inventory:quantity:${boxInventoryId}`;
    const result = await this.redis.incrby(key, change);
    return result;
  }

  // User reservation tracking
  async addUserReservation(
    userId: string, 
    merchantId: string, 
    reservationId: string, 
    ttlSeconds: number
  ): Promise<void> {
    const key = `user:reservations:${userId}:${merchantId}`;
    await this.redis.sadd(key, reservationId);
    await this.redis.expire(key, ttlSeconds);
  }

  async removeUserReservation(
    userId: string, 
    merchantId: string, 
    reservationId: string
  ): Promise<number> {
    const key = `user:reservations:${userId}:${merchantId}`;
    return await this.redis.srem(key, reservationId);
  }

  async getUserActiveReservations(
    userId: string, 
    merchantId: string
  ): Promise<string[]> {
    const key = `user:reservations:${userId}:${merchantId}`;
    return await this.redis.smembers(key);
  }

  // Health check
  async ping(): Promise<string> {
    return await this.redis.ping();
  }
}
