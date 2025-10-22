import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from './jwt.config';

describe('JwtConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getJwtConfig', () => {
    it('should return JWT configuration with custom secret', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            JWT_SECRET: 'custom-jwt-secret',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getJwtConfig(configService);

      expect(result).toEqual({
        secret: 'custom-jwt-secret',
        signOptions: {
          expiresIn: '7d',
        },
      });
    });

    it('should return JWT configuration with default secret', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: string) => {
          const config: Record<string, string> = {};
          return config[key] || defaultValue;
        },
      );

      const result = getJwtConfig(configService);

      expect(result).toEqual({
        secret: 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      });
    });

    it('should return JWT configuration with undefined secret', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: string) => {
          const config: Record<string, string | undefined> = {
            JWT_SECRET: undefined,
          };
          return config[key] || defaultValue;
        },
      );

      const result = getJwtConfig(configService);

      expect(result).toEqual({
        secret: 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      });
    });

    it('should return JWT configuration with null secret', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: string) => {
          const config: Record<string, string | null> = {
            JWT_SECRET: null,
          };
          return config[key] || defaultValue;
        },
      );

      const result = getJwtConfig(configService);

      expect(result).toEqual({
        secret: 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      });
    });

    it('should return JWT configuration with empty string secret', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: string) => {
          const config: Record<string, string> = {
            JWT_SECRET: '',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getJwtConfig(configService);

      expect(result).toEqual({
        secret: 'default-secret',
        signOptions: {
          expiresIn: '7d',
        },
      });
    });
  });

  // Refresh token configuration tests removed - functionality disabled by default
  // To re-enable refresh tokens, uncomment getJwtRefreshConfig function in jwt.config.ts
  // and add the corresponding tests here
});
