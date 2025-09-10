import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { OtpService } from '../../common/otp/otp.service';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto';
export declare class AuthService {
    private prisma;
    private redis;
    private jwtService;
    private configService;
    private otpService;
    private usersService;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, jwtService: JwtService, configService: ConfigService, otpService: OtpService, usersService: UsersService);
    sendOtp(phone: string, locale?: string): Promise<void>;
    verifyOtp(phone: string, otp: string): Promise<any>;
    refreshToken(refreshToken: string): Promise<string>;
    getUserProfile(userId: string): Promise<any>;
    updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<any>;
    logout(userId: string): Promise<void>;
    validateUser(userId: string): Promise<any>;
    private generateTokens;
    private generateOtp;
    private normalizePhoneNumber;
}
