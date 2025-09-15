import { MerchantsTestService } from './merchants-test.service';
export declare class MerchantsTestController {
    private readonly merchantsTestService;
    constructor(merchantsTestService: MerchantsTestService);
    getStatus(): {
        success: boolean;
        message: string;
        features: {
            database: string;
            merchantData: string;
            locations: string;
        };
        testMerchants: {
            total: number;
            types: string[];
            areas: string[];
            cuisines: string[];
        };
        endpoints: {
            'GET /merchants-test': string;
            'GET /merchants-test/stats': string;
            'GET /merchants-test/top-rated': string;
            'GET /merchants-test/sustainable': string;
            'GET /merchants-test/search': string;
            'GET /merchants-test/:id': string;
        };
    };
    getAllMerchants(): Promise<{
        success: boolean;
        message: string;
        data: any[];
        meta: {
            total: number;
            note: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
        meta?: undefined;
    }>;
    getStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalMerchants: number;
            totalBoxesSold: any;
            averageRating: number;
            averageSustainabilityScore: number;
            businessTypes: any;
            areas: any;
            topRated: any[];
            mostSustainable: any[];
        };
    }>;
    getTopRated(limit?: string): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
    getMostSustainable(limit?: string): Promise<{
        success: boolean;
        message: string;
        data: any[];
    }>;
    searchMerchants(area?: string, cuisine?: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        meta: {
            total: any;
            searchType: string;
            searchTerm: string;
        };
    }>;
    getMerchantById(id: string): Promise<{
        success: boolean;
        message: string;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        data?: undefined;
    }>;
    getAllTestMerchants(): Promise<{
        success: boolean;
        message: string;
        data: any[];
        note: string;
    }>;
}
