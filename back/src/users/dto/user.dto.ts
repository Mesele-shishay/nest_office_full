import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'User password (minimum 8 characters). If not provided, a default password will be used.',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.MANAGER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User password (minimum 8 characters)',
    example: 'NewSecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier (UUID)',
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

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.MANAGER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Office ID the user is assigned to',
    example: 1,
    nullable: true,
  })
  officeId?: number | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2025-10-18T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2025-10-18T12:00:00.000Z',
  })
  updatedAt: Date;
}

export class UserQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by role',
    enum: UserRole,
    example: UserRole.MANAGER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Search by email, first name, or last name',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class AssignHierarchicalAdminDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'User password (minimum 8 characters). If not provided, a default password will be used.',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Admin role to assign',
    enum: [UserRole.CITY_ADMIN, UserRole.STATE_ADMIN, UserRole.COUNTRY_ADMIN],
    example: UserRole.CITY_ADMIN,
  })
  @IsEnum([UserRole.CITY_ADMIN, UserRole.STATE_ADMIN, UserRole.COUNTRY_ADMIN])
  role: UserRole.CITY_ADMIN | UserRole.STATE_ADMIN | UserRole.COUNTRY_ADMIN;

  @ApiProperty({
    description: 'Admin scope (JSON string containing location IDs)',
    example:
      '{"cityIds": ["city-1", "city-2"], "stateIds": ["state-1"], "countryIds": ["country-1"]}',
  })
  @IsString()
  adminScope: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class HierarchicalAdminResponseDto extends UserResponseDto {
  @ApiPropertyOptional({
    description: 'Admin scope (JSON string containing location IDs)',
    example:
      '{"cityIds": ["city-1", "city-2"], "stateIds": ["state-1"], "countryIds": ["country-1"]}',
    nullable: true,
  })
  adminScope?: string | null;

  @ApiPropertyOptional({
    description: 'ID of the user who assigned this admin',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  assignedBy?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the admin was assigned',
    example: '2025-10-18T12:00:00.000Z',
    nullable: true,
  })
  assignedAt?: Date | null;
}
