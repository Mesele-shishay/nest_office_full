import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsLatitude,
  IsLongitude,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfficeStatus } from '../entities/office.entity';

export class CreateOfficeDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'New York Headquarters',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Image URL of the office',
    example: 'https://example.com/office-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Status of the office',
    enum: OfficeStatus,
    default: OfficeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(OfficeStatus)
  status?: OfficeStatus;

  @ApiPropertyOptional({
    description: 'Whether this office is a template for cloning',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiProperty({
    description: 'ID of the office type',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeTypeId: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({
    description: 'Country ID from location API',
    example: 233,
  })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({
    description: 'State ID from location API',
    example: 1452,
  })
  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @ApiProperty({
    description: 'City ID from location API',
    example: 102571,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;
}

export class RegisterOfficeDto {
  @ApiProperty({
    description: 'Name of the office',
    example: 'New York Headquarters',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Image URL of the office',
    example: 'https://example.com/office-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'ID of the office type',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  officeTypeId: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({
    description: 'Country ID from location API',
    example: 233,
  })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({
    description: 'State ID from location API',
    example: 1452,
  })
  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @ApiProperty({
    description: 'City ID from location API',
    example: 102571,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiProperty({
    description: 'Contact email for office manager credentials',
    example: 'manager@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Contact phone for office manager',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiPropertyOptional({
    description: 'Template office ID to clone from (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  templateOfficeId?: string;
}

export class UpdateOfficeDto {
  @ApiPropertyOptional({
    description: 'Name of the office',
    example: 'New York Headquarters',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Image URL of the office',
    example: 'https://example.com/office-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Status of the office',
    enum: OfficeStatus,
  })
  @IsOptional()
  @IsEnum(OfficeStatus)
  status?: OfficeStatus;

  @ApiPropertyOptional({
    description: 'Whether this office is a template for cloning',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'ID of the office type',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  officeTypeId?: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Country ID from location API',
    example: 233,
  })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  @ApiPropertyOptional({
    description: 'State ID from location API',
    example: 1452,
  })
  @IsOptional()
  @IsNumber()
  stateId?: number;

  @ApiPropertyOptional({
    description: 'City ID from location API',
    example: 102571,
  })
  @IsOptional()
  @IsNumber()
  cityId?: number;
}

export class CloneOfficeDto {
  @ApiProperty({
    description: 'Name for the new office',
    example: 'New York Branch Office',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Image URL for the new office',
    example: 'https://example.com/office-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Country ID from location API',
    example: 233,
  })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({
    description: 'State ID from location API',
    example: 1452,
  })
  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @ApiProperty({
    description: 'City ID from location API',
    example: 102571,
  })
  @IsNumber()
  @IsNotEmpty()
  cityId: number;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7128,
  })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -74.006,
  })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

export class AssignManagerDto {
  @ApiProperty({
    description: 'User ID of the manager to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  managerId: string;
}

export class OfficeQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by office status',
    enum: OfficeStatus,
  })
  @IsOptional()
  @IsEnum(OfficeStatus)
  status?: OfficeStatus;

  @ApiPropertyOptional({
    description: 'Filter by office type ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  officeTypeId?: string;

  @ApiPropertyOptional({
    description: 'Search by office name',
    example: 'Headquarters',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by template status',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'Latitude for distance calculation and sorting',
    example: 40.7128,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude for distance calculation and sorting',
    example: -74.006,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;
}
