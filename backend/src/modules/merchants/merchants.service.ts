import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.merchant.findMany({
      where: { status: 'APPROVED' },
    });
  }
}
