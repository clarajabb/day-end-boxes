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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: ['query', 'error', 'info', 'warn'],
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('🗄️ Database connected successfully');
        }
        catch (error) {
            this.logger.warn('⚠️ Database connection failed - running in test mode');
            this.logger.warn(`Database error: ${error.message}`);
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🗄️ Database disconnected');
    }
    async executeTransaction(fn) {
        return await this.$transaction(fn);
    }
    async softDelete(model, where) {
        return await this[model].update({
            where,
            data: {
                deletedAt: new Date(),
            },
        });
    }
    async findManyActive(model, args = {}) {
        return await this[model].findMany({
            ...args,
            where: {
                ...args.where,
                deletedAt: null,
            },
        });
    }
    async findNearbyBoxes(latitude, longitude, radiusKm = 10, filters = {}) {
        const radiusInMeters = radiusKm * 1000;
        return await this.$queryRaw `
      SELECT 
        bi.*,
        bt.*,
        m.*,
        (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(m.latitude)) * 
            cos(radians(m.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(m.latitude))
          )
        ) AS distance
      FROM box_inventory bi
      JOIN box_types bt ON bi.box_type_id = bt.id
      JOIN merchants m ON bt.merchant_id = m.id
      WHERE 
        bi.status = 'ACTIVE'
        AND bi.remaining_quantity > 0
        AND m.status = 'APPROVED'
        AND (
          6371 * acos(
            cos(radians(${latitude})) * 
            cos(radians(m.latitude)) * 
            cos(radians(m.longitude) - radians(${longitude})) + 
            sin(radians(${latitude})) * 
            sin(radians(m.latitude))
          )
        ) <= ${radiusKm}
      ORDER BY distance ASC
    `;
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map