export declare class MerchantsTestService {
    private merchantStore;
    constructor();
    private initializeTestData;
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    findByArea(area: string): Promise<any[]>;
    findByCuisine(cuisine: string): Promise<any[]>;
    getTopRated(limit?: number): Promise<any[]>;
    getMostSustainable(limit?: number): Promise<any[]>;
    getStats(): Promise<{
        totalMerchants: number;
        totalBoxesSold: any;
        averageRating: number;
        averageSustainabilityScore: number;
        businessTypes: any;
        areas: any;
        topRated: any[];
        mostSustainable: any[];
    }>;
    createTestMerchant(merchantData: any): Promise<any>;
    getAllTestMerchants(): Promise<any[]>;
}
