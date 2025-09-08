# Reservation Algorithm with Redis Locks

## Overview
This document outlines the reservation algorithm for the Day-End Boxes platform, ensuring atomic reservations with TTL, conflict resolution, and failure recovery.

## Business Rules
1. **Single Active Reservation**: One active reservation per user per merchant
2. **TTL (Time To Live)**: Reservations expire after 15-30 minutes (configurable)
3. **Atomic Operations**: Prevent double-booking through distributed locks
4. **Inventory Management**: Real-time quantity updates
5. **Dynamic Pricing**: Price drops as pickup window approaches (future feature)

## Redis Lock Strategy

### Key Patterns
```
# Inventory lock for atomic quantity updates
lock:inventory:{boxInventoryId}

# User-merchant reservation lock to enforce single active reservation rule
lock:user_merchant:{userId}:{merchantId}

# Reservation TTL tracking
reservation:ttl:{reservationId}

# Inventory quantity cache
inventory:quantity:{boxInventoryId}

# User active reservations by merchant
user:reservations:{userId}:{merchantId}
```

### Algorithm Implementation

#### 1. Create Reservation Flow

```typescript
async function createReservation(
  userId: string,
  boxInventoryId: string,
  ttlMinutes: number = 20
): Promise<ReservationResult> {
  const redis = getRedisClient();
  const db = getPrismaClient();
  
  // Step 1: Acquire distributed locks
  const inventoryLockKey = `lock:inventory:${boxInventoryId}`;
  const userMerchantLockKey = `lock:user_merchant:${userId}:${merchantId}`;
  
  const lockTTL = 30; // 30 seconds for lock expiration
  const lockAcquired = await acquireMultipleLocks(
    [inventoryLockKey, userMerchantLockKey],
    lockTTL
  );
  
  if (!lockAcquired) {
    return {
      success: false,
      error: 'LOCK_ACQUISITION_FAILED',
      message: 'Unable to process reservation at this time. Please try again.',
      retryAfter: 2000 // 2 seconds
    };
  }
  
  try {
    // Step 2: Validate business rules
    const validation = await validateReservationRules(userId, boxInventoryId);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errorCode,
        message: validation.message
      };
    }
    
    // Step 3: Check and update inventory atomically
    const inventoryUpdate = await updateInventoryWithLock(
      boxInventoryId,
      -1 // Decrease quantity by 1
    );
    
    if (!inventoryUpdate.success) {
      return {
        success: false,
        error: 'INSUFFICIENT_INVENTORY',
        message: 'This box is no longer available.'
      };
    }
    
    // Step 4: Create reservation with TTL
    const expirationTime = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const pickupCode = generatePickupCode();
    
    const reservation = await db.reservation.create({
      data: {
        userId,
        boxInventoryId,
        status: 'ACTIVE',
        pickupCode,
        totalAmount: inventoryUpdate.price,
        reservedAt: new Date(),
        expiresAt: expirationTime,
        paymentStatus: 'PENDING'
      },
      include: {
        boxInventory: {
          include: {
            boxType: true,
            merchant: true
          }
        }
      }
    });
    
    // Step 5: Set up Redis TTL tracking
    await Promise.all([
      // Track reservation expiration
      redis.setex(
        `reservation:ttl:${reservation.id}`,
        ttlMinutes * 60,
        JSON.stringify({
          reservationId: reservation.id,
          userId,
          boxInventoryId,
          expiresAt: expirationTime.toISOString()
        })
      ),
      
      // Update user's active reservations
      redis.sadd(
        `user:reservations:${userId}:${validation.merchantId}`,
        reservation.id
      ),
      redis.expire(`user:reservations:${userId}:${validation.merchantId}`, ttlMinutes * 60)
    ]);
    
    // Step 6: Schedule cleanup job
    await scheduleReservationCleanup(reservation.id, expirationTime);
    
    // Step 7: Send confirmation notifications
    await sendReservationNotifications(reservation);
    
    return {
      success: true,
      data: reservation
    };
    
  } finally {
    // Always release locks
    await releaseMultipleLocks([inventoryLockKey, userMerchantLockKey]);
  }
}
```

#### 2. Validation Rules

