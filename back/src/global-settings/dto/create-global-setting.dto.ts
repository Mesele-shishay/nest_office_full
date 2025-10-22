import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGlobalSettingDto {
  @ApiProperty({
    maxLength: 100,
    example: 'feature.enableBeta',
    description:
      'Unique identifier key for the global setting. Use dot notation for hierarchical organization (e.g., "feature.enableBeta", "security.maxLoginAttempts")',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  key: string;

  @ApiPropertyOptional({
    description:
      'Raw value stored as string/JSON. Will be parsed according to the specified type. For boolean: "true"/"false", for number: numeric string, for json/array: JSON string',
    example: 'true',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    enum: ['string', 'number', 'boolean', 'json', 'array'],
    example: 'boolean',
    description:
      'Data type for value parsing and validation. Determines how the value is stored and retrieved',
  })
  @IsIn(['string', 'number', 'boolean', 'json', 'array'])
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';

  @ApiPropertyOptional({
    maxLength: 255,
    example: 'Enable beta features for testing purposes',
    description:
      'Human-readable description explaining the purpose and impact of this setting',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    enum: ['system', 'security', 'ui', 'features', 'notifications'],
    example: 'features',
    description:
      'Category for grouping related settings. Used for organization and filtering in admin interfaces',
  })
  @IsIn(['system', 'security', 'ui', 'features', 'notifications'])
  category: 'system' | 'security' | 'ui' | 'features' | 'notifications';

  @ApiPropertyOptional({
    default: true,
    example: true,
    description:
      'Whether this setting can be modified through the admin interface. System-critical settings should be non-editable',
  })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @ApiPropertyOptional({
    default: false,
    example: false,
    description:
      'Whether changing this setting requires an application restart to take effect',
  })
  @IsOptional()
  @IsBoolean()
  requiresRestart?: boolean;

  @ApiPropertyOptional({
    description:
      'JSON string containing validation rules (e.g., min/max values, allowed values, regex patterns)',
    example: '{"min": 0, "max": 100, "pattern": "^[a-zA-Z0-9]+$"}',
  })
  @IsOptional()
  @IsString()
  validationRules?: string;

  @ApiPropertyOptional({
    description:
      'Default value used when no value is set. Must match the specified type',
    example: 'false',
  })
  @IsOptional()
  @IsString()
  defaultValue?: string;
}
