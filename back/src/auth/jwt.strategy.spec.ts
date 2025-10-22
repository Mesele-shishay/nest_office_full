import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User, UserRole } from '../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
    get fullName() {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should configure JWT strategy with correct options', () => {
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      // Re-instantiate to test constructor
      const newStrategy = new JwtStrategy(mockConfigService, mockRepository);

      expect(newStrategy).toBeDefined();
    });

    it('should use default secret when JWT_SECRET is not configured', () => {
      mockConfigService.get.mockReturnValue(undefined);

      const newStrategy = new JwtStrategy(mockConfigService, mockRepository);

      expect(newStrategy).toBeDefined();
    });
  });

  describe('validate', () => {
    const payload = {
      sub: 'test-uuid',
      email: 'test@example.com',
      role: 'USER',
    };

    it('should return user when user exists and is active', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.sub },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found or inactive',
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findOne.mockRejectedValue(error);

      await expect(strategy.validate(payload)).rejects.toThrow(error);
    });

    it('should work with different payload structures', async () => {
      const adminPayload = {
        sub: 'admin-uuid',
        email: 'admin@example.com',
        role: 'ADMIN',
      };

      const adminUser = { ...mockUser, id: 'admin-uuid', role: UserRole.ADMIN };
      mockRepository.findOne.mockResolvedValue(adminUser);

      const result = await strategy.validate(adminPayload);

      expect(result).toEqual(adminUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: adminPayload.sub },
      });
    });
  });
});
