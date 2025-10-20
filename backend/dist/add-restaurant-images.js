"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function addRestaurantImages() {
    console.log('🍽️ Adding beautiful images to restaurants...');
    const merchants = await prisma.merchant.findMany({
        where: { status: 'APPROVED' }
    });
    console.log(`Found ${merchants.length} approved merchants`);
    const restaurantImages = [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1574484284002-952d924569e8?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop&crop=center',
    ];
    for (let i = 0; i < merchants.length; i++) {
        const merchant = merchants[i];
        const imageUrl = restaurantImages[i % restaurantImages.length];
        console.log(`📸 Adding image to ${merchant.businessName}...`);
        await prisma.merchant.update({
            where: { id: merchant.id },
            data: {
                profileImage: imageUrl
            }
        });
        console.log(`  ✅ Added beautiful image: ${imageUrl}`);
    }
    console.log('\n🎉 Successfully added images to all restaurants!');
}
addRestaurantImages()
    .catch((e) => {
    console.error('❌ Error adding images:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add-restaurant-images.js.map