```typescript
async function validateReservationRules(
  userId: string,
  boxInventoryId: string
): Promise<ValidationResult> {
  const db = getPrismaClient();
  const redis = getRedisClient();
  
  // Get box inventory details
  const boxInventory = await db.boxInventory.findUnique({
    where: { id: boxInventoryId },
    include: {
      boxType: {
        include: { merchant: true }
      }
    }
  });
  
  if (!boxInventory) {
    return {
      valid: false,
      errorCode: 'BOX_NOT_FOUND',
      message: 'The selected box is no longer available.'
    };
  }
  
  // Check if box is still available
  if (boxInventory.status !== 'ACTIVE' || boxInventory.remainingQuantity <= 0) {
    return {
      valid: false,
      errorCode: 'BOX_UNAVAILABLE',
      message: 'This box is no longer available.'
    };
  }
  
  // Check pickup window
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const pickupStart = new Date(`${today}T${boxInventory.pickupStartTime}`);
  const pickupEnd = new Date(`${today}T${boxInventory.pickupEndTime}`);
  
  if (now > pickupEnd) {
    return {
      valid: false,
      errorCode: 'PICKUP_WINDOW_CLOSED',
      message: 'The pickup window for this box has closed.'
    };
  }
  
  // Check for existing active reservation with same merchant
  const existingReservation = await db.reservation.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      boxInventory: {
        boxType: {
          merchantId: boxInventory.boxType.merchantId
        }
      }
    }
  });
  
  if (existingReservation) {
    return {
      valid: false,
      errorCode: 'ACTIVE_RESERVATION_EXISTS',
      message: 'You already have an active reservation with this merchant.'
    };
  }
  
  return {
    valid: true,
    merchantId: boxInventory.boxType.merchantId
  };
}
```

#### 3. Inventory Update with Lock

```typescript
async function updateInventoryWithLock(
  boxInventoryId: string,
  quantityChange: number
): Promise<InventoryUpdateResult> {
  const db = getPrismaClient();
  const redis = getRedisClient();
  
  // Get current inventory from cache or database
  const cacheKey = `inventory:quantity:${boxInventoryId}`;
  let currentQuantity = await redis.get(cacheKey);
  
  if (currentQuantity === null) {
    // Cache miss - fetch from database
    const inventory = await db.boxInventory.findUnique({
      where: { id: boxInventoryId },
      select: { remainingQuantity: true, price: true }
    });
    
    if (!inventory) {
      return {
        success: false,
        error: 'INVENTORY_NOT_FOUND'
      };
    }
    
    currentQuantity = inventory.remainingQuantity.toString();
    await redis.setex(cacheKey, 3600, currentQuantity); // Cache for 1 hour
  }
  
  const newQuantity = parseInt(currentQuantity) + quantityChange;
  
  if (newQuantity < 0) {
    return {
      success: false,
      error: 'INSUFFICIENT_QUANTITY'
    };
  }
  
  // Update database and cache atomically
  const updatedInventory = await db.boxInventory.update({
    where: { id: boxInventoryId },
    data: {
      remainingQuantity: newQuantity,
      status: newQuantity === 0 ? 'SOLD_OUT' : 'ACTIVE'
    },
    select: { remainingQuantity: true, price: true }
  });
  
  // Update cache
  await redis.setex(cacheKey, 3600, updatedInventory.remainingQuantity.toString());
  
  return {
    success: true,
    newQuantity: updatedInventory.remainingQuantity,
    price: updatedInventory.price
  };
}
```

#### 4. Lock Management

