import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SmsRequest {
  to: string;
  message: string;
  senderName?: string;
}

export interface SmsResponse {
  acknowledge: string;
  response: string;
  messageId?: string;
}

export interface SmsServiceConfig {
  apiUrl: string;
  apiKey: string;
  senderName: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly config: SmsServiceConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.config = {
      apiUrl: this.configService.get<string>(
        'AFRO_MESSAGES_API_URL',
        'https://api.afromessage.com/api/send',
      ),
      apiKey: this.configService.get<string>('AFRO_MESSAGES_API_KEY') || '',
      senderName:
        this.configService.get<string>('AFRO_MESSAGES_SENDER_NAME') || '',
    };

    if (!this.config.apiKey) {
      this.logger.warn(
        'AFRO_MESSAGES_API_KEY not configured. SMS service will use mock mode.',
      );
    }

    if (!this.config.senderName) {
      this.logger.warn(
        'AFRO_MESSAGES_SENDER_NAME not configured. Using default sender name.',
      );
    }
  }

  /**
   * Send SMS message using Afro Messages API
   */
  async sendSms(
    to: string,
    message: string,
    senderName?: string,
  ): Promise<SmsResponse> {
    if (!to || !message) {
      throw new BadRequestException('Phone number and message are required');
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      throw new BadRequestException('Invalid phone number format');
    }

    try {
      // If API key is not configured, use mock mode for development
      if (!this.config.apiKey) {
        this.logger.log(`[MOCK MODE] Would send SMS to ${to}: ${message}`);
        return {
          acknowledge: 'success',
          response: 'Message sent successfully (mock mode)',
          messageId: `mock-${Date.now()}`,
        };
      }

      // Prepare Afro Messages API request
      const requestPayload: SmsRequest = {
        to: to.replace(/\s/g, ''), // Remove spaces
        message,
        senderName: senderName || this.config.senderName || 'SMS',
      };

      this.logger.log(`Sending SMS to: ${to}`);

      // Make request to Afro Messages API
      const response = await firstValueFrom(
        this.httpService.post<SmsResponse>(this.config.apiUrl, requestPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          timeout: 15000, // 15 seconds timeout
        }),
      );

      this.logger.log(
        `SMS sent successfully to ${to}. Response: ${response.data.response}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${to}:`,
        error instanceof Error ? error.message : JSON.stringify(error),
      );

      // If it's a network error or API error, we should fail gracefully
      if (error && typeof error === 'object' && 'response' in error) {
        // API returned an error response
        const errorMessage =
          (error as any).response?.data?.response ||
          (error as any).response?.data?.message ||
          'Failed to send SMS';
        throw new BadRequestException(errorMessage);
      } else if (
        (error as any).code === 'ECONNREFUSED' ||
        (error as any).code === 'ETIMEDOUT'
      ) {
        // Network error
        throw new BadRequestException(
          'SMS service is currently unavailable. Please try again later.',
        );
      } else {
        // Other errors
        throw new BadRequestException('Failed to send SMS');
      }
    }
  }

  /**
   * Send verification code SMS
   */
  async sendVerificationCode(
    phone: string,
    code: string,
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const message = `Your verification code is: ${code}. This code will expire in 10 minutes. - ${appName}`;
    return this.sendSms(phone, message);
  }

  /**
   * Send notification SMS
   */
  async sendNotification(
    phone: string,
    title: string,
    message: string,
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const fullMessage = `${title}\n\n${message}\n\n- ${appName}`;
    return this.sendSms(phone, fullMessage);
  }

  /**
   * Send reminder SMS
   */
  async sendReminder(
    phone: string,
    reminderText: string,
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const message = `Reminder: ${reminderText}\n\n- ${appName}`;
    return this.sendSms(phone, message);
  }

  /**
   * Test SMS service connectivity
   */
  async testSmsService(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      return {
        success: false,
        message: 'SMS service not configured - running in mock mode',
      };
    }

    try {
      const testMessage = 'Test message from NestJS Office System';
      const testPhone = '+1234567890'; // Dummy phone for testing

      const response = await this.sendSms(testPhone, testMessage, 'Test');

      if (response.acknowledge === 'success') {
        return {
          success: true,
          message: 'SMS service is working correctly',
        };
      } else {
        return {
          success: false,
          message: `SMS service error: ${response.response}`,
        };
      }
    } catch (error) {
      this.logger.error('SMS service test failed:', error);
      return {
        success: false,
        message: `SMS service test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(
    phone: string,
    appointmentDetails: {
      date: string;
      time: string;
      location?: string;
      description?: string;
    },
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const message = `Appointment Reminder\n\nDate: ${appointmentDetails.date}\nTime: ${appointmentDetails.time}${
      appointmentDetails.location
        ? `\nLocation: ${appointmentDetails.location}`
        : ''
    }${appointmentDetails.description ? `\n\nDetails: ${appointmentDetails.description}` : ''}\n\n- ${appName}`;
    return this.sendSms(phone, message);
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetCode(
    phone: string,
    resetCode: string,
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const message = `Password Reset Code: ${resetCode}\n\nThis code will expire in 15 minutes.\n\n- ${appName}`;
    return this.sendSms(phone, message);
  }

  /**
   * Send welcome SMS
   */
  async sendWelcomeSms(
    phone: string,
    userName: string,
    appName: string = 'Office System',
  ): Promise<SmsResponse> {
    const message = `Welcome ${userName}!\n\nYour account has been successfully created and activated.\n\n- ${appName}`;
    return this.sendSms(phone, message);
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSms(
    recipients: string[],
    message: string,
    senderName?: string,
  ): Promise<{
    success: SmsResponse[];
    failed: { phone: string; error: string }[];
  }> {
    const success: SmsResponse[] = [];
    const failed: { phone: string; error: string }[] = [];

    for (const phone of recipients) {
      try {
        const response = await this.sendSms(phone, message, senderName);
        success.push(response);
      } catch (error) {
        failed.push({
          phone,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success, failed };
  }

  /**
   * Get SMS service configuration status
   */
  getServiceStatus(): {
    configured: boolean;
    apiUrl: string;
    hasApiKey: boolean;
    hasSenderName: boolean;
  } {
    return {
      configured: !!this.config.apiKey,
      apiUrl: this.config.apiUrl,
      hasApiKey: !!this.config.apiKey,
      hasSenderName: !!this.config.senderName,
    };
  }
}
