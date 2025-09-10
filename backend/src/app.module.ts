import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Core modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { BoxesModule } from './modules/boxes/boxes.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { AdminModule } from './modules/admin/admin.module';

// Services
import { OtpModule } from './common/otp/otp.module';
import { StorageModule } from './common/storage/storage.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT) || 100,
      },
    ]),

    // Scheduling for background tasks
    ScheduleModule.forRoot(),

    // Core modules
    PrismaModule,
    RedisModule,

    // Services
    OtpModule,
    StorageModule,

    // Feature modules
    AuthModule,
    UsersModule,
    MerchantsModule,
    BoxesModule,
    ReservationsModule,
    AdminModule,
  ],
})
export class AppModule {}
