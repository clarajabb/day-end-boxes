import { AuthTestService } from './auth-test.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto, UpdateProfileDto } from './dto';
export declare class AuthTestController {
    private readonly authTestService;
    constructor(authTestService: AuthTestService);
    getStatus(): {
        success: boolean;
        message: string;
        note: string;
        features: {
            database: string;
            redis: string;
            otp: string;
            rateLimiting: string;
        };
        endpoints: {
            'POST /auth-test/send-otp': string;
            'POST /auth-test/verify-otp': string;
            'POST /auth-test/refresh': string;
            'GET /auth-test/profile': string;
            'PATCH /auth-test/profile': string;
            'POST /auth-test/logout': string;
        };
    };
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
        note: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: any;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
        data: {
            accessToken: string;
        };
    }>;
    getProfile(user: any): Promise<{
        success: boolean;
        data: any;
    }>;
    updateProfile(user: any, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    logout(body: {
        refreshToken: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
