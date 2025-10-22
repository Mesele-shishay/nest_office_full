import { Injectable } from '@nestjs/common';
import { SmsService } from '../services/sms.service';
import * as crypto from 'crypto';

@Injectable()
export class PhoneVerificationService {
  constructor(private readonly smsService: SmsService) {}

  /**
   * Generate a 6-digit verification code
   */
  generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send verification code via SMS
   */
  async sendVerificationCode(
    phone: string,
    verificationCode: string,
    appName: string = 'Office System',
  ) {
    return await this.smsService.sendVerificationCode(
      phone,
      verificationCode,
      appName,
    );
  }

  /**
   * Verify the provided code against the stored code
   */
  verifyCode(
    providedCode: string,
    storedCode: string,
    expiryDate: Date,
  ): boolean {
    if (!providedCode || !storedCode || !expiryDate) {
      return false;
    }

    // Check if code has expired
    if (new Date() > expiryDate) {
      return false;
    }

    // Check if codes match
    return providedCode === storedCode;
  }

  /**
   * Generate expiry date for verification code (10 minutes from now)
   */
  generateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    return expiryDate;
  }

  /**
   * Test SMS service connectivity
   */
  async testSmsService() {
    return await this.smsService.testSmsService();
  }
}
