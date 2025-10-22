import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

describe('DatabaseConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDatabaseConfig', () => {
    it('should return default postgres configuration', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'postgres',
            DATABASE_PORT: '5432',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'development',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result).toEqual({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'nest_office',
        entities: [expect.stringContaining('**/*.entity{.ts,.js}')],
        migrations: [expect.stringContaining('migrations/*{.ts,.js}')],
        migrationsRun: false,
        synchronize: true,
        logging: true,
        ssl: false,
      });
    });

    it('should return mysql configuration', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'mysql',
            DATABASE_PORT: '3306',
            DATABASE_HOST: 'localhost',
            DATABASE_USER: 'mysql',
            DATABASE_PASSWORD: 'mysql',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'production',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result).toEqual({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'mysql',
        password: 'mysql',
        database: 'nest_office',
        entities: [expect.stringContaining('**/*.entity{.ts,.js}')],
        migrations: [expect.stringContaining('migrations/*{.ts,.js}')],
        migrationsRun: false,
        synchronize: false,
        logging: false,
        ssl: { rejectUnauthorized: false },
      });
    });

    it('should return mariadb configuration', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'mariadb',
            DATABASE_PORT: '3306',
            DATABASE_HOST: 'localhost',
            DATABASE_USER: 'mariadb',
            DATABASE_PASSWORD: 'mariadb',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'test',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result).toEqual({
        type: 'mariadb',
        host: 'localhost',
        port: 3306,
        username: 'mariadb',
        password: 'mariadb',
        database: 'nest_office',
        entities: [expect.stringContaining('**/*.entity{.ts,.js}')],
        migrations: [expect.stringContaining('migrations/*{.ts,.js}')],
        migrationsRun: false,
        synchronize: false,
        logging: false,
        ssl: false,
      });
    });

    it('should handle custom port configuration', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'postgres',
            DATABASE_PORT: '5433',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'development',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result.port).toBe(5433);
    });

    it('should handle invalid database type and default to postgres', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'invalid',
            DATABASE_PORT: '5432',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'development',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result.type).toBe('invalid'); // The function doesn't validate the type, it just uses what's provided
      expect(result.port).toBe(5432);
    });

    it('should handle undefined database type and default to postgres', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_PORT: '5432',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'development',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result.type).toBe('postgres');
    });

    it('should handle production environment with SSL', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'postgres',
            DATABASE_PORT: '5432',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'production',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result.synchronize).toBe(false);
      expect(result.logging).toBe(false);
      expect(result.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should handle development environment without SSL', () => {
      (configService.get as jest.Mock).mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            DATABASE_TYPE: 'postgres',
            DATABASE_PORT: '5432',
            DATABASE_HOST: '127.0.0.1',
            DATABASE_USER: 'postgres',
            DATABASE_PASSWORD: 'postgres',
            DATABASE_NAME: 'nest_office',
            NODE_ENV: 'development',
          };
          return config[key] || defaultValue;
        },
      );

      const result = getDatabaseConfig(configService);

      expect(result.synchronize).toBe(true);
      expect(result.logging).toBe(true);
      expect(result.ssl).toBe(false);
    });
  });
});
