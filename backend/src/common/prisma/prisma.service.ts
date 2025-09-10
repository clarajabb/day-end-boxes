import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: ['query', 'error', 'info', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('🗄️ Database connected successfully');
    } catch (error) {
      this.logger.warn('⚠️ Database connection failed - running in test mode');
      this.logger.warn(`Database error: ${error.message}`);
      // Don't throw error - allow app to start without database for testing
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🗄️ Database disconnected');
  }

  // Helper method for transactions
  async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return await this.$transaction(fn);
  }

  // Helper method for soft deletes (if needed in future)
  async softDelete(model: string, where: any) {
    return await this[model].update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }

  // Helper method for finding non-deleted records
  async findManyActive(model: string, args: any = {}) {
    return await this[model].findMany({
      ...args,
      where: {
        ...args.where,
        deletedAt: null,
      },
    });
  }

  // Geospatial helper for nearby search
  async findNearbyBoxes(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    filters: any = {}
  ) {
    // Using raw SQL for geospatial queries
    const radiusInMeters = radiusKm * 1000;
    
    return await this.$queryRaw`
      SELECT 
        bi.*,
        bt.*,
        m.*,
        (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(m.latitude)) * 
            cos(radians(m.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(m.latitude))
          )
        ) AS distance
      FROM box_inventory bi
      JOIN box_types bt ON bi.box_type_id = bt.id
      JOIN merchants m ON bt.merchant_id = m.id
      WHERE 
        bi.status = 'ACTIVE'
        AND bi.remaining_quantity > 0
        AND m.status = 'APPROVED'
        AND (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(m.latitude)) * 
            cos(radians(m.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(m.latitude))
          )
        ) <= ${radiusKm}
      ORDER BY distance ASC
    `;
  }
}
