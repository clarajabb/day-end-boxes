import { Injectable } from '@nestjs/common';

/**
 * Test version of MerchantsService that works without database
 * This allows us to test the merchants endpoints without external dependencies
 */
@Injectable()
export class MerchantsTestService {
  // In-memory storage for testing
  private merchantStore = new Map<string, any>();

  constructor() {
    // Initialize with realistic test merchant data
    this.initializeTestData();
  }

  private initializeTestData() {
    const merchants = [
      {
        id: 'merchant_1',
        businessName: 'Café Central',
        businessType: 'RESTAURANT',
        contactName: 'Ahmad Mansour',
        email: 'ahmad@cafecentral.com',
        phone: '+96171234567',
        address: {
          street: '123 Hamra Street',
          city: 'Beirut',
          area: 'Hamra',
          postalCode: '1103',
          coordinates: {
            latitude: 33.8959,
            longitude: 35.4781
          }
        },
        businessHours: {
          monday: { open: '07:00', close: '22:00' },
          tuesday: { open: '07:00', close: '22:00' },
          wednesday: { open: '07:00', close: '22:00' },
          thursday: { open: '07:00', close: '22:00' },
          friday: { open: '07:00', close: '23:00' },
          saturday: { open: '08:00', close: '23:00' },
          sunday: { open: '08:00', close: '21:00' }
        },
        cuisine: ['Lebanese', 'Mediterranean'],
        description: 'Authentic Lebanese cuisine in the heart of Beirut. Serving fresh, traditional dishes with a modern twist.',
        imageUrl: 'https://example.com/cafe-central.jpg',
        rating: 4.5,
        totalReviews: 127,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-06-15T10:00:00.000Z',
        lastBoxUpdate: '2025-01-20T14:30:00.000Z',
        totalBoxesSold: 245,
        sustainabilityScore: 85
      },
      {
        id: 'merchant_2',
        businessName: 'Fresh Bakery',
        businessType: 'BAKERY',
        contactName: 'Fatima Khoury',
        email: 'fatima@freshbakery.com',
        phone: '+96171345678',
        address: {
          street: '456 Verdun Street',
          city: 'Beirut',
          area: 'Verdun',
          postalCode: '1104',
          coordinates: {
            latitude: 33.8704,
            longitude: 35.4826
          }
        },
        businessHours: {
          monday: { open: '06:00', close: '18:00' },
          tuesday: { open: '06:00', close: '18:00' },
          wednesday: { open: '06:00', close: '18:00' },
          thursday: { open: '06:00', close: '18:00' },
          friday: { open: '06:00', close: '19:00' },
          saturday: { open: '06:00', close: '19:00' },
          sunday: { open: '07:00', close: '17:00' }
        },
        cuisine: ['Bakery', 'Pastries', 'Lebanese Sweets'],
        description: 'Traditional Lebanese bakery offering fresh bread, pastries, and authentic sweets daily.',
        imageUrl: 'https://example.com/fresh-bakery.jpg',
        rating: 4.7,
        totalReviews: 89,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-08-20T09:15:00.000Z',
        lastBoxUpdate: '2025-01-21T08:45:00.000Z',
        totalBoxesSold: 156,
        sustainabilityScore: 92
      },
      {
        id: 'merchant_3',
        businessName: 'Lebanese Kitchen',
        businessType: 'RESTAURANT',
        contactName: 'Omar Saad',
        email: 'omar@lebanesekitchen.com',
        phone: '+96171456789',
        address: {
          street: '789 Ashrafieh Avenue',
          city: 'Beirut',
          area: 'Ashrafieh',
          postalCode: '1105',
          coordinates: {
            latitude: 33.8886,
            longitude: 35.5157
          }
        },
        businessHours: {
          monday: { open: '11:00', close: '23:00' },
          tuesday: { open: '11:00', close: '23:00' },
          wednesday: { open: '11:00', close: '23:00' },
          thursday: { open: '11:00', close: '24:00' },
          friday: { open: '11:00', close: '24:00' },
          saturday: { open: '11:00', close: '24:00' },
          sunday: { open: '12:00', close: '22:00' }
        },
        cuisine: ['Lebanese', 'Middle Eastern', 'Grills'],
        description: 'Authentic Lebanese restaurant specializing in traditional grills and mezze platters.',
        imageUrl: 'https://example.com/lebanese-kitchen.jpg',
        rating: 4.3,
        totalReviews: 203,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-04-10T11:30:00.000Z',
        lastBoxUpdate: '2025-01-19T19:15:00.000Z',
        totalBoxesSold: 312,
        sustainabilityScore: 78
      },
      {
        id: 'merchant_4',
        businessName: 'Green Garden',
        businessType: 'RESTAURANT',
        contactName: 'Layla Habib',
        email: 'layla@greengarden.com',
        phone: '+96171567890',
        address: {
          street: '321 Jounieh Corniche',
          city: 'Jounieh',
          area: 'Jounieh',
          postalCode: '1201',
          coordinates: {
            latitude: 33.9816,
            longitude: 35.6147
          }
        },
        businessHours: {
          monday: { open: '10:00', close: '21:00' },
          tuesday: { open: '10:00', close: '21:00' },
          wednesday: { open: '10:00', close: '21:00' },
          thursday: { open: '10:00', close: '22:00' },
          friday: { open: '10:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '21:00' }
        },
        cuisine: ['Vegetarian', 'Vegan', 'Healthy'],
        description: 'Eco-friendly restaurant serving organic vegetarian and vegan dishes with a focus on sustainability.',
        imageUrl: 'https://example.com/green-garden.jpg',
        rating: 4.6,
        totalReviews: 94,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-09-05T12:00:00.000Z',
        lastBoxUpdate: '2025-01-21T11:30:00.000Z',
        totalBoxesSold: 98,
        sustainabilityScore: 95
      },
      {
        id: 'merchant_5',
        businessName: 'Sweet Dreams',
        businessType: 'DESSERT_SHOP',
        contactName: 'Rami Nakhleh',
        email: 'rami@sweetdreams.com',
        phone: '+96171678901',
        address: {
          street: '654 ABC Mall',
          city: 'Beirut',
          area: 'Achrafieh',
          postalCode: '1106',
          coordinates: {
            latitude: 33.8821,
            longitude: 35.5200
          }
        },
        businessHours: {
          monday: { open: '10:00', close: '22:00' },
          tuesday: { open: '10:00', close: '22:00' },
          wednesday: { open: '10:00', close: '22:00' },
          thursday: { open: '10:00', close: '23:00' },
          friday: { open: '10:00', close: '24:00' },
          saturday: { open: '10:00', close: '24:00' },
          sunday: { open: '11:00', close: '22:00' }
        },
        cuisine: ['Desserts', 'Ice Cream', 'Cakes'],
        description: 'Artisanal dessert shop offering handcrafted cakes, pastries, and premium ice cream.',
        imageUrl: 'https://example.com/sweet-dreams.jpg',
        rating: 4.8,
        totalReviews: 156,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-07-12T15:45:00.000Z',
        lastBoxUpdate: '2025-01-20T20:00:00.000Z',
        totalBoxesSold: 187,
        sustainabilityScore: 72
      },
      {
        id: 'merchant_6',
        businessName: 'Quick Bites',
        businessType: 'FAST_FOOD',
        contactName: 'Karim Fares',
        email: 'karim@quickbites.com',
        phone: '+96171789012',
        address: {
          street: '987 Jal el Dib Highway',
          city: 'Jal el Dib',
          area: 'Metn',
          postalCode: '1302',
          coordinates: {
            latitude: 33.8967,
            longitude: 35.5544
          }
        },
        businessHours: {
          monday: { open: '08:00', close: '23:00' },
          tuesday: { open: '08:00', close: '23:00' },
          wednesday: { open: '08:00', close: '23:00' },
          thursday: { open: '08:00', close: '24:00' },
          friday: { open: '08:00', close: '24:00' },
          saturday: { open: '08:00', close: '24:00' },
          sunday: { open: '09:00', close: '22:00' }
        },
        cuisine: ['Fast Food', 'Burgers', 'Sandwiches'],
        description: 'Fast-casual restaurant serving gourmet burgers, fresh sandwiches, and quick healthy meals.',
        imageUrl: 'https://example.com/quick-bites.jpg',
        rating: 4.2,
        totalReviews: 78,
        status: 'APPROVED',
        isActive: true,
        joinedAt: '2024-10-01T13:20:00.000Z',
        lastBoxUpdate: '2025-01-18T16:45:00.000Z',
        totalBoxesSold: 134,
        sustainabilityScore: 68
      }
    ];

    // Store merchants
    merchants.forEach(merchant => {
      this.merchantStore.set(merchant.id, merchant);
    });
  }

  async findAll() {
    // Return all approved merchants (all our test merchants are approved)
    return Array.from(this.merchantStore.values())
      .filter(merchant => merchant.status === 'APPROVED')
      .sort((a, b) => b.rating - a.rating); // Sort by rating (highest first)
  }

  async findById(id: string) {
    const merchant = this.merchantStore.get(id);
    if (!merchant) {
      throw new Error('Merchant not found');
    }
    return merchant;
  }

  async findByArea(area: string) {
    return Array.from(this.merchantStore.values())
      .filter(merchant => 
        merchant.status === 'APPROVED' && 
        merchant.address.area.toLowerCase().includes(area.toLowerCase())
      )
      .sort((a, b) => b.rating - a.rating);
  }

  async findByCuisine(cuisine: string) {
    return Array.from(this.merchantStore.values())
      .filter(merchant => 
        merchant.status === 'APPROVED' && 
        merchant.cuisine.some(c => c.toLowerCase().includes(cuisine.toLowerCase()))
      )
      .sort((a, b) => b.rating - a.rating);
  }

  async getTopRated(limit: number = 5) {
    return Array.from(this.merchantStore.values())
      .filter(merchant => merchant.status === 'APPROVED')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  async getMostSustainable(limit: number = 5) {
    return Array.from(this.merchantStore.values())
      .filter(merchant => merchant.status === 'APPROVED')
      .sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
      .slice(0, limit);
  }

  async getStats() {
    const merchants = Array.from(this.merchantStore.values())
      .filter(merchant => merchant.status === 'APPROVED');
    
    const totalBoxesSold = merchants.reduce((sum, merchant) => sum + merchant.totalBoxesSold, 0);
    const avgRating = merchants.reduce((sum, merchant) => sum + merchant.rating, 0) / merchants.length;
    const avgSustainabilityScore = merchants.reduce((sum, merchant) => sum + merchant.sustainabilityScore, 0) / merchants.length;
    
    const businessTypes = merchants.reduce((acc, merchant) => {
      acc[merchant.businessType] = (acc[merchant.businessType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const areas = merchants.reduce((acc, merchant) => {
      acc[merchant.address.area] = (acc[merchant.address.area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMerchants: merchants.length,
      totalBoxesSold,
      averageRating: Math.round(avgRating * 10) / 10,
      averageSustainabilityScore: Math.round(avgSustainabilityScore),
      businessTypes,
      areas,
      topRated: await this.getTopRated(3),
      mostSustainable: await this.getMostSustainable(3)
    };
  }

  // Test helper methods
  async createTestMerchant(merchantData: any) {
    const newMerchant = {
      id: `merchant_test_${Date.now()}`,
      ...merchantData,
      status: 'APPROVED',
      isActive: true,
      joinedAt: new Date().toISOString(),
      lastBoxUpdate: new Date().toISOString(),
      totalBoxesSold: 0,
      rating: 0,
      totalReviews: 0,
      sustainabilityScore: 50
    };

    this.merchantStore.set(newMerchant.id, newMerchant);
    return newMerchant;
  }

  async getAllTestMerchants() {
    return Array.from(this.merchantStore.values());
  }
}
