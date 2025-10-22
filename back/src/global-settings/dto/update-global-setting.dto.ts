import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalSettingDto } from './create-global-setting.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGlobalSettingDto extends PartialType(
  CreateGlobalSettingDto,
) {
  @ApiPropertyOptional({
    description:
      'New value to set (raw). Will be parsed according to the setting\'s type. For boolean: "true"/"false", for number: numeric string, for json/array: JSON string',
    example: 'false',
  })
  value?: any; // Allow updating the value with any type
}
