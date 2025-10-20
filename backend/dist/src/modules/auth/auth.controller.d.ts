import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, RefreshTokenDto, UpdateProfileDto, RegisterDto, LoginDto, ChangePasswordDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    healthCheck(): {
        success: boolean;
        message: string;
        timestamp: string;
        endpoints: {
            'POST /auth/send-otp': string;
            'POST /auth/verify-otp': string;
            'POST /auth/refresh': string;
            'GET /auth/profile': string;
            'PATCH /auth/profile': string;
            'POST /auth/logout': string;
        };
    };
    debugOtp(phone: string): Promise<any>;
    testRedis(): Promise<any>;
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        data: any;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        success: boolean;
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
        data: any;
    }>;
    logout(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        data: {
            user: any;
            accessToken: string;
            refreshToken: string;
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        data: {
            user: any;
            accessToken: string;
            refreshToken: string;
        };
        message: string;
    }>;
    changePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
