"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantsTestController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const merchants_test_service_1 = require("./merchants-test.service");
let MerchantsTestController = class MerchantsTestController {
    constructor(merchantsTestService) {
        this.merchantsTestService = merchantsTestService;
    }
    getStatus() {
        return {
            success: true,
            message: 'Merchants service running in TEST MODE',
            features: {
                database: 'In-memory (no Prisma)',
                merchantData: 'Pre-populated test merchants',
                locations: 'Beirut, Jounieh, Jal el Dib areas'
            },
            testMerchants: {
                total: 6,
                types: ['Restaurant', 'Bakery', 'Dessert Shop', 'Fast Food'],
                areas: ['Hamra', 'Verdun', 'Ashrafieh', 'Jounieh', 'Metn'],
                cuisines: ['Lebanese', 'Mediterranean', 'Vegetarian', 'Fast Food', 'Desserts']
            },
            endpoints: {
                'GET /merchants-test': 'Get all approved merchants',
                'GET /merchants-test/stats': 'Get merchant statistics',
                'GET /merchants-test/top-rated': 'Get top rated merchants',
                'GET /merchants-test/sustainable': 'Get most sustainable merchants',
                'GET /merchants-test/search': 'Search merchants by area or cuisine',
                'GET /merchants-test/:id': 'Get specific merchant details'
            }
        };
    }
    async getAllMerchants() {
        try {
            const merchants = await this.merchantsTestService.findAll();
            return {
                success: true,
                message: 'Approved merchants retrieved successfully',
                data: merchants,
                meta: {
                    total: merchants.length,
                    note: 'TEST MODE: Using pre-populated merchant data'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve merchants',
                error: error.message
            };
        }
    }
    async getStats() {
        const stats = await this.merchantsTestService.getStats();
        return {
            success: true,
            message: 'Merchant statistics retrieved successfully',
            data: stats
        };
    }
    async getTopRated(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        const merchants = await this.merchantsTestService.getTopRated(limitNum);
        return {
            success: true,
            message: `Top ${merchants.length} rated merchants retrieved successfully`,
            data: merchants
        };
    }
    async getMostSustainable(limit) {
        const limitNum = limit ? parseInt(limit, 10) : 5;
        const merchants = await this.merchantsTestService.getMostSustainable(limitNum);
        return {
            success: true,
            message: `Top ${merchants.length} sustainable merchants retrieved successfully`,
            data: merchants
        };
    }
    async searchMerchants(area, cuisine) {
        let merchants;
        let searchType = '';
        let searchTerm = '';
        if (area) {
            merchants = await this.merchantsTestService.findByArea(area);
            searchType = 'area';
            searchTerm = area;
        }
        else if (cuisine) {
            merchants = await this.merchantsTestService.findByCuisine(cuisine);
            searchType = 'cuisine';
            searchTerm = cuisine;
        }
        else {
            merchants = await this.merchantsTestService.findAll();
            searchType = 'all';
            searchTerm = 'no filter';
        }
        return {
            success: true,
            message: `Merchants search completed for ${searchType}: ${searchTerm}`,
            data: merchants,
            meta: {
                total: merchants.length,
                searchType,
                searchTerm
            }
        };
    }
    async getMerchantById(id) {
        try {
            const merchant = await this.merchantsTestService.findById(id);
            return {
                success: true,
                message: 'Merchant details retrieved successfully',
                data: merchant
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Merchant not found',
                error: error.message
            };
        }
    }
    async getAllTestMerchants() {
        const merchants = await this.merchantsTestService.getAllTestMerchants();
        return {
            success: true,
            message: `Retrieved ${merchants.length} test merchants`,
            data: merchants,
            note: 'This includes all merchants regardless of status'
        };
    }
};
exports.MerchantsTestController = MerchantsTestController;
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Test mode status for merchants service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test mode information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MerchantsTestController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all approved merchants (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approved merchants retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getAllMerchants", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant statistics (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('top-rated'),
    (0, swagger_1.ApiOperation)({ summary: 'Get top rated merchants (TEST MODE)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of merchants to return (default: 5)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Top rated merchants retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getTopRated", null);
__decorate([
    (0, common_1.Get)('sustainable'),
    (0, swagger_1.ApiOperation)({ summary: 'Get most sustainable merchants (TEST MODE)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Number of merchants to return (default: 5)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Most sustainable merchants retrieved successfully' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getMostSustainable", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search merchants by area or cuisine (TEST MODE)' }),
    (0, swagger_1.ApiQuery)({ name: 'area', required: false, description: 'Filter by area (e.g., Hamra, Verdun)' }),
    (0, swagger_1.ApiQuery)({ name: 'cuisine', required: false, description: 'Filter by cuisine (e.g., Lebanese, Vegetarian)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchants search results retrieved successfully' }),
    __param(0, (0, common_1.Query)('area')),
    __param(1, (0, common_1.Query)('cuisine')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "searchMerchants", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific merchant details (TEST MODE)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Merchant details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Merchant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getMerchantById", null);
__decorate([
    (0, common_1.Get)('test/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all test merchants including non-approved (for testing)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All test merchants retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MerchantsTestController.prototype, "getAllTestMerchants", null);
exports.MerchantsTestController = MerchantsTestController = __decorate([
    (0, swagger_1.ApiTags)('Merchants (Test Mode)'),
    (0, common_1.Controller)('merchants-test'),
    __metadata("design:paramtypes", [merchants_test_service_1.MerchantsTestService])
], MerchantsTestController);
//# sourceMappingURL=merchants-test.controller.js.map