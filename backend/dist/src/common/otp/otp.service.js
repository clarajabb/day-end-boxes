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
var OtpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let OtpService = OtpService_1 = class OtpService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OtpService_1.name);
    }
    async sendOtp(phone, otp, locale = 'ar') {
        const provider = this.configService.get('OTP_PROVIDER', 'twilio');
        try {
            switch (provider) {
                case 'twilio':
                    await this.sendTwilioSms(phone, otp, locale);
                    break;
                case 'mock':
                    await this.sendMockSms(phone, otp, locale);
                    break;
                default:
                    throw new Error(`Unsupported OTP provider: ${provider}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send OTP via ${provider}:`, error);
            throw error;
        }
    }
    async sendTwilioSms(phone, otp, locale) {
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');
        if (!accountSid || !authToken || !fromNumber) {
            throw new Error('Twilio credentials not configured');
        }
        const message = this.getOtpMessage(otp, locale);
        try {
            const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, new URLSearchParams({
                From: fromNumber,
                To: phone,
                Body: message,
            }), {
                auth: {
                    username: accountSid,
                    password: authToken,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            this.logger.log(`OTP sent via Twilio to ${phone}: ${response.data.sid}`);
        }
        catch (error) {
            this.logger.error('Twilio API error:', error.response?.data || error.message);
            throw new Error('Failed to send SMS via Twilio');
        }
    }
    async sendMockSms(phone, otp, locale) {
        const message = this.getOtpMessage(otp, locale);
        this.logger.log(`[MOCK SMS] To: ${phone}`);
        this.logger.log(`[MOCK SMS] Message: ${message}`);
        this.logger.log(`[MOCK SMS] OTP: ${otp}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    getOtpMessage(otp, locale) {
        const messages = {
            ar: `رمز التحقق الخاص بك في تطبيق صناديق نهاية اليوم هو: ${otp}\nلا تشارك هذا الرمز مع أي شخص آخر.\nصالح لمدة 5 دقائق.`,
            en: `Your Day-End Boxes verification code is: ${otp}\nDo not share this code with anyone.\nValid for 5 minutes.`,
        };
        return messages[locale] || messages.en;
    }
    isValidLebanesePhone(phone) {
        const normalized = phone.replace(/\D/g, '');
        if (normalized.startsWith('961') && normalized.length === 11) {
            return true;
        }
        if (normalized.length === 8) {
            const firstTwo = normalized.substring(0, 2);
            const validPrefixes = ['70', '71', '76', '78', '79', '81', '03'];
            return validPrefixes.includes(firstTwo);
        }
        return false;
    }
    formatPhoneForDisplay(phone) {
        const normalized = phone.replace(/\D/g, '');
        if (normalized.startsWith('961') && normalized.length === 11) {
            const number = normalized.substring(3);
            return `+961 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`;
        }
        if (normalized.length === 8) {
            return `${normalized.substring(0, 2)} ${normalized.substring(2, 5)} ${normalized.substring(5)}`;
        }
        return phone;
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = OtpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map