"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function addBoxesToRestaurants() {
    console.log('🍽️ Adding boxes to existing restaurants...');
    const merchants = await prisma.merchant.findMany({
        where: { status: 'APPROVED' }
    });
    console.log(`Found ${merchants.length} approved merchants`);
    for (const merchant of merchants) {
        console.log(`\n📦 Adding boxes for ${merchant.businessName}...`);
        const boxTypes = [
            {
                name: 'Mixed Lunch Box',
                description: 'Fresh mixed lunch with main course, salad, and dessert',
                originalPrice: 25000,
                discountedPrice: 7500,
                category: 'RESTAURANT',
                allergens: ['gluten', 'dairy'],
                dietaryInfo: ['HALAL'],
                images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400']
            },
            {
                name: 'Vegetarian Delight',
                description: 'Healthy vegetarian meal with fresh vegetables and grains',
                originalPrice: 20000,
                discountedPrice: 6000,
                category: 'RESTAURANT',
                allergens: ['gluten'],
                dietaryInfo: ['VEGETARIAN', 'HALAL'],
                images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400']
            },
            {
                name: 'Quick Snack Box',
                description: 'Light snack with sandwich, fruit, and drink',
                originalPrice: 15000,
                discountedPrice: 4500,
                category: 'RESTAURANT',
                allergens: ['gluten', 'dairy'],
                dietaryInfo: ['HALAL'],
                images: ['https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400']
            }
        ];
        for (const boxTypeData of boxTypes) {
            const boxType = await prisma.boxType.create({
                data: {
                    merchantId: merchant.id,
                    name: boxTypeData.name,
                    description: boxTypeData.description,
                    originalPrice: boxTypeData.originalPrice,
                    discountedPrice: boxTypeData.discountedPrice,
                    category: boxTypeData.category,
                    allergens: boxTypeData.allergens,
                    dietaryInfo: boxTypeData.dietaryInfo,
                    images: boxTypeData.images
                }
            });
            console.log(`  ✅ Created box type: ${boxType.name}`);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            for (const date of [today, tomorrow]) {
                const availableDate = new Date(date);
                availableDate.setHours(0, 0, 0, 0);
                const boxInventory = await prisma.boxInventory.create({
                    data: {
                        boxTypeId: boxType.id,
                        merchantId: merchant.id,
                        availableDate,
                        originalQuantity: Math.floor(Math.random() * 10) + 5,
                        remainingQuantity: Math.floor(Math.random() * 10) + 5,
                        price: boxTypeData.discountedPrice,
                        pickupStartTime: new Date(availableDate.getTime() + 17 * 60 * 60 * 1000),
                        pickupEndTime: new Date(availableDate.getTime() + 20 * 60 * 60 * 1000),
                        status: 'ACTIVE'
                    }
                });
                console.log(`    📅 Added inventory for ${availableDate.toDateString()}: ${boxInventory.remainingQuantity} boxes`);
            }
        }
    }
    console.log('\n🎉 Successfully added boxes to all restaurants!');
}
addBoxesToRestaurants()
    .catch((e) => {
    console.error('❌ Error adding boxes:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-boxes.js.map