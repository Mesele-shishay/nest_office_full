import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Type,
} from '@nestjs/common';
import { GlobalSettingsService } from './global-settings.service';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { GlobalSettings } from './entities/global-settings.entity';
import { ApiStandardResponses } from '../common/decorators/api-response.decorator';
import { Public } from '../common/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('Global Settings')
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/global-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class GlobalSettingsController {
  constructor(private readonly settingsService: GlobalSettingsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: '🌐 [Public] List all global settings',
    description:
      '**No Authentication Required**\n\nRetrieve all global application settings organized by category. Returns settings in ascending order by category and key.',
  })
  @ApiStandardResponses(GlobalSettings as Type<unknown>, {
    status: 200,
    description:
      'Array of all global settings with their current values and metadata',
    isArray: true,
    message: 'Global settings retrieved successfully',
  })
  getAll(): Promise<GlobalSettings[]> {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @Public()
  @ApiOperation({
    summary: '🌐 [Public] Get a global setting by key',
    description:
      '**No Authentication Required**\n\nRetrieve a specific global setting by its unique key identifier. Returns the setting with parsed value based on its type.',
  })
  @ApiParam({
    name: 'key',
    description: 'Unique identifier key for the global setting',
    example: 'feature.enableBeta',
  })
  @ApiStandardResponses(GlobalSettings as Type<unknown>, {
    status: 200,
    description: 'Global setting with parsed value and metadata',
    message: 'Global setting retrieved successfully',
  })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  getOne(@Param('key') key: string): Promise<GlobalSettings> {
    return this.settingsService.findByKey(key);
  }

  @Post()
  @ApiOperation({
    summary: '🔓 [Authenticated] Create a new global setting',
    description:
      'Create a new global application setting. The key must be unique across all settings. Value will be stored according to the specified type.',
  })
  @ApiStandardResponses(GlobalSettings as Type<unknown>, {
    status: 201,
    description: 'Successfully created global setting',
    message: 'Global setting created successfully',
  })
  create(@Body() dto: CreateGlobalSettingDto): Promise<GlobalSettings> {
    return this.settingsService.create(dto);
  }

  @Patch(':key')
  @ApiOperation({
    summary: '🔓 [Authenticated] Update a global setting by key',
    description:
      "Update an existing global setting. You can update any field including the value. Value will be parsed according to the setting's type. If requiresRestart is true, changes may need an application restart.",
  })
  @ApiParam({
    name: 'key',
    description: 'Unique identifier key for the global setting to update',
    example: 'feature.enableBeta',
  })
  @ApiStandardResponses(GlobalSettings as Type<unknown>, {
    status: 200,
    description: 'Successfully updated global setting',
    message: 'Global setting updated successfully',
  })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  update(
    @Param('key') key: string,
    @Body() dto: UpdateGlobalSettingDto,
  ): Promise<GlobalSettings> {
    return this.settingsService.update(key, dto);
  }
}
