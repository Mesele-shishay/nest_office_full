import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ExternalTokenValidationResponse {
  success: boolean;
  valid: boolean;
  message?: string;
  data?: {
    tokenId?: string;
    userId?: string;
    expiresAt?: string;
    permissions?: string[];
  };
}

@Injectable()
export class ExternalTokenValidationService {
  private readonly logger = new Logger(ExternalTokenValidationService.name);
  private readonly externalApiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.externalApiUrl =
      this.configService.get<string>('EXTERNAL_API_URL') || '';
    this.apiKey = this.configService.get<string>('EXTERNAL_API_KEY') || '';
  }

  async validateToken(
    tokenName: string,
  ): Promise<ExternalTokenValidationResponse> {
    if (!this.externalApiUrl || !this.apiKey) {
      this.logger.warn('External API configuration missing');
      throw new BadRequestException(
        'External token validation service not configured',
      );
    }

    try {
      this.logger.log(`Validating token: ${tokenName}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.externalApiUrl}/validate-token`,
          { tokenName },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
          },
        ),
      );

      const result: ExternalTokenValidationResponse = {
        success: true,
        valid: response.data.valid || false,
        message: response.data.message,
        data: response.data.data,
      };

      this.logger.log(
        `Token validation result: ${result.valid ? 'VALID' : 'INVALID'}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Token validation failed for ${tokenName}:`,
        error.message,
      );

      if (error.response?.status === 404) {
        return {
          success: false,
          valid: false,
          message: 'Token not found in external system',
        };
      }

      if (error.response?.status === 401) {
        return {
          success: false,
          valid: false,
          message: 'Invalid API credentials',
        };
      }

      return {
        success: false,
        valid: false,
        message: 'External token validation service unavailable',
      };
    }
  }

  async revokeToken(tokenName: string): Promise<boolean> {
    if (!this.externalApiUrl || !this.apiKey) {
      this.logger.warn('External API configuration missing');
      return false;
    }

    try {
      this.logger.log(`Revoking token: ${tokenName}`);

      await firstValueFrom(
        this.httpService.post(
          `${this.externalApiUrl}/revoke-token`,
          { tokenName },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(`Token revoked successfully: ${tokenName}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Token revocation failed for ${tokenName}:`,
        error.message,
      );
      return false;
    }
  }
}
