import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface TokenVerificationRequest {
  token: string;
  appName: string;
  amount?: string;
}

export interface TokenVerificationResponse {
  success: boolean;
  valid: boolean;
  active: boolean;
  message?: string;
  tokenData?: {
    tokenId: string;
    userId?: string;
    expiresAt?: string;
    usedAt?: string;
    type: string;
  };
}

@Injectable()
export class TokenVerificationService {
  private readonly logger = new Logger(TokenVerificationService.name);
  private readonly verificationApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.verificationApiUrl = this.configService.get<string>(
      'TOKEN_VERIFICATION_API_URL',
      'https://bank.tugza.tech/api/token/app-token-verify',
    );
  }

  async verifyToken(
    token: string,
    appName: string,
    amount?: string,
  ): Promise<TokenVerificationResponse> {
    if (!token || !appName) {
      throw new BadRequestException('Token and appName are required');
    }

    try {
      const requestPayload: TokenVerificationRequest = {
        token,
        appName,
        ...(amount && { amount }),
      };

      this.logger.log(`Verifying token for app: ${appName}`);

      const response = await firstValueFrom(
        this.httpService.post<TokenVerificationResponse>(
          this.verificationApiUrl,
          requestPayload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
          },
        ),
      );

      this.logger.log(
        `Token verification result for ${appName}: success=${response.data.success}, valid=${response.data.valid}, active=${response.data.active}`,
      );

      return response.data;
    } catch (error) {
      // this.logger.error(
      //   `Token verification failed for ${appName}:`,
      //   error instanceof Error ? error.message : JSON.stringify(error),
      // );

      // If it's a network error or API error, we should fail gracefully
      if (error && typeof error === 'object' && 'response' in error) {
        // API returned an error response
        const errorMessage =
          (error as any).response?.data?.message || 'Token verification failed';
        throw new BadRequestException(errorMessage);
      } else if (
        (error as any).code === 'ECONNREFUSED' ||
        (error as any).code === 'ETIMEDOUT'
      ) {
        // Network error
        throw new BadRequestException(
          'Token verification service is currently unavailable. Please try again later.',
        );
      } else {
        // Other errors
        throw new BadRequestException('Token verification failed');
      }
    }
  }

  /**
   * Mock verification for development/testing purposes
   * This can be enabled via environment variable
   */
  async mockVerifyToken(
    token: string,
    appName: string,
    amount?: string,
  ): Promise<TokenVerificationResponse> {
    this.logger.warn('Using mock token verification - not for production!');

    // Simple mock logic - in real implementation, you might want more sophisticated mocking
    const mockValidTokens = ['valid123', 'test456', 'demo789'];

    if (mockValidTokens.includes(token)) {
      return {
        success: true,
        valid: true,
        active: true,
        message: 'App token verified and marked as used successfully (mock)',
        tokenData: {
          tokenId: 'mock-token-id',
          userId: 'mock@example.com',
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 1 year from now
          usedAt: new Date().toISOString(),
          type: 'app_token',
        },
      };
    }

    return {
      success: false,
      valid: false,
      active: false,
      message: 'Invalid token (mock)',
    };
  }
}