```typescript
class DistributedLockManager {
  private redis: Redis;
  private lockScript: string;
  
  constructor(redis: Redis) {
    this.redis = redis;
    // Lua script for atomic lock acquisition
    this.lockScript = `
      local keys = KEYS
      local ttl = ARGV[1]
      local lockValue = ARGV[2]
      
      for i = 1, #keys do
        local result = redis.call('SET', keys[i], lockValue, 'NX', 'EX', ttl)
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
  }
  
  async acquireMultipleLocks(
    lockKeys: string[],
    ttlSeconds: number
  ): Promise<boolean> {
    const lockValue = `${Date.now()}-${Math.random()}`;
    const result = await this.redis.eval(
      this.lockScript,
      lockKeys.length,
      ...lockKeys,
      ttlSeconds.toString(),
      lockValue
    ) as number;
    
    return result === 1;
  }
  
  async releaseMultipleLocks(lockKeys: string[]): Promise<void> {
    const releaseScript = `
      local keys = KEYS
      for i = 1, #keys do
        redis.call('DEL', keys[i])
      end
      return #keys
    `;
    
    await this.redis.eval(releaseScript, lockKeys.length, ...lockKeys);
  }
}
```

#### 5. TTL Cleanup and Expiration

```typescript
// Background job for cleaning up expired reservations
async function cleanupExpiredReservations(): Promise<void> {
  const redis = getRedisClient();
  const db = getPrismaClient();
  
  // Find expired reservations
  const expiredReservations = await db.reservation.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: {
        lt: new Date()
      }
    },
    include: {
      boxInventory: true
    }
  });
  
  for (const reservation of expiredReservations) {
    await expireReservation(reservation.id, reservation.boxInventory.id);
  }
}

async function expireReservation(
  reservationId: string,
  boxInventoryId: string
): Promise<void> {
  const db = getPrismaClient();
  const redis = getRedisClient();
  
  const lockKey = `lock:inventory:${boxInventoryId}`;
  const lockAcquired = await acquireLock(lockKey, 30);
  
  if (!lockAcquired) {
    // Schedule retry
    setTimeout(() => expireReservation(reservationId, boxInventoryId), 5000);
    return;
  }
  
  try {
    // Update reservation status
    await db.reservation.update({
      where: { id: reservationId },
      data: { status: 'EXPIRED' }
    });
    
    // Return inventory quantity
    await updateInventoryWithLock(boxInventoryId, 1);
    
    // Clean up Redis keys
    await Promise.all([
      redis.del(`reservation:ttl:${reservationId}`),
      redis.srem(`user:reservations:*`, reservationId)
    ]);
    
    // Send expiration notification
    await sendExpirationNotification(reservationId);
    
  } finally {
    await releaseLock(lockKey);
  }
}
```

## Failure Recovery Strategies

### 1. Lock Acquisition Failures
- **Immediate Retry**: Wait 1-2 seconds and retry up to 3 times
- **Exponential Backoff**: For persistent failures
- **User Feedback**: Clear messaging about temporary unavailability

### 2. Database Connection Failures
- **Connection Pooling**: Maintain healthy connection pool
- **Circuit Breaker**: Fail fast when database is down
- **Graceful Degradation**: Show cached data when possible

### 3. Redis Failures
- **Fallback to Database**: Use database-only locks as fallback
- **Lock Timeout**: Automatic lock expiration prevents deadlocks
- **Health Monitoring**: Monitor Redis health and failover

### 4. Partial Failures
- **Compensation Transactions**: Rollback inventory changes on failure
- **Idempotency**: Support retry operations safely
- **Audit Trail**: Log all reservation attempts for debugging

## Monitoring and Metrics

### Key Metrics to Track
1. **Reservation Success Rate**: Percentage of successful reservations
2. **Lock Contention**: Average time to acquire locks
3. **Inventory Accuracy**: Difference between cache and database
4. **TTL Cleanup Performance**: Time to process expired reservations
5. **Error Rates**: By error type and frequency

### Alerts
- High lock acquisition failure rate (>5%)
- Inventory inconsistencies detected
- TTL cleanup lag (>1 minute)
- High reservation failure rate (>10%)

## Performance Optimizations

1. **Connection Pooling**: Reuse Redis and database connections
2. **Batch Operations**: Process multiple reservations together when possible
3. **Caching Strategy**: Cache frequently accessed inventory data
4. **Async Processing**: Use queues for non-critical operations
5. **Database Indexing**: Optimize queries with proper indexes

## Testing Strategy

### Unit Tests
- Lock acquisition and release
- Inventory update logic
- Validation rules
- TTL cleanup

### Integration Tests
- End-to-end reservation flow
- Concurrent reservation attempts
- Failure recovery scenarios
- Redis failover behavior

### Load Tests
- High concurrency reservations
- Lock contention under load
- Database performance limits
- Memory usage patterns
