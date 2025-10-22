import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { PhoneVerificationService } from '../common/services/phone-verification.service';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let mailService: MailService;
  let phoneVerificationService: PhoneVerificationService;

  const mockUser: User = {
    id: 'test-uuid',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.USER,
    permissions: [],
    bannedPermissions: [],
    isActive: true,
    resetToken: null,
    resetTokenExpiry: null,
    officeId: null,
    office: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    validatePassword: jest.fn(),
    hashPassword: jest.fn(),
    get fullName(): string {
      return `${this.firstName || ''} ${this.lastName || ''}`.trim();
    },
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockMailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockPhoneVerificationService = {
    generateVerificationCode: jest.fn(),
    generateExpiryDate: jest.fn(),
    sendVerificationCode: jest.fn(),
    verifyCode: jest.fn(),
    testSmsService: jest.fn(),
  };

  // Helper function to create user objects with validatePassword method
  const createMockUser = (overrides: Partial<User> = {}): User => {
    const user = {
      ...mockUser,
      ...overrides,
      validatePassword: jest.fn(),
      hashPassword: jest.fn(),
    };
    // Bind the methods after user is created
    user.validatePassword = user.validatePassword.bind(user);
    user.hashPassword = user.hashPassword.bind(user);
    // Preserve the fullName getter
    Object.defineProperty(user, 'fullName', {
      get: () => `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });
    return user as User;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: PhoneVerificationService,
          useValue: mockPhoneVerificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MailService>(MailService);
    phoneVerificationService = module.get<PhoneVerificationService>(
      PhoneVerificationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and tokens when credentials are valid', async () => {
      const mockTokens = {
        accessToken: 'access-token',
      };

      const testUser = createMockUser();
      const validatePasswordMock = jest.fn().mockResolvedValue(true);
      testUser.validatePassword = validatePasswordMock.bind(testUser);
      mockRepository.findOne.mockResolvedValue(testUser);
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockConfigService.get.mockReturnValue('false'); // REFRESH_TOKEN_ENABLED=false

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: testUser,
        tokens: mockTokens,
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(validatePasswordMock).toHaveBeenCalledWith(loginDto.password);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const testUser = createMockUser();
      testUser.validatePassword = jest
        .fn()
        .mockResolvedValue(false)
        .bind(testUser);
      mockRepository.findOne.mockResolvedValue(testUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      inactiveUser.validatePassword = jest
        .fn()
        .mockResolvedValue(true)
        .bind(inactiveUser);
      mockRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Account is deactivated',
      );
    });
  });

  // Refresh token tests removed - functionality disabled by default
  // To re-enable refresh tokens, uncomment refreshToken method in auth.service.ts
  // and add the corresponding tests here

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should send reset email when user exists', async () => {
      const mockUserWithReset = { ...mockUser };
      mockRepository.findOne.mockResolvedValue(mockUserWithReset);
      mockRepository.save.mockResolvedValue(mockUserWithReset);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await service.forgotPassword(forgotPasswordDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: forgotPasswordDto.email },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUserWithReset.email,
        expect.any(String),
        mockUserWithReset.firstName,
      );
    });

    it('should not throw error when user does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.forgotPassword(forgotPasswordDto),
      ).resolves.toBeUndefined();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should set reset token and expiry', async () => {
      const mockUserWithReset = { ...mockUser };
      mockRepository.findOne.mockResolvedValue(mockUserWithReset);
      mockRepository.save.mockResolvedValue(mockUserWithReset);
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await service.forgotPassword(forgotPasswordDto);

      const savedUser = mockRepository.save.mock.calls[0][0] as User;
      expect(savedUser.resetToken).toBeDefined();
      expect(savedUser.resetTokenExpiry).toBeDefined();
      expect(savedUser.resetTokenExpiry?.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle email service failure gracefully', async () => {
      const mockUserWithReset = { ...mockUser };
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockRepository.findOne.mockResolvedValue(mockUserWithReset);
      mockRepository.save.mockResolvedValue(mockUserWithReset);
      mockMailService.sendPasswordResetEmail.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      await service.forgotPassword(forgotPasswordDto);

      // Wait for promise to settle
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'valid-reset-token',
      password: 'newPassword123',
    };

    it('should reset password when token is valid', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      const mockUserWithToken = {
        ...mockUser,
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: futureDate,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithToken);
      mockRepository.save.mockResolvedValue(mockUserWithToken);

      await service.resetPassword(resetPasswordDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: resetPasswordDto.token },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: resetPasswordDto.password,
          resetToken: null,
          resetTokenExpiry: null,
        }),
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw BadRequestException when token is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      const mockUserWithExpiredToken = {
        ...mockUser,
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: pastDate,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithExpiredToken);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });

    it('should throw BadRequestException when resetTokenExpiry is null', async () => {
      const mockUserWithNullExpiry = {
        ...mockUser,
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithNullExpiry);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Invalid or expired reset token',
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate only access token when refresh tokens are disabled', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockConfigService.get.mockReturnValue('false'); // REFRESH_TOKEN_ENABLED=false

      const result = await service['generateTokens'](mockUser);

      expect(result).toEqual({
        accessToken: 'access-token',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(1);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        permissions: mockUser.permissions || [],
        bannedPermissions: mockUser.bannedPermissions || [],
      });
    });

    it('should generate access and refresh tokens when refresh tokens are enabled', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'REFRESH_TOKEN_ENABLED') return 'true';
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret';
        return undefined;
      });

      const result = await service['generateTokens'](mockUser);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        permissions: mockUser.permissions || [],
        bannedPermissions: mockUser.bannedPermissions || [],
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          permissions: mockUser.permissions || [],
          bannedPermissions: mockUser.bannedPermissions || [],
        },
        {
          secret: 'refresh-secret',
          expiresIn: '7d',
        },
      );
    });

    it('should use default refresh secret when config is not available', async () => {
      mockJwtService.signAsync.mockResolvedValueOnce('access-token');
      mockJwtService.signAsync.mockResolvedValueOnce('refresh-token');
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'REFRESH_TOKEN_ENABLED') return 'true';
        if (key === 'JWT_REFRESH_SECRET') return undefined;
        return undefined;
      });

      await service['generateTokens'](mockUser);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.any(Object),
        {
          secret: 'default-refresh-secret',
          expiresIn: '7d',
        },
      );
    });
  });

  describe('validateResetToken', () => {
    const testToken = 'valid-reset-token';

    it('should return true when token is valid and not expired', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      const mockUserWithValidToken = {
        ...mockUser,
        resetToken: testToken,
        resetTokenExpiry: futureDate,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithValidToken);

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });
    });

    it('should return false when token is empty or null', async () => {
      const result = await service.validateResetToken('');

      expect(result).toBe(false);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return false when token is null', async () => {
      const result = await service.validateResetToken(
        null as unknown as string,
      );

      expect(result).toBe(false);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return false when token is undefined', async () => {
      const result = await service.validateResetToken(
        undefined as unknown as string,
      );

      expect(result).toBe(false);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return false when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });
    });

    it('should return false when token is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      const mockUserWithExpiredToken = {
        ...mockUser,
        resetToken: testToken,
        resetTokenExpiry: pastDate,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithExpiredToken);

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });
    });

    it('should return false when resetTokenExpiry is null', async () => {
      const mockUserWithNullExpiry = {
        ...mockUser,
        resetToken: testToken,
        resetTokenExpiry: null,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithNullExpiry);

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });
    });

    it('should return false when resetTokenExpiry is undefined', async () => {
      const mockUserWithUndefinedExpiry = {
        ...mockUser,
        resetToken: testToken,
        resetTokenExpiry: undefined,
      };

      mockRepository.findOne.mockResolvedValue(mockUserWithUndefinedExpiry);

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock console.error to suppress error logging during test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      mockRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await service.validateResetToken(testToken);

      expect(result).toBe(false);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { resetToken: testToken },
      });

      // Verify that console.error was called with the expected error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error validating reset token:',
        expect.any(Error),
      );

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('changePassword', () => {
    const userId = 'test-uuid';
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'currentPassword123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    };

    it('should change password when current password is valid', async () => {
      const mockUserWithPassword = createMockUser();
      const validatePasswordSpy = jest
        .spyOn(mockUserWithPassword, 'validatePassword')
        .mockResolvedValue(true);
      mockRepository.findOne.mockResolvedValue(mockUserWithPassword);
      mockRepository.save.mockResolvedValue(mockUserWithPassword);

      await service.changePassword(userId, changePasswordDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(validatePasswordSpy).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
      );
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: changePasswordDto.newPassword,
          resetToken: null,
          resetTokenExpiry: null,
        }),
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const inactiveUser = createMockUser({ isActive: false });
      mockRepository.findOne.mockResolvedValue(inactiveUser);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('Account is deactivated');
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      const mockUserWithPassword = createMockUser();
      mockUserWithPassword.validatePassword = jest
        .fn()
        .mockResolvedValue(false)
        .bind(mockUserWithPassword);
      mockRepository.findOne.mockResolvedValue(mockUserWithPassword);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should throw BadRequestException when new password is same as current password', async () => {
      const samePasswordDto: ChangePasswordDto = {
        currentPassword: 'samePassword123',
        newPassword: 'samePassword123', // Same as current password
        confirmPassword: 'samePassword123',
      };
      const mockUserWithPassword = createMockUser();
      mockUserWithPassword.validatePassword = jest
        .fn()
        .mockResolvedValue(true)
        .bind(mockUserWithPassword);
      mockRepository.findOne.mockResolvedValue(mockUserWithPassword);

      await expect(
        service.changePassword(userId, samePasswordDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.changePassword(userId, samePasswordDto),
      ).rejects.toThrow('New password must be different from current password');
    });

    it('should clear reset tokens when password is changed', async () => {
      const mockUserWithResetTokens = createMockUser({
        resetToken: 'some-reset-token',
        resetTokenExpiry: new Date(),
      });
      mockUserWithResetTokens.validatePassword = jest
        .fn()
        .mockResolvedValue(true);
      mockRepository.findOne.mockResolvedValue(mockUserWithResetTokens);
      mockRepository.save.mockResolvedValue(mockUserWithResetTokens);

      await service.changePassword(userId, changePasswordDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: changePasswordDto.newPassword,
          resetToken: null,
          resetTokenExpiry: null,
        }),
      );
    });
  });
});
