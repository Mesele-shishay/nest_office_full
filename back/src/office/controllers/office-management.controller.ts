import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Role } from '../../common/enums/roles.enum';
import { Permission } from '../../common/enums/permissions.enum';
import { OfficeManagementService } from '../services/office-management.service';
import { OfficeFeatureGroupService } from '../../office-features/services/office-feature-group.service';
import { GranularFeatureRegistryService } from '../../office-features/services/granular-feature-registry.service';
import { CreateOfficeDto, UpdateOfficeDto } from '../dto/office.dto';

@ApiTags('Office Management')
@ApiBearerAuth('JWT-auth')
@Controller('office-management')
export class OfficeManagementController {
  private readonly logger = new Logger(OfficeManagementController.name);

  constructor(
    private readonly officeManagementService: OfficeManagementService,
    private readonly officeFeatureGroupService: OfficeFeatureGroupService,
    private readonly granularFeatureRegistryService: GranularFeatureRegistryService,
  ) {}

  @Post(':officeId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.CREATE_OFFICE)
  @ResponseMessage('Office created successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Create a new office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** CREATE_OFFICE\n\nCreates a new office with location details.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID for the new office',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateOfficeDto,
    examples: {
      example1: {
        summary: 'US Office Example',
        value: {
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Office created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid location',
  })
  @ApiResponse({
    status: 404,
    description: 'Office type not found',
  })
  async createOffice(
    @Body() createOfficeDto: CreateOfficeDto,
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    try {
      return await this.officeManagementService.createOffice(
        officeId,
        createOfficeDto,
      );
    } catch (error) {
      this.logger.error('Error creating office', error);
      throw error;
    }
  }

  @Get(':officeId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.VIEW_OFFICE)
  @ResponseMessage('Offices retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Get offices for management',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** VIEW_OFFICE\n\nRetrieves offices for management purposes.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Offices retrieved successfully',
  })
  async getOffices(
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    return await this.officeManagementService.getOffices(officeId);
  }

  @Get(':officeId/statistics')
  @Roles(Role.ADMIN)
  @Permissions(Permission.VIEW_OFFICE)
  @ResponseMessage('Office management statistics retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Get office management statistics',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** VIEW_OFFICE\n\nRetrieves office management statistics.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office management statistics retrieved successfully',
  })
  async getOfficeManagementStatistics(
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    return await this.officeManagementService.getOfficeManagementStatistics(
      officeId,
    );
  }

  @Get(':officeId/offices/:targetOfficeId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.VIEW_OFFICE)
  @ResponseMessage('Office retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Get office by ID',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** VIEW_OFFICE\n\nRetrieves a specific office by ID.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'targetOfficeId',
    description: 'Target Office ID to retrieve',
    type: 'string',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
  })
  async getOfficeById(
    @Param('targetOfficeId') targetOfficeId: string,
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    try {
      return await this.officeManagementService.getOfficeById(
        officeId,
        targetOfficeId,
      );
    } catch (error) {
      this.logger.error('Error retrieving office', error);
      throw error;
    }
  }

  @Patch(':officeId/offices/:targetOfficeId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.UPDATE_OFFICE)
  @ResponseMessage('Office updated successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Update office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** UPDATE_OFFICE\n\nUpdates office information.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'targetOfficeId',
    description: 'Target Office ID to update',
    type: 'string',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateOfficeDto,
    examples: {
      example1: {
        summary: 'Update Office Name',
        value: {
          name: 'Updated Office Name',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Office updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
  })
  async updateOffice(
    @Param('targetOfficeId') targetOfficeId: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    try {
      return await this.officeManagementService.updateOffice(
        officeId,
        targetOfficeId,
        updateOfficeDto,
      );
    } catch (error) {
      this.logger.error('Error updating office', error);
      throw error;
    }
  }

  @Delete(':officeId/offices/:targetOfficeId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_OFFICE)
  @ResponseMessage('Office deleted successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Delete office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** DELETE_OFFICE\n\nDeletes an office.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'targetOfficeId',
    description: 'Target Office ID to delete',
    type: 'string',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
  })
  async deleteOffice(
    @Param('targetOfficeId') targetOfficeId: string,
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    try {
      return await this.officeManagementService.deleteOffice(
        officeId,
        targetOfficeId,
      );
    } catch (error) {
      this.logger.error('Error deleting office', error);
      throw error;
    }
  }

  @Post(':officeId/offices/:targetOfficeId/qr-code')
  @Roles(Role.ADMIN)
  @Permissions(Permission.UPDATE_OFFICE)
  @ResponseMessage('QR code generated successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Generate office QR code',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** UPDATE_OFFICE\n\nGenerates a QR code for an office.',
  })
  @ApiParam({
    name: 'officeId',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'targetOfficeId',
    description: 'Target Office ID to generate QR code for',
    type: 'string',
    example: '223e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
  })
  async generateOfficeQRCode(
    @Param('targetOfficeId') targetOfficeId: string,
    @Param('officeId') officeId: string,
    @Request() req: { user: { id: string } },
  ) {
    if (!officeId) {
      throw new BadRequestException('Office ID is required');
    }

    try {
      return await this.officeManagementService.generateOfficeQRCode(
        officeId,
        targetOfficeId,
      );
    } catch (error) {
      this.logger.error('Error generating QR code', error);
      throw error;
    }
  }
}
