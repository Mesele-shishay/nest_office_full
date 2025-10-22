import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { TokenVerificationService } from './token-verification.service';
import { of, throwError } from 'rxjs';

describe('TokenVerificationService', () => {
  let service: TokenVerificationService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Set default config mock before creating the module
    mockConfigService.get.mockReturnValue(
      'https://bank.tugza.tech/api/token/app-token-verify',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenVerificationService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenVerificationService>(TokenVerificationService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const token = 'valid-token';
      const appName = 'analytics_pro';
      const mockResponse = {
        data: {
          success: true,
          valid: true,
          active: true,
          message: 'App token verified and marked as used successfully',
          tokenData: {
            tokenId: 'token-123',
            userId: 'user@example.com',
            expiresAt: '2024-12-31T23:59:59.000Z',
            usedAt: '2024-01-15T10:30:00.000Z',
            type: 'app_token',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.verifyToken(token, appName);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        'https://bank.tugza.tech/api/token/app-token-verify',
        { token, appName },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid token response', async () => {
      const token = 'invalid-token';
      const appName = 'analytics_pro';
      const mockResponse = {
        data: {
          success: false,
          valid: false,
          active: false,
          message: 'Invalid token',
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.verifyToken(token, appName);

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw BadRequestException for missing token', async () => {
      const token = '';
      const appName = 'analytics_pro';

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for missing appName', async () => {
      const token = 'valid-token';
      const appName = '';

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle API error response', async () => {
      const token = 'invalid-token';
      const appName = 'analytics_pro';
      const errorResponse = {
        response: {
          data: {
            message: 'Token verification failed',
          },
        },
      };

      mockHttpService.post.mockReturnValue(throwError(() => errorResponse));

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle network timeout error', async () => {
      const token = 'valid-token';
      const appName = 'analytics_pro';
      const timeoutError = {
        code: 'ETIMEDOUT',
      };

      mockHttpService.post.mockReturnValue(throwError(() => timeoutError));

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle connection refused error', async () => {
      const token = 'valid-token';
      const appName = 'analytics_pro';
      const connectionError = {
        code: 'ECONNREFUSED',
      };

      mockHttpService.post.mockReturnValue(throwError(() => connectionError));

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle generic error', async () => {
      const token = 'valid-token';
      const appName = 'analytics_pro';
      const genericError = new Error('Something went wrong');

      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.verifyToken(token, appName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should use custom API URL from config', async () => {
      const customUrl = 'https://custom-api.com/verify';

      // Create a new service instance with custom config
      const customConfigService = {
        get: jest.fn().mockReturnValue(customUrl),
      };

      const customModule = await Test.createTestingModule({
        providers: [
          TokenVerificationService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: ConfigService,
            useValue: customConfigService,
          },
        ],
      }).compile();

      const customService = customModule.get<TokenVerificationService>(
        TokenVerificationService,
      );

      const token = 'valid-token';
      const appName = 'analytics_pro';
      const mockResponse = {
        data: { success: true, valid: true, active: true },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await customService.verifyToken(token, appName);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        customUrl,
        { token, appName },
        expect.any(Object),
      );

      await customModule.close();
    });
  });

  describe('mockVerifyToken', () => {
    it('should return valid for mock valid tokens', async () => {
      const validTokens = ['valid123', 'test456', 'demo789'];

      for (const token of validTokens) {
        const result = await service.mockVerifyToken(token, 'test_app');

        expect(result).toEqual({
          success: true,
          valid: true,
          active: true,
          message: 'App token verified and marked as used successfully (mock)',
          tokenData: {
            tokenId: 'mock-token-id',
            userId: 'mock@example.com',
            expiresAt: expect.any(String),
            usedAt: expect.any(String),
            type: 'app_token',
          },
        });
      }
    });

    it('should return invalid for mock invalid tokens', async () => {
      const invalidTokens = ['invalid', 'wrong', 'bad'];

      for (const token of invalidTokens) {
        const result = await service.mockVerifyToken(token, 'test_app');

        expect(result).toEqual({
          success: false,
          valid: false,
          active: false,
          message: 'Invalid token (mock)',
        });
      }
    });

    it('should generate future expiration date', async () => {
      const result = await service.mockVerifyToken('valid123', 'test_app');

      const expirationDate = new Date(result.tokenData!.expiresAt!);
      const now = new Date();
      const oneYearFromNow = new Date(
        now.getTime() + 365 * 24 * 60 * 60 * 1000,
      );

      expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
      expect(expirationDate.getTime()).toBeLessThanOrEqual(
        oneYearFromNow.getTime(),
      );
    });
  });
});
