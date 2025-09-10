import { ConfigService } from '@nestjs/config';
export declare class OtpService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendOtp(phone: string, otp: string, locale?: string): Promise<void>;
    private sendTwilioSms;
    private sendMockSms;
    private getOtpMessage;
    isValidLebanesePhone(phone: string): boolean;
    formatPhoneForDisplay(phone: string): string;
}
