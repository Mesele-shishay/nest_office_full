import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from '../mail/mail.service';
import { PhoneVerificationService } from '../common/services/phone-verification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        JwtStrategy,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
            sendWelcomeEmail: jest.fn(),
          },
        },
        {
          provide: PhoneVerificationService,
          useValue: {
            generateVerificationCode: jest.fn(),
            generateExpiryDate: jest.fn(),
            sendVerificationCode: jest.fn(),
            verifyCode: jest.fn(),
            testSmsService: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue?: string) => {
                const config: Record<string, string> = {
                  JWT_SECRET: 'test-secret',
                  JWT_REFRESH_SECRET: 'test-refresh-secret',
                  FRONTEND_URL: 'http://localhost:3000',
                };
                return config[key] || defaultValue;
              }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
    expect(authController).toBeInstanceOf(AuthController);
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should provide JwtStrategy', () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
  });

  it('should export AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should provide User repository', () => {
    const userRepository = module.get<Record<string, jest.Mock>>(
      getRepositoryToken(User),
    );
    expect(userRepository).toBeDefined();
  });

  it('should provide ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    expect(configService).toBeDefined(); // Mock object, not instance
  });
});
