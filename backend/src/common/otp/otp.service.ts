import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private configService: ConfigService) {}

  async sendOtp(phone: string, otp: string, locale: string = 'ar'): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Failed to send OTP via ${provider}:`, error);
      throw error;
    }
  }

  private async sendTwilioSms(phone: string, otp: string, locale: string): Promise<void> {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const message = this.getOtpMessage(otp, locale);

    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          From: fromNumber,
          To: phone,
          Body: message,
        }),
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.log(`OTP sent via Twilio to ${phone}: ${response.data.sid}`);
    } catch (error) {
      this.logger.error('Twilio API error:', error.response?.data || error.message);
      throw new Error('Failed to send SMS via Twilio');
    }
  }

  private async sendMockSms(phone: string, otp: string, locale: string): Promise<void> {
    // Mock SMS service for development/testing
    const message = this.getOtpMessage(otp, locale);
    
    this.logger.log(`[MOCK SMS] To: ${phone}`);
    this.logger.log(`[MOCK SMS] Message: ${message}`);
    this.logger.log(`[MOCK SMS] OTP: ${otp}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private getOtpMessage(otp: string, locale: string): string {
    const messages = {
      ar: `رمز التحقق الخاص بك في تطبيق صناديق نهاية اليوم هو: ${otp}\nلا تشارك هذا الرمز مع أي شخص آخر.\nصالح لمدة 5 دقائق.`,
      en: `Your Day-End Boxes verification code is: ${otp}\nDo not share this code with anyone.\nValid for 5 minutes.`,
    };

    return messages[locale] || messages.en;
  }

  // Helper method to validate Lebanese phone numbers
  isValidLebanesePhone(phone: string): boolean {
    const normalized = phone.replace(/\D/g, '');
    
    // Check if it's a valid Lebanese number
    if (normalized.startsWith('961') && normalized.length === 11) {
      return true;
    }
    
    // Check if it's an 8-digit local number
    if (normalized.length === 8) {
      const firstTwo = normalized.substring(0, 2);
      // Lebanese mobile prefixes: 70, 71, 76, 78, 79, 81, 03
      const validPrefixes = ['70', '71', '76', '78', '79', '81', '03'];
      return validPrefixes.includes(firstTwo);
    }
    
    return false;
  }

  // Format phone number for display
  formatPhoneForDisplay(phone: string): string {
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
}
