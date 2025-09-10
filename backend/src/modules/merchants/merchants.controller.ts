import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MerchantsService } from './merchants.service';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get()
  async getAllMerchants() {
    const merchants = await this.merchantsService.findAll();
    return {
      success: true,
      data: merchants,
    };
  }
}
