"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
    }
    async onModuleInit() {
        try {
            this.redis = new ioredis_1.default({
                host: this.configService.get('REDIS_HOST', 'localhost'),
                port: this.configService.get('REDIS_PORT', 6379),
                password: this.configService.get('REDIS_PASSWORD') || undefined,
                maxRetriesPerRequest: 3,
                connectTimeout: 5000,
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
            await Promise.race([
                this.redis.ping(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
            ]);
        }
        catch (error) {
            this.logger.warn('⚠️ Redis connection failed - running without Redis');
            this.redis = null;
        }
    }
    async onModuleDestroy() {
        if (this.redis) {
            await this.redis.quit();
            this.logger.log('🔴 Redis disconnected');
        }
    }
    getClient() {
        return this.redis;
    }
    async set(key, value, ttlSeconds) {
        if (!this.redis)
            return;
        if (ttlSeconds) {
            await this.redis.setex(key, ttlSeconds, value);
        }
        else {
            await this.redis.set(key, value);
        }
    }
    async get(key) {
        if (!this.redis)
            return null;
        return await this.redis.get(key);
    }
    async del(key) {
        if (!this.redis)
            return 0;
        return await this.redis.del(key);
    }
    async exists(key) {
        if (!this.redis)
            return 0;
        return await this.redis.exists(key);
    }
    async ttl(key) {
        if (!this.redis)
            return -1;
        return await this.redis.ttl(key);
    }
    async sadd(key, member) {
        if (!this.redis)
            return 0;
        return await this.redis.sadd(key, member);
    }
    async srem(key, member) {
        if (!this.redis)
            return 0;
        return await this.redis.srem(key, member);
    }
    async smembers(key) {
        if (!this.redis)
            return [];
        return await this.redis.smembers(key);
    }
    async sismember(key, member) {
        if (!this.redis)
            return 0;
        return await this.redis.sismember(key, member);
    }
    async acquireLock(lockKey, ttlSeconds = 30, lockValue) {
        if (!this.redis)
            return true;
        const value = lockValue || `${Date.now()}-${Math.random()}`;
        const result = await this.redis.set(lockKey, value, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }
    async releaseLock(lockKey, lockValue) {
        if (!this.redis)
            return true;
        if (!lockValue) {
            const result = await this.redis.del(lockKey);
            return result === 1;
        }
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
    async acquireMultipleLocks(lockKeys, ttlSeconds = 30) {
        const lockValue = `${Date.now()}-${Math.random()}`;
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
        const result = await this.redis.eval(luaScript, lockKeys.length, ...lockKeys, ttlSeconds.toString(), lockValue);
        return {
            success: result === 1,
            lockValue: result === 1 ? lockValue : undefined,
        };
    }
    async releaseMultipleLocks(lockKeys, lockValue) {
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
        return await this.redis.eval(luaScript, lockKeys.length, ...lockKeys, lockValue);
    }
    async setReservationTTL(reservationId, data, ttlSeconds) {
        const key = `reservation:ttl:${reservationId}`;
        await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    }
    async getReservationTTL(reservationId) {
        const key = `reservation:ttl:${reservationId}`;
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    async deleteReservationTTL(reservationId) {
        const key = `reservation:ttl:${reservationId}`;
        return await this.redis.del(key);
    }
    async cacheInventoryQuantity(boxInventoryId, quantity, ttlSeconds = 3600) {
        const key = `inventory:quantity:${boxInventoryId}`;
        await this.redis.setex(key, ttlSeconds, quantity.toString());
    }
    async getCachedInventoryQuantity(boxInventoryId) {
        const key = `inventory:quantity:${boxInventoryId}`;
        const quantity = await this.redis.get(key);
        return quantity ? parseInt(quantity) : null;
    }
    async updateCachedInventoryQuantity(boxInventoryId, change) {
        const key = `inventory:quantity:${boxInventoryId}`;
        const result = await this.redis.incrby(key, change);
        return result;
    }
    async addUserReservation(userId, merchantId, reservationId, ttlSeconds) {
        const key = `user:reservations:${userId}:${merchantId}`;
        await this.redis.sadd(key, reservationId);
        await this.redis.expire(key, ttlSeconds);
    }
    async removeUserReservation(userId, merchantId, reservationId) {
        const key = `user:reservations:${userId}:${merchantId}`;
        return await this.redis.srem(key, reservationId);
    }
    async getUserActiveReservations(userId, merchantId) {
        const key = `user:reservations:${userId}:${merchantId}`;
        return await this.redis.smembers(key);
    }
    async ping() {
        return await this.redis.ping();
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map