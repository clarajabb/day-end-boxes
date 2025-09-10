import { Module } from '@nestjs/common';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { MerchantsTestController } from './merchants-test.controller';
import { MerchantsTestService } from './merchants-test.service';

@Module({
  controllers: [MerchantsController, MerchantsTestController],
  providers: [MerchantsService, MerchantsTestService],
  exports: [MerchantsService, MerchantsTestService],
})
export class MerchantsModule {}
