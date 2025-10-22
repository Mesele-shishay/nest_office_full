import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../users/entities/user.entity';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  RegisterDto,
  SendPhoneVerificationDto,
  VerifyPhoneDto,
} from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import { PhoneVerificationService } from '../common/services/phone-verification.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private phoneVerificationService: PhoneVerificationService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: any }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await user.validatePassword(loginDto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  // Refresh token functionality removed - using JWT only
  // To re-enable refresh tokens, uncomment this method and add REFRESH_TOKEN_ENABLED=true to env
  // async refreshToken(userId: string): Promise<{ tokens: any }> {
  //   const user = await this.userRepository.findOne({
  //     where: { id: userId },
  //   });

  //   if (!user || !user.isActive) {
  //     throw new UnauthorizedException('User not found or inactive');
  //   }

  //   const tokens = await this.generateTokens(user);

  //   return { tokens };
  // }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    await this.userRepository.save(user);

    // Send password reset email (non-blocking)
    this.mailService
      .sendPasswordResetEmail(user.email, resetToken, user.firstName)
      .catch((error) => {
        console.error('Failed to send password reset email:', error);
      });
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const user = await this.userRepository.findOne({
      where: { resetToken: resetPasswordDto.token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = resetPasswordDto.password;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);

    // After successful reset, issue fresh tokens so the user is authenticated immediately
    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async validateResetToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      const user = await this.userRepository.findOne({
        where: { resetToken: token },
      });

      if (
        !user ||
        !user.resetTokenExpiry ||
        user.resetTokenExpiry < new Date()
      ) {
        return false;
      }

      return true;
    } catch (error) {
      // Log the error for debugging but don't expose it to the client
      console.error('Error validating reset token:', error);
      return false;
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword as string,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different from current password
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Update password
    user.password = changePasswordDto.newPassword;

    // Clear any existing reset tokens when password is changed
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      bannedPermissions: user.bannedPermissions || [],
    };

    const accessToken = await this.jwtService.signAsync(payload);

    // Refresh token functionality disabled by default
    // To enable: set REFRESH_TOKEN_ENABLED=true in environment variables
    const refreshTokenEnabled =
      this.configService.get<string>('REFRESH_TOKEN_ENABLED') === 'true';

    if (refreshTokenEnabled) {
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'default-refresh-secret',
        expiresIn: '7d',
      });
      return { accessToken, refreshToken };
    }

    return { accessToken };
  }

  async register(
    registerDto: RegisterDto,
    registeredBy?: User,
  ): Promise<{ user: User; message: string }> {
    // Check if user with email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException(
        `User with email ${registerDto.email} already exists`,
      );
    }

    // Check if user with phone already exists
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone: registerDto.phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException(
        `User with phone number ${registerDto.phone} already exists`,
      );
    }

    // Determine if this is a manager registration
    const isManagerRegistration =
      registeredBy &&
      (registeredBy.role === UserRole.MANAGER ||
        registeredBy.role === UserRole.ADMIN);

    // Validate required fields based on registration type
    if (!isManagerRegistration && !registerDto.nationalIdPhoto) {
      throw new BadRequestException(
        'National ID photo is required for public registration',
      );
    }

    if (!isManagerRegistration && !registerDto.password) {
      throw new BadRequestException(
        'Password is required for public registration',
      );
    }

    // Use default password for manager registration if not provided
    const password =
      registerDto.password ||
      this.configService.get<string>('DEFAULT_USER_PASSWORD') ||
      'DefaultPass123!';

    // Determine user role
    const userRole = registerDto.role || UserRole.USER;

    // Create user based on registration type
    const user = this.userRepository.create({
      email: registerDto.email,
      password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phone,
      nationalIdPhoto: registerDto.nationalIdPhoto,
      role: userRole,
      isActive: isManagerRegistration ? true : false, // Manager registrations are active immediately
      phoneVerified: isManagerRegistration ? true : false, // Manager registrations skip phone verification
    });

    const savedUser = await this.userRepository.save(user);

    if (isManagerRegistration) {
      return {
        user: savedUser,
        message:
          'User registered successfully by manager. User is active and ready to use.',
      };
    } else {
      // For public registration, automatically send phone verification code
      try {
        const verificationCode =
          this.phoneVerificationService.generateVerificationCode();
        const expiryDate = this.phoneVerificationService.generateExpiryDate();

        // Update user with verification code
        savedUser.phoneVerificationCode = verificationCode;
        savedUser.phoneVerificationExpiry = expiryDate;
        await this.userRepository.save(savedUser);

        // Send SMS verification code
        await this.phoneVerificationService.sendVerificationCode(
          registerDto.phone,
          verificationCode,
        );

        return {
          user: savedUser,
          message:
            'Registration successful. A verification code has been sent to your phone. Please verify your phone number and wait for admin approval.',
        };
      } catch (smsError) {
        // If SMS fails, still allow registration but user needs to request verification manually
        console.error('Failed to send initial verification SMS:', smsError);
        return {
          user: savedUser,
          message:
            'Registration successful. Please request a phone verification code and wait for admin approval.',
        };
      }
    }
  }

  async sendPhoneVerificationCode(
    sendPhoneVerificationDto: SendPhoneVerificationDto,
  ): Promise<{ message: string }> {
    const { phone } = sendPhoneVerificationDto;

    // Check if user with this phone exists
    const user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    if (user.phoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    // Check if there's already a valid verification code (rate limiting)
    if (user.phoneVerificationCode && user.phoneVerificationExpiry) {
      const now = new Date();
      const timeDiff = user.phoneVerificationExpiry.getTime() - now.getTime();
      const minutesLeft = Math.ceil(timeDiff / (1000 * 60));

      if (minutesLeft > 5) {
        throw new BadRequestException(
          `Please wait ${minutesLeft} minutes before requesting a new verification code`,
        );
      }
    }

    // Generate verification code
    const verificationCode =
      this.phoneVerificationService.generateVerificationCode();
    const expiryDate = this.phoneVerificationService.generateExpiryDate();

    // Update user with verification code
    user.phoneVerificationCode = verificationCode;
    user.phoneVerificationExpiry = expiryDate;
    await this.userRepository.save(user);

    // Send SMS
    await this.phoneVerificationService.sendVerificationCode(
      phone,
      verificationCode,
    );

    return {
      message: 'Verification code sent successfully',
    };
  }

  async verifyPhone(
    verifyPhoneDto: VerifyPhoneDto,
  ): Promise<{ message: string }> {
    const { phone, code } = verifyPhoneDto;

    // Find user by phone
    const user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    if (user.phoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    if (!user.phoneVerificationCode || !user.phoneVerificationExpiry) {
      throw new BadRequestException(
        'No verification code found. Please request a new code.',
      );
    }

    // Verify the code
    const isValid = this.phoneVerificationService.verifyCode(
      code,
      user.phoneVerificationCode,
      user.phoneVerificationExpiry,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Mark phone as verified and clear verification data
    user.phoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpiry = null;
    await this.userRepository.save(user);

    return {
      message: 'Phone number verified successfully',
    };
  }

  async approveUser(
    userId: string,
    approvedBy: string,
  ): Promise<{ user: User; message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isActive) {
      throw new BadRequestException('User is already active');
    }

    if (!user.phoneVerified) {
      throw new BadRequestException(
        'User must verify their phone number before approval',
      );
    }

    // Activate the user
    user.isActive = true;
    await this.userRepository.save(user);

    // Send welcome email (non-blocking)
    this.mailService
      .sendWelcomeEmail(user.email, user.firstName)
      .catch((error) => {
        console.error('Failed to send welcome email:', error);
      });

    return {
      user,
      message: 'User approved successfully',
    };
  }

  async getPendingUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        isActive: false,
        phoneVerified: true,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async testSmsService(): Promise<{ success: boolean; message: string }> {
    return await this.phoneVerificationService.testSmsService();
  }
}
