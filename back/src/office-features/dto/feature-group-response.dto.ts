import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

// Registered Features Response DTO
export class RegisteredFeaturesResponseDto {
  @ApiProperty({
    description: 'Array of registered feature names',
    example: ['Office Management', 'Invoice Management', 'Payment Processing'],
    type: [String],
  })
  @Expose()
  registeredFeatures: string[];

  @ApiProperty({
    description: 'Number of registered features',
    example: 3,
  })
  @Expose()
  count: number;
}

// Feature Response DTOs
export class FeatureResponseDto {
  @ApiProperty({
    description: 'Feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Feature name',
    example: 'Advanced Analytics Dashboard',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Feature description',
    example:
      'Provides detailed analytics and reporting capabilities for office operations',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Whether the feature is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-20T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;
}

// Feature Token Response DTOs
export class FeatureTokenResponseDto {
  @ApiProperty({
    description: 'Token ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Token name from external API',
    example: 'PREMIUM_OFFICE_SUITE_TOKEN',
  })
  @Expose()
  tokenName: string;

  @ApiPropertyOptional({
    description: 'Number of days until expiration (admin configured)',
    example: 30,
  })
  @Expose()
  expiresInDays?: number;

  @ApiProperty({
    description: 'Whether this token configuration is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Description for this token configuration',
    example: 'Monthly premium subscription token for office suite',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-20T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;
}

// Feature Group Response DTOs
export class FeatureGroupResponseDto {
  @ApiProperty({
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Feature group name',
    example: 'Premium Office Suite',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'App name for activation',
    example: 'premium-office-suite',
  })
  @Expose()
  appName: string;

  @ApiPropertyOptional({
    description: 'Feature group description',
    example:
      'Complete premium office management solution with advanced features',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Whether the feature group is paid',
    example: true,
  })
  @Expose()
  isPaid: boolean;

  @ApiProperty({
    description: 'Features in this group',
    type: [FeatureResponseDto],
  })
  @Expose()
  @Type(() => FeatureResponseDto)
  features: FeatureResponseDto[];

  @ApiProperty({
    description: 'Tokens for this group',
    type: [FeatureTokenResponseDto],
  })
  @Expose()
  @Type(() => FeatureTokenResponseDto)
  tokens: FeatureTokenResponseDto[];

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-20T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;
}

// Office Feature Group Response DTOs
export class OfficeFeatureGroupResponseDto {
  @ApiProperty({
    description: 'Office feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Office ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @Expose()
  officeId: string;

  @ApiProperty({
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Expose()
  featureGroupId: string;

  @ApiPropertyOptional({
    description: 'Token ID used for activation',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Expose()
  tokenId?: string;

  @ApiProperty({
    description: 'Whether the feature group is active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Expiration date',
    example: '2024-02-15T10:30:00.000Z',
  })
  @Expose()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Activation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  activatedAt?: Date;

  @ApiProperty({
    description: 'Feature group details',
    type: FeatureGroupResponseDto,
  })
  @Expose()
  @Type(() => FeatureGroupResponseDto)
  featureGroup: FeatureGroupResponseDto;

  @ApiPropertyOptional({
    description: 'Token details',
    type: FeatureTokenResponseDto,
  })
  @Expose()
  @Type(() => FeatureTokenResponseDto)
  token?: FeatureTokenResponseDto;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-20T14:45:00.000Z',
  })
  @Expose()
  updatedAt: Date;

  @Exclude()
  deletedAt?: Date;
}

// Office Feature Group Summary (for listing)
export class OfficeFeatureGroupSummaryDto {
  @ApiProperty({
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Feature group name',
    example: 'Premium Office Suite',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'App name for activation',
    example: 'premium-office-suite',
  })
  @Expose()
  appName: string;

  @ApiPropertyOptional({
    description: 'Feature group description',
    example:
      'Complete premium office management solution with advanced features',
  })
  @Expose()
  description?: string;

  @ApiProperty({
    description: 'Whether the feature group is paid',
    example: true,
  })
  @Expose()
  isPaid: boolean;

  @ApiProperty({
    description: 'Whether this office has this feature group active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Expiration date',
    example: '2024-02-15T10:30:00.000Z',
  })
  @Expose()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Activation date',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Expose()
  activatedAt?: Date;

  @ApiProperty({
    description: 'Number of features in this group',
    example: 5,
  })
  @Expose()
  featureCount: number;

  @ApiProperty({
    description: 'Features in this group',
    type: [FeatureResponseDto],
  })
  @Expose()
  @Type(() => FeatureResponseDto)
  features: FeatureResponseDto[];
}

// Office Active Features Response
export class OfficeActiveFeaturesResponseDto {
  @ApiProperty({
    description: 'Office ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @Expose()
  officeId: string;

  @ApiProperty({
    description: 'All active features for this office',
    type: [FeatureResponseDto],
  })
  @Expose()
  @Type(() => FeatureResponseDto)
  features: FeatureResponseDto[];

  @ApiProperty({
    description: 'Active feature groups',
    type: [OfficeFeatureGroupSummaryDto],
  })
  @Expose()
  @Type(() => OfficeFeatureGroupSummaryDto)
  featureGroups: OfficeFeatureGroupSummaryDto[];
}
