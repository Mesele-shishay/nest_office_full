import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber } from 'class-validator';

export class AssignCityAdminDto {
  @ApiProperty({
    description: 'User ID to assign as city admin',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'City ID for the admin scope',
    example: 102571,
  })
  @IsNumber()
  cityId: number;
}

export class AssignStateAdminDto {
  @ApiProperty({
    description: 'User ID to assign as state admin',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'State ID for the admin scope',
    example: 1452,
  })
  @IsNumber()
  stateId: number;
}

export class AssignCountryAdminDto {
  @ApiProperty({
    description: 'User ID to assign as country admin',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Country ID for the admin scope',
    example: 233,
  })
  @IsNumber()
  countryId: number;
}
