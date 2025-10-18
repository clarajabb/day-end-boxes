import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BoxesService {
  constructor(private prisma: PrismaService) {}

  async findNearbyBoxes(latitude: number, longitude: number, radiusKm: number = 10) {
    // Calculate bounding box for the search radius
    const latRange = radiusKm / 111; // Approximate km per degree latitude
    const lngRange = radiusKm / (111 * Math.cos(latitude * Math.PI / 180)); // Adjust for longitude
    
    const minLat = latitude - latRange;
    const maxLat = latitude + latRange;
    const minLng = longitude - lngRange;
    const maxLng = longitude + lngRange;
    
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const boxes = await this.prisma.boxInventory.findMany({
      where: {
        status: 'ACTIVE',
        remainingQuantity: {
          gt: 0
        },
        availableDate: {
          gte: today
        },
        merchant: {
          latitude: {
            gte: minLat,
            lte: maxLat
          },
          longitude: {
            gte: minLng,
            lte: maxLng
          }
        }
      },
      include: {
        boxType: true,
        merchant: {
          select: {
            id: true,
            businessName: true,
            address: true,
            latitude: true,
            longitude: true,
            category: true
          }
        }
      },
      orderBy: {
        availableDate: 'asc'
      }
    });
    
    // Calculate actual distance and filter by radius
    const filteredBoxes = boxes.filter(box => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        box.merchant.latitude,
        box.merchant.longitude
      );
      return distance <= radiusKm;
    });
    
      // Format the response
      return filteredBoxes.map(box => ({
        id: box.id,
        merchantId: box.merchant.id,
        merchantName: box.merchant.businessName,
        boxType: box.boxType.name,
        originalPrice: Math.round(box.boxType.originalPrice / 1000), // Convert LBP to USD (1000 LBP = 1 USD)
        discountedPrice: Math.round(box.price / 1000), // Convert LBP to USD (1000 LBP = 1 USD)
        discountPercentage: Math.round(((box.boxType.originalPrice - box.price) / box.boxType.originalPrice) * 100),
        availableQuantity: box.remainingQuantity,
        pickupTime: `${box.pickupStartTime.toTimeString().slice(0, 5)}-${box.pickupEndTime.toTimeString().slice(0, 5)}`,
        description: box.boxType.description,
        allergens: box.boxType.allergens,
        isAvailable: box.remainingQuantity > 0,
        createdAt: box.createdAt,
        availableDate: box.availableDate,
        merchantAddress: box.merchant.address,
        merchantCategory: box.merchant.category
      }));
  }
  
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async findBoxById(id: string) {
    return await this.prisma.boxInventory.findUnique({
      where: { id },
      include: {
        boxType: {
          include: {
            merchant: true,
          },
        },
      },
    });
  }
}
