import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthTestService {
    private jwtService;
    private configService;
    private readonly logger;
    private otpStore;
    private rateLimitStore;
    private userStore;
    private refreshTokenStore;
    constructor(jwtService: JwtService, configService: ConfigService);
    sendOtp(phone: string, locale?: string): Promise<void>;
    verifyOtp(phone: string, otp: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    getUserProfile(userId: string): Promise<any>;
    updateUserProfile(userId: string, updateData: any): Promise<any>;
    logout(refreshToken: string): Promise<void>;
    private normalizePhoneNumber;
    private generateOtp;
    private cleanupExpiredOtps;
}
