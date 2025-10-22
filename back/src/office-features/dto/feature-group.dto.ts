import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Feature DTOs
export class CreateFeatureDto {
  @ApiProperty({
    description: 'Name of the feature',
    example: 'Advanced Analytics Dashboard',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the feature',
    example:
      'Provides detailed analytics and reporting capabilities for office operations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the feature is active',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateFeatureDto {
  @ApiPropertyOptional({
    description: 'Name of the feature',
    example: 'Enhanced Analytics Dashboard',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the feature',
    example:
      'Enhanced analytics with real-time data processing and custom reports',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the feature is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FeatureQueryDto {
  @ApiPropertyOptional({
    description: 'Search by feature name',
    example: 'analytics',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Feature Group DTOs
export class CreateFeatureGroupDto {
  @ApiProperty({
    description: 'Name of the feature group',
    example: 'Premium Office Suite',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'App name/token name for activation',
    example: 'premium-office-suite',
  })
  @IsString()
  appName: string;

  @ApiPropertyOptional({
    description: 'Description of the feature group',
    example:
      'Complete premium office management solution with advanced features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the feature group is paid',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean = false;

  @ApiProperty({
    description: 'Array of feature IDs to include in this group',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  featureIds: string[];
}

export class UpdateFeatureGroupDto {
  @ApiPropertyOptional({
    description: 'Name of the feature group',
    example: 'Enterprise Office Suite',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'App name/token name for activation',
    example: 'enterprise-office-suite',
  })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({
    description: 'Description of the feature group',
    example:
      'Enterprise-grade office management solution with premium features',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the feature group is paid',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Array of feature IDs to include in this group',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  featureIds?: string[];
}

export class FeatureGroupQueryDto {
  @ApiPropertyOptional({
    description: 'Search by feature group name',
    example: 'premium',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by paid status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// Feature Token DTOs
export class CreateFeatureTokenDto {
  @ApiProperty({
    description: 'Token name from external API',
    example: 'PREMIUM_OFFICE_SUITE_TOKEN',
  })
  @IsString()
  tokenName: string;

  @ApiPropertyOptional({
    description: 'Number of days until expiration (admin configured)',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  expiresInDays?: number;

  @ApiPropertyOptional({
    description: 'Description for this token configuration',
    example: 'Monthly premium subscription token for office suite',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateFeatureTokenDto {
  @ApiPropertyOptional({
    description: 'Token name from external API',
    example: 'ENTERPRISE_OFFICE_SUITE_TOKEN',
  })
  @IsOptional()
  @IsString()
  tokenName?: string;

  @ApiPropertyOptional({
    description: 'Number of days until expiration (admin configured)',
    example: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  expiresInDays?: number;

  @ApiPropertyOptional({
    description: 'Description for this token configuration',
    example: 'Quarterly enterprise subscription token for office suite',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether this token configuration is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Office Feature Group DTOs
export class ActivateFeatureGroupDto {
  @ApiProperty({
    description: 'Token name for activation',
    example: 'PREMIUM_OFFICE_SUITE_TOKEN',
  })
  @IsString()
  tokenName: string;
}

export class OfficeFeatureGroupQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by paid status',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isPaid?: boolean;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
