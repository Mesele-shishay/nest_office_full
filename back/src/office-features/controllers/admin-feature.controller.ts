import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
} from '../../common/decorators/api-response.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { FeatureGroupService } from '../services/feature-group-management.service';
import { FeatureService } from '../services/feature-group.service';
import { FeatureTokenService } from '../services/feature-token.service';
import { FeatureRegistryService } from '../services/feature-registry.service';
import {
  CreateFeatureGroupDto,
  UpdateFeatureGroupDto,
  FeatureGroupQueryDto,
  CreateFeatureTokenDto,
  UpdateFeatureTokenDto,
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureQueryDto,
} from '../dto/feature-group.dto';
import {
  FeatureGroupResponseDto,
  FeatureTokenResponseDto,
  FeatureResponseDto,
  RegisteredFeaturesResponseDto,
} from '../dto/feature-group-response.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Admin - Feature Management')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN')
export class AdminFeatureController {
  constructor(
    private readonly featureGroupService: FeatureGroupService,
    private readonly featureService: FeatureService,
    private readonly featureTokenService: FeatureTokenService,
    private readonly featureRegistryService: FeatureRegistryService,
  ) {}

  // Feature Management
  @Post('features')
  @ApiOperation({
    summary: '[ADMIN] Create a new feature',
    description:
      'Creates a new feature that can be used in feature groups. **Admin only** - Requires ADMIN role. Feature must be registered in FeatureRegistryService.',
  })
  @ApiStandardResponses(FeatureResponseDto, {
    message: 'Feature created successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature created successfully')
  async createFeature(@Body() createFeatureDto: CreateFeatureDto) {
    // Validate that the feature is registered in the FeatureRegistryService
    if (
      !this.featureRegistryService.isFeatureRegistered(createFeatureDto.name)
    ) {
      throw new BadRequestException(
        `Feature '${createFeatureDto.name}' is not registered in FeatureRegistryService. Only registered features can be added to the database.`,
      );
    }

    return await this.featureService.create(createFeatureDto);
  }

  @Get('features')
  @ApiOperation({
    summary: '[ADMIN] Get all features',
    description:
      'Retrieves all available features for creating feature groups. **Admin only** - Requires ADMIN role.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by feature name',
    example: 'analytics',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
    example: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiStandardResponses(FeatureResponseDto, {
    message: 'Features retrieved successfully',
    isArray: true,
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Features retrieved successfully')
  async getAllFeatures(@Query() queryDto: FeatureQueryDto) {
    return await this.featureService.findAll(queryDto);
  }

  @Get('features/:id')
  @ApiOperation({
    summary: '[ADMIN] Get feature by ID',
    description:
      'Retrieves a specific feature by ID. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiStandardResponses(FeatureResponseDto, {
    message: 'Feature retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature retrieved successfully')
  async getFeature(@Param('id') id: string) {
    return await this.featureService.findOne(id);
  }

  @Patch('features/:id')
  @ApiOperation({
    summary: '[ADMIN] Update feature',
    description:
      'Updates an existing feature. **Admin only** - Requires ADMIN role. If updating name, feature must be registered in FeatureRegistryService.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiStandardResponses(FeatureResponseDto, {
    message: 'Feature updated successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature updated successfully')
  async updateFeature(
    @Param('id') id: string,
    @Body() updateFeatureDto: UpdateFeatureDto,
  ) {
    // If updating the name, validate that the new name is registered
    if (
      updateFeatureDto.name &&
      !this.featureRegistryService.isFeatureRegistered(updateFeatureDto.name)
    ) {
      throw new BadRequestException(
        `Feature '${updateFeatureDto.name}' is not registered in FeatureRegistryService. Only registered features can be added to the database.`,
      );
    }

    return await this.featureService.update(id, updateFeatureDto);
  }

  @Delete('features/:id')
  @ApiOperation({
    summary: '[ADMIN] Delete feature',
    description:
      'Deletes a feature (soft delete). **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiStandardResponses(undefined, {
    message: 'Feature deleted successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature deleted successfully')
  async deleteFeature(@Param('id') id: string) {
    await this.featureService.remove(id);
    return { message: 'Feature deleted successfully' };
  }

  @Get('features/registered')
  @ApiOperation({
    summary: '[ADMIN] Get all registered features',
    description:
      'Retrieves all features that are registered in FeatureRegistryService. These are the only features that can be added to the database. **Admin only** - Requires ADMIN role.',
  })
  @ApiStandardResponses(RegisteredFeaturesResponseDto, {
    message: 'Registered features retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Registered features retrieved successfully')
  async getRegisteredFeatures() {
    const registeredFeatures =
      this.featureRegistryService.getRegisteredFeatures();
    return {
      registeredFeatures,
      count: registeredFeatures.length,
    };
  }

  // Feature Group Management
  @Post('feature-groups')
  @ApiOperation({
    summary: '[ADMIN] Create a new feature group',
    description:
      'Creates a new feature group with associated features. **Admin only** - Requires ADMIN role.',
  })
  @ApiStandardResponses(FeatureGroupResponseDto, {
    message: 'Feature group created successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature group created successfully')
  async createFeatureGroup(
    @Body() createFeatureGroupDto: CreateFeatureGroupDto,
  ) {
    return await this.featureGroupService.create(createFeatureGroupDto);
  }

  @Get('feature-groups')
  @ApiOperation({
    summary: '[ADMIN] Get all feature groups',
    description:
      'Retrieves all feature groups with pagination and filtering. **Admin only** - Requires ADMIN role.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by feature group name',
    example: 'premium',
  })
  @ApiQuery({
    name: 'isPaid',
    required: false,
    description: 'Filter by paid status',
    example: true,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiStandardResponses(FeatureGroupResponseDto, {
    message: 'Feature groups retrieved successfully',
    isArray: true,
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature groups retrieved successfully')
  async findAllFeatureGroups(@Query() queryDto: FeatureGroupQueryDto) {
    return await this.featureGroupService.findAll(queryDto);
  }

  @Get('feature-groups/:id')
  @ApiOperation({
    summary: '[ADMIN] Get a feature group by ID',
    description:
      'Retrieves a specific feature group by its ID. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiStandardResponses(FeatureGroupResponseDto, {
    message: 'Feature group retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature group retrieved successfully')
  async findOneFeatureGroup(@Param('id') id: string) {
    return await this.featureGroupService.findOne(id);
  }

  @Patch('feature-groups/:id')
  @ApiOperation({
    summary: '[ADMIN] Update a feature group',
    description:
      'Updates an existing feature group. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiStandardResponses(FeatureGroupResponseDto, {
    message: 'Feature group updated successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature group updated successfully')
  async updateFeatureGroup(
    @Param('id') id: string,
    @Body() updateFeatureGroupDto: UpdateFeatureGroupDto,
  ) {
    return await this.featureGroupService.update(id, updateFeatureGroupDto);
  }

  @Delete('feature-groups/:id')
  @ApiOperation({
    summary: '[ADMIN] Delete a feature group',
    description:
      'Deletes a feature group. This action cannot be undone. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiStandardResponses(undefined, {
    message: 'Feature group deleted successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature group deleted successfully')
  async removeFeatureGroup(@Param('id') id: string) {
    await this.featureGroupService.remove(id);
    return { message: 'Feature group deleted successfully' };
  }

  // Feature Token Management
  @Post('feature-groups/:id/tokens')
  @ApiOperation({
    summary: '[ADMIN] Create a token configuration for a feature group',
    description:
      'Creates a token configuration that allows activation of a feature group. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiStandardResponses(FeatureTokenResponseDto, {
    message: 'Token created successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Token created successfully')
  async createToken(
    @Param('id') featureGroupId: string,
    @Body() createTokenDto: CreateFeatureTokenDto,
  ) {
    return await this.featureTokenService.create(
      featureGroupId,
      createTokenDto,
    );
  }

  @Get('feature-groups/:id/tokens')
  @ApiOperation({
    summary: '[ADMIN] Get all token configurations for a feature group',
    description:
      'Retrieves all token configurations for a specific feature group. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiStandardResponses(FeatureTokenResponseDto, {
    message: 'Tokens retrieved successfully',
    isArray: true,
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Tokens retrieved successfully')
  async findAllTokens(@Param('id') featureGroupId: string) {
    return await this.featureTokenService.findAll(featureGroupId);
  }

  @Get('tokens/:id')
  @ApiOperation({
    summary: '[ADMIN] Get a token configuration by ID',
    description:
      'Retrieves a specific token configuration by its ID. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Token ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiStandardResponses(FeatureTokenResponseDto, {
    message: 'Token retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Token retrieved successfully')
  async findOneToken(@Param('id') id: string) {
    return await this.featureTokenService.findOne(id);
  }

  @Patch('tokens/:id')
  @ApiOperation({
    summary: '[ADMIN] Update a token configuration',
    description:
      'Updates an existing token configuration. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Token ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiStandardResponses(FeatureTokenResponseDto, {
    message: 'Token updated successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Token updated successfully')
  async updateToken(
    @Param('id') id: string,
    @Body() updateTokenDto: UpdateFeatureTokenDto,
  ) {
    return await this.featureTokenService.update(id, updateTokenDto);
  }

  @Delete('tokens/:id')
  @ApiOperation({
    summary: '[ADMIN] Delete a token configuration',
    description:
      'Deletes a token configuration. This action cannot be undone. **Admin only** - Requires ADMIN role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Token ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiStandardResponses(undefined, { message: 'Token deleted successfully' })
  @ApiStandardErrorResponses()
  @ResponseMessage('Token deleted successfully')
  async removeToken(@Param('id') id: string) {
    await this.featureTokenService.remove(id);
    return { message: 'Token deleted successfully' };
  }
}
