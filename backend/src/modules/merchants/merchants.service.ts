import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MerchantsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async findAll() {
    return await this.prisma.merchant.findMany({
      where: { status: 'APPROVED' },
    });
  }

  async register(merchantData: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    password: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    description?: string;
  }) {
    // Check if merchant already exists
    const existingMerchant = await this.prisma.merchant.findFirst({
      where: {
        OR: [
          { email: merchantData.email },
          { phone: merchantData.phone }
        ]
      }
    });

    if (existingMerchant) {
      throw new ConflictException('Merchant with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(merchantData.password, 10);

    // Create merchant
    const merchant = await this.prisma.merchant.create({
      data: {
        businessName: merchantData.businessName,
        contactName: merchantData.contactName,
        email: merchantData.email,
        phone: merchantData.phone,
        passwordHash: hashedPassword,
        category: merchantData.category as any,
        address: merchantData.address,
        latitude: merchantData.latitude,
        longitude: merchantData.longitude,
        description: merchantData.description,
        status: 'PENDING', // Requires admin approval
      }
    });

    // Generate JWT token
    const payload = { 
      sub: merchant.id, 
      email: merchant.email, 
      type: 'merchant' 
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        contactName: merchant.contactName,
        email: merchant.email,
        phone: merchant.phone,
        category: merchant.category,
        address: merchant.address,
        status: merchant.status,
        createdAt: merchant.createdAt
      },
      accessToken
    };
  }

  async login(email: string, password: string) {
    // Find merchant by email
    const merchant = await this.prisma.merchant.findUnique({
      where: { email }
    });

    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if merchant is approved
    if (merchant.status !== 'APPROVED') {
      throw new UnauthorizedException('Account is not approved yet');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, merchant.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { 
      sub: merchant.id, 
      email: merchant.email, 
      type: 'merchant' 
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        contactName: merchant.contactName,
        email: merchant.email,
        phone: merchant.phone,
        category: merchant.category,
        address: merchant.address,
        status: merchant.status,
        createdAt: merchant.createdAt
      },
      accessToken
    };
  }

  async getMerchantProfile(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: {
        boxTypes: true,
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            },
            boxInventory: {
              include: {
                boxType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!merchant) {
      throw new UnauthorizedException('Merchant not found');
    }

    return merchant;
  }

  async updateMerchantProfile(merchantId: string, updateData: any) {
    const merchant = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: updateData
    });

    return merchant;
  }
}
