import {
  IsEmail,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  IsOptional,
  IsPhoneNumber,
  IsUrl,
  Matches,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../roles/role.enum';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@tugza.tech',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Admin@123456',
  })
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address to send password reset link',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePass123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}

@ValidatorConstraint({ name: 'passwordMatch', async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Passwords do not match';
  }
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPass123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePass123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (must match new password)',
    example: 'NewSecurePass123!',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @Validate(PasswordMatchConstraint, ['newPassword'])
  confirmPassword: string;
}

// Response DTOs for Swagger documentation
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiPropertyOptional({
    description:
      'JWT refresh token (only included if REFRESH_TOKEN_ENABLED=true)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'User password (minimum 8 characters). If not provided, a default password will be used (manager registration only)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User phone number (with country code)',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +1234567890)',
  })
  phone: string;

  @ApiPropertyOptional({
    description:
      'URL to national ID photo (required for public registration, optional for manager registration)',
    example: 'https://example.com/id-photo.jpg',
  })
  @IsOptional()
  @IsUrl()
  nationalIdPhoto?: string;

  @ApiPropertyOptional({
    description: 'User role (only managers can specify this)',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description:
      'Whether to skip phone verification (manager registration only)',
    example: false,
  })
  @IsOptional()
  skipPhoneVerification?: boolean;
}

export class SendPhoneVerificationDto {
  @ApiProperty({
    description: 'Phone number to send verification code to',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +1234567890)',
  })
  phone: string;
}

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format (e.g., +1234567890)',
  })
  phone: string;

  @ApiProperty({
    description: '6-digit verification code',
    example: '123456',
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be exactly 6 digits',
  })
  code: string;
}

export class ApproveUserDto {
  @ApiProperty({
    description: 'User ID to approve',
    example: 'c4ca4238-a0b9-4382-8dcc-509a6f75849b',
  })
  @IsString()
  userId: string;

  @ApiPropertyOptional({
    description: 'Approval notes',
    example: 'User documents verified successfully',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'c4ca4238-a0b9-4382-8dcc-509a6f75849b',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'National ID photo URL',
    example: 'https://example.com/id-photo.jpg',
  })
  nationalIdPhoto?: string;

  @ApiProperty({
    description: 'Phone verification status',
    example: false,
  })
  phoneVerified: boolean;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User account status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2025-10-17T21:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-10-17T21:00:00.000Z',
  })
  updatedAt: Date;
}
