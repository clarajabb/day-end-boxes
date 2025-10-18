import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { MerchantsTestController } from './merchants-test.controller';
import { MerchantsTestService } from './merchants-test.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [MerchantsController, MerchantsTestController],
  providers: [MerchantsService, MerchantsTestService],
  exports: [MerchantsService, MerchantsTestService],
})
export class MerchantsModule {}
