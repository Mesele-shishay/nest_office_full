import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficeTypeDto {
  @ApiProperty({
    description: 'Name of the office type',
    example: 'Corporate Office',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the office type',
    example: 'Main corporate headquarters',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL of the office type',
    example: 'https://example.com/office-type-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class UpdateOfficeTypeDto {
  @ApiPropertyOptional({
    description: 'Name of the office type',
    example: 'Corporate Office',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the office type',
    example: 'Main corporate headquarters',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL of the office type',
    example: 'https://example.com/office-type-image.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
