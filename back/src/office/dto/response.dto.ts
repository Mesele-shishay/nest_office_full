import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfficeStatus } from '../entities/office.entity';

export class OfficeTypeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Corporate Office' })
  name: string;

  @ApiPropertyOptional({ example: 'Main corporate headquarters' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/office-type-image.jpg' })
  image?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class OfficeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'New York Headquarters' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/office-image.jpg' })
  image?: string;

  @ApiProperty({ enum: OfficeStatus, example: OfficeStatus.ACTIVE })
  status: OfficeStatus;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this office is a template for cloning',
  })
  isTemplate?: boolean;

  @ApiPropertyOptional({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrCode?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  officeTypeId: string;

  @ApiPropertyOptional({ example: 40.7128 })
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006 })
  longitude?: number;

  @ApiProperty({ example: 233 })
  countryId: number;

  @ApiProperty({ example: 1452 })
  stateId: number;

  @ApiProperty({ example: 102571 })
  cityId: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  createdBy: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  updatedBy?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: () => OfficeTypeResponseDto })
  officeType?: OfficeTypeResponseDto;

  @ApiPropertyOptional({
    description: 'Array of managers assigned to this office',
    type: [Object],
  })
  managers?: any[];

  @ApiPropertyOptional({
    description: 'Distance from the provided coordinates in kilometers',
    example: 5.2,
  })
  distance?: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data: T[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}
