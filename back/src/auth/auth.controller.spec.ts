import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    validateResetToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return user and tokens on successful login', async () => {
      const mockResponse = {
        user: mockUser,
        tokens: {
          accessToken: 'access-token',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should call authService.login with correct parameters', async () => {
      const mockResponse = {
        user: mockUser,
        tokens: { accessToken: 'token' },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  // Refresh endpoint tests removed - functionality disabled by default
  // To re-enable refresh tokens, uncomment refresh endpoint in auth.controller.ts
  // and add the corresponding tests here

  describe('forgotPassword', () => {
    const forgotPasswordDto: ForgotPasswordDto = {
      email: 'test@example.com',
    };

    it('should return success message after sending reset email', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message: 'If the email exists, a reset link has been sent',
      });
      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
      expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should call authService.forgotPassword with correct parameters', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      await controller.forgotPassword(forgotPasswordDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      token: 'reset-token',
      password: 'newPassword123',
    };

    it('should return tokens after password reset', async () => {
      const tokens = { accessToken: 'access-token', refreshToken: undefined };
      mockAuthService.resetPassword.mockResolvedValue(tokens);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(tokens);
      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
      expect(authService.resetPassword).toHaveBeenCalledTimes(1);
    });

    it('should call authService.resetPassword with correct parameters', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      await controller.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  describe('validateResetToken', () => {
    const testToken = 'valid-reset-token';

    it('should return valid response when token is valid', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(true);

      const result = await controller.validateResetToken(testToken);

      expect(result).toEqual({
        valid: true,
        message: 'Token is valid',
      });
      expect(authService.validateResetToken).toHaveBeenCalledWith(testToken);
      expect(authService.validateResetToken).toHaveBeenCalledTimes(1);
    });

    it('should return invalid response when token is invalid', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(false);

      const result = await controller.validateResetToken(testToken);

      expect(result).toEqual({
        valid: false,
        message: 'Invalid or expired token',
      });
      expect(authService.validateResetToken).toHaveBeenCalledWith(testToken);
      expect(authService.validateResetToken).toHaveBeenCalledTimes(1);
    });

    it('should handle empty token', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(false);

      const result = await controller.validateResetToken('');

      expect(result).toEqual({
        valid: false,
        message: 'Invalid or expired token',
      });
      expect(authService.validateResetToken).toHaveBeenCalledWith('');
    });

    it('should handle null token', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(false);

      const result = await controller.validateResetToken(null as any);

      expect(result).toEqual({
        valid: false,
        message: 'Invalid or expired token',
      });
      expect(authService.validateResetToken).toHaveBeenCalledWith(null);
    });

    it('should handle undefined token', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(false);

      const result = await controller.validateResetToken(undefined as any);

      expect(result).toEqual({
        valid: false,
        message: 'Invalid or expired token',
      });
      expect(authService.validateResetToken).toHaveBeenCalledWith(undefined);
    });

    it('should call authService.validateResetToken with correct parameters', async () => {
      mockAuthService.validateResetToken.mockResolvedValue(true);

      await controller.validateResetToken(testToken);

      expect(authService.validateResetToken).toHaveBeenCalledWith(testToken);
      expect(authService.validateResetToken).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', async () => {
      mockAuthService.validateResetToken.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.validateResetToken(testToken)).rejects.toThrow(
        'Service error',
      );
      expect(authService.validateResetToken).toHaveBeenCalledWith(testToken);
    });
  });

  describe('getProfile', () => {
    const mockRequest = {
      user: mockUser,
    };

    it('should return user profile from request', () => {
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should return the user object from request', () => {
      const result = controller.getProfile(mockRequest);

      expect(result).toBe(mockRequest.user);
    });
  });
});
