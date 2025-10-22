import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
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
import { OfficeFeatureGroupService } from '../services/office-feature-group.service';
import {
  ActivateFeatureGroupDto,
  OfficeFeatureGroupQueryDto,
} from '../dto/feature-group.dto';
import {
  OfficeFeatureGroupSummaryDto,
  OfficeActiveFeaturesResponseDto,
} from '../dto/feature-group-response.dto';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('Office - Feature Group Management')
@Controller('office')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'MANAGER', 'USER')
export class OfficeFeatureController {
  constructor(
    private readonly officeFeatureGroupService: OfficeFeatureGroupService,
  ) {}

  @Get('feature-groups')
  @ApiOperation({
    summary: '[AUTHENTICATED] Get available feature groups for an office',
    description:
      'Retrieves all available feature groups with activation status. **Authenticated users** - Requires ADMIN, MANAGER, or USER role.',
  })
  @ApiQuery({
    name: 'officeId',
    required: true,
    description: 'Office ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @ApiStandardResponses(OfficeFeatureGroupSummaryDto, {
    message: 'Feature groups retrieved successfully',
    isArray: true,
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature groups retrieved successfully')
  async getAvailableFeatureGroups(
    @Query('officeId') officeId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // If officeId is not provided in query, we might need to get it from user context
    // For now, we'll require it to be passed explicitly
    if (!officeId) {
      throw new Error('Office ID is required');
    }

    return await this.officeFeatureGroupService.getAvailableFeatureGroups(
      officeId,
    );
  }

  @Post('feature-groups/:id/activate')
  @ApiOperation({
    summary: '[AUTHENTICATED] Activate a feature group for an office',
    description:
      'Activates a feature group for an office using a token. For paid groups, token validation is required. **Authenticated users** - Requires ADMIN, MANAGER, or USER role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Feature group ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @ApiQuery({
    name: 'officeId',
    required: true,
    description: 'Office ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @ApiStandardResponses(undefined, {
    message: 'Feature group activated successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Feature group activated successfully')
  async activateFeatureGroup(
    @Param('id') featureGroupId: string,
    @Body() activateDto: ActivateFeatureGroupDto,
    @Query('officeId') officeId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!officeId) {
      throw new Error('Office ID is required');
    }

    const result = await this.officeFeatureGroupService.activateFeatureGroup(
      officeId,
      featureGroupId,
      activateDto,
      req.user.id,
    );

    return {
      message: 'Feature group activated successfully',
      data: {
        featureGroupId: result.featureGroupId,
        isActive: result.isActive,
        expiresAt: result.expiresAt,
        activatedAt: result.activatedAt,
      },
    };
  }

  @Get('features')
  @ApiOperation({
    summary: '[AUTHENTICATED] Get all active features for an office',
    description:
      'Retrieves all active features for an office from activated feature groups. **Authenticated users** - Requires ADMIN, MANAGER, or USER role.',
  })
  @ApiQuery({
    name: 'officeId',
    required: true,
    description: 'Office ID',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  @ApiStandardResponses(OfficeActiveFeaturesResponseDto, {
    message: 'Active features retrieved successfully',
  })
  @ApiStandardErrorResponses()
  @ResponseMessage('Active features retrieved successfully')
  async getOfficeActiveFeatures(
    @Query('officeId') officeId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!officeId) {
      throw new Error('Office ID is required');
    }

    return await this.officeFeatureGroupService.getOfficeActiveFeatures(
      officeId,
    );
  }
}
