import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { Role } from '../../common/enums/roles.enum';
import { Permission } from '../../common/enums/permissions.enum';
import { OfficeService } from '../services/office.service';
import { LocationService } from '../services/location.service';
import {
  CreateOfficeDto,
  UpdateOfficeDto,
  OfficeQueryDto,
  AssignManagerDto,
  RegisterOfficeDto,
  CloneOfficeDto,
} from '../dto/office.dto';
import { OfficeResponseDto, PaginatedResponseDto } from '../dto/response.dto';

@ApiTags('Offices')
@ApiBearerAuth('JWT-auth')
@Controller('offices')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
    private readonly locationService: LocationService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @Permissions(Permission.CREATE_OFFICE)
  @ResponseMessage('Office created successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Create a new office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** CREATE_OFFICE\n\nCreates a new office with location details and QR code generation.',
  })
  @ApiBody({
    type: CreateOfficeDto,
    examples: {
      example1: {
        summary: 'US Office Example',
        value: {
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
        },
      },
      example2: {
        summary: 'Minimal Office Example',
        value: {
          name: 'Branch Office',
          officeTypeId: '223e4567-e89b-12d3-a456-426614174000',
          countryId: 233,
          stateId: 1416,
          cityId: 102213,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Office created successfully',
    type: OfficeResponseDto,
    schema: {
      example: {
        message: 'Office created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryCode: 'US',
          stateCode: 'NY',
          cityCode: 'NYC',
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid location',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid location data',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office type not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office type with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async create(
    @Body() createOfficeDto: CreateOfficeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.officeService.create(createOfficeDto, req.user.id);
  }

  @Post('register')
  @Public()
  @ResponseMessage('Office registration request submitted successfully')
  @ApiOperation({
    summary: '📝 Register a new office (public)',
    description:
      '**Public endpoint** - Allows any user to register a new office. The office will be created in INACTIVE status and requires admin approval.',
  })
  @ApiBody({
    type: RegisterOfficeDto,
    examples: {
      example1: {
        summary: 'Office Registration Example',
        value: {
          name: 'New Branch Office',
          image: 'https://example.com/office-image.jpg',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          contactEmail: 'manager@example.com',
          contactPhone: '+1234567890',
        },
      },
      example2: {
        summary: 'Office Registration with Template',
        value: {
          name: 'New Branch Office',
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          contactEmail: 'manager@example.com',
          contactPhone: '+1234567890',
          templateOfficeId: 'template-office-id',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Office registration request submitted successfully',
    schema: {
      example: {
        message: 'Office registration request submitted successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New Branch Office',
          status: 'INACTIVE',
          contactEmail: 'manager@example.com',
          contactPhone: '+1234567890',
          requestedBy: null,
          approvedBy: null,
          approvedAt: null,
          createdAt: '2025-01-27T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid location',
  })
  @ApiResponse({
    status: 404,
    description: 'Office type not found',
  })
  async register(@Body() registerOfficeDto: RegisterOfficeDto) {
    return this.officeService.register(registerOfficeDto);
  }

  @Get('templates')
  @Public()
  @ResponseMessage('Template offices retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get all template offices',
    description:
      '**Public endpoint** - Retrieves all template offices that can be used for cloning during registration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Template offices retrieved successfully',
    schema: {
      example: {
        message: 'Template offices retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Standard Office Template',
            image: 'https://example.com/template-image.jpg',
            isTemplate: true,
            officeTypeId: 'office-type-id',
            latitude: 40.7128,
            longitude: -74.006,
            createdAt: '2025-01-27T12:00:00.000Z',
          },
        ],
      },
    },
  })
  async getTemplateOffices() {
    return this.officeService.findTemplateOffices();
  }

  @Get()
  @Public()
  @ResponseMessage('Offices retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get all offices with pagination',
    description:
      '**Public Endpoint** - No authentication required\n\nRetrieves a paginated list of offices with optional filtering by status, type, and search query. When latitude and longitude are provided together, offices are sorted by distance (closest first) and include distance field in response. Both latitude and longitude must be provided together or neither should be provided.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE'],
    description: 'Filter by office status',
    example: 'ACTIVE',
  })
  @ApiQuery({
    name: 'officeTypeId',
    required: false,
    type: String,
    description: 'Filter by office type ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'isTemplate',
    required: false,
    type: Boolean,
    description: 'Filter by whether the office is a template',
    example: false,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by office name (partial match)',
    example: 'Headquarters',
  })
  @ApiQuery({
    name: 'latitude',
    required: false,
    type: Number,
    description:
      'Latitude for distance calculation and sorting (closest first). Must be provided together with longitude.',
    example: 40.7128,
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    type: Number,
    description:
      'Longitude for distance calculation and sorting (closest first). Must be provided together with latitude.',
    example: -74.006,
  })
  @ApiResponse({
    status: 200,
    description: 'Offices retrieved successfully',
    type: PaginatedResponseDto<OfficeResponseDto>,
    schema: {
      example: {
        message: 'Offices retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'New York Headquarters',
            image: 'https://example.com/office-ny.jpg',
            status: 'ACTIVE',
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
            officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
            latitude: 40.7128,
            longitude: -74.006,
            countryId: 233,
            stateId: 1452,
            cityId: 102571,
            createdBy: '123e4567-e89b-12d3-a456-426614174000',
            createdAt: '2025-10-18T12:00:00.000Z',
            updatedAt: '2025-10-18T12:00:00.000Z',
            officeType: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Corporate Office',
              description: 'Main corporate headquarters',
              createdAt: '2025-10-18T10:00:00.000Z',
              updatedAt: '2025-10-18T10:00:00.000Z',
            },
            managers: [],
            distance: 2.5,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Both latitude and longitude must be provided together, or neither should be provided',
        error: 'Bad Request',
      },
    },
  })
  async findAll(@Query() queryDto: OfficeQueryDto, @Request() req: any) {
    const result = await this.officeService.findAll(queryDto, req.user);
    return {
      offices: result.offices,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
      },
    };
  }

  @Get(':id')
  @Permissions(Permission.VIEW_OFFICE)
  @ResponseMessage('Office retrieved successfully')
  @ApiOperation({
    summary: '🔓 [Authenticated] Get office by ID',
    description:
      '**Required Permission:** VIEW_OFFICE\n\nRetrieves detailed information about a specific office by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office retrieved successfully',
    type: OfficeResponseDto,
    schema: {
      example: {
        message: 'Office retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          updatedBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
          officeType: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Corporate Office',
            description: 'Main corporate headquarters',
            createdAt: '2025-10-18T10:00:00.000Z',
            updatedAt: '2025-10-18T10:00:00.000Z',
          },
          managers: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.officeService.findOne(id);
  }

  @Post(':id/approve')
  @Roles(Role.ADMIN)
  @Permissions(Permission.CREATE_OFFICE)
  @ResponseMessage('Office approved and manager created successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Approve office registration',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** CREATE_OFFICE\n\nApproves a registered office, activates it, and creates a manager account with credentials sent via email.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID to approve',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office approved and manager created successfully',
    schema: {
      example: {
        message: 'Office approved and manager created successfully',
        data: {
          office: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'New Branch Office',
            status: 'ACTIVE',
            approvedBy: 'admin-user-id',
            approvedAt: '2025-01-27T12:00:00.000Z',
          },
          manager: {
            id: 'manager-user-id',
            email: 'manager@example.com',
            role: 'MANAGER',
            officeId: '123e4567-e89b-12d3-a456-426614174000',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Office is already active or invalid state',
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
  })
  async approveOffice(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.officeService.approveOffice(id, req.user.id);
  }

  @Post('templates/:templateId/clone')
  @Roles(Role.ADMIN)
  @Permissions(Permission.CREATE_OFFICE)
  @ResponseMessage('Office cloned from template successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Clone office from template',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** CREATE_OFFICE\n\nClones an existing template office to create a new active office.',
  })
  @ApiParam({
    name: 'templateId',
    description: 'Template office ID to clone from',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CloneOfficeDto,
    examples: {
      example1: {
        summary: 'Clone Template Office',
        value: {
          name: 'New Branch Office',
          image: 'https://example.com/office-image.jpg',
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          latitude: 40.7128,
          longitude: -74.006,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Office cloned from template successfully',
    schema: {
      example: {
        message: 'Office cloned from template successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New Branch Office',
          status: 'ACTIVE',
          isTemplate: false,
          officeTypeId: 'template-office-type-id',
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          createdBy: 'admin-user-id',
          createdAt: '2025-01-27T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid location',
  })
  @ApiResponse({
    status: 404,
    description: 'Template office not found',
  })
  async cloneTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() cloneOfficeDto: CloneOfficeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.officeService.cloneTemplate(
      templateId,
      cloneOfficeDto,
      req.user.id,
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.UPDATE_OFFICE)
  @ResponseMessage('Office updated successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Update office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** UPDATE_OFFICE\n\nUpdates office information. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateOfficeDto,
    examples: {
      example1: {
        summary: 'Update Office Name and Status',
        value: {
          name: 'Updated Office Name',
          status: 'INACTIVE',
        },
      },
      example2: {
        summary: 'Update Location Details',
        value: {
          latitude: 40.7589,
          longitude: -73.9851,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
        },
      },
      example3: {
        summary: 'Update Complete Office Info',
        value: {
          name: 'San Francisco Office',
          image: 'https://example.com/office-sf.jpg',
          status: 'ACTIVE',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 37.7749,
          longitude: -122.4194,
          countryId: 233,
          stateId: 1416,
          cityId: 102213,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Office updated successfully',
    type: OfficeResponseDto,
    schema: {
      example: {
        message: 'Office updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Office Name',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          updatedBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T13:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid location',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid location data',
        error: 'Bad Request',
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.officeService.update(id, updateOfficeDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_OFFICE)
  @ResponseMessage('Office deleted successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Delete office (soft delete)',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** DELETE_OFFICE\n\nSoft deletes an office (marks as deleted but keeps in database).',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office deleted successfully',
    schema: {
      example: {
        message: 'Office deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.officeService.remove(id);
    return null;
  }

  @Post(':id/assign-manager')
  @Roles(Role.ADMIN)
  @Permissions(Permission.ASSIGN_MANAGER)
  @ResponseMessage('Manager assigned successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Assign manager to office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** ASSIGN_MANAGER\n\nAssigns a user as manager to an office. The user must not be assigned to another office.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: AssignManagerDto,
    examples: {
      example1: {
        summary: 'Assign Manager',
        value: {
          managerId: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Manager assigned successfully',
    type: OfficeResponseDto,
    schema: {
      example: {
        message: 'Manager assigned successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
          managers: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'manager@example.com',
              firstName: 'John',
              lastName: 'Doe',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office or user not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User is already assigned to another office',
    schema: {
      example: {
        statusCode: 409,
        message: 'User is already assigned to another office',
        error: 'Conflict',
      },
    },
  })
  async assignManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignManagerDto: AssignManagerDto,
  ) {
    return this.officeService.assignManager(id, assignManagerDto);
  }

  @Delete(':id/remove-manager/:managerId')
  @Roles(Role.ADMIN)
  @Permissions(Permission.REMOVE_MANAGER)
  @ResponseMessage('Manager removed successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Remove manager from office',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** REMOVE_MANAGER\n\nRemoves a manager assignment from an office.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'managerId',
    description: 'Manager User ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Manager removed successfully',
    type: OfficeResponseDto,
    schema: {
      example: {
        message: 'Manager removed successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New York Headquarters',
          image: 'https://example.com/office-ny.jpg',
          status: 'ACTIVE',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          officeTypeId: '123e4567-e89b-12d3-a456-426614174000',
          latitude: 40.7128,
          longitude: -74.006,
          countryId: 233,
          stateId: 1452,
          cityId: 102571,
          createdBy: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
          managers: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Office or user not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Office with ID 1 not found',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User is not assigned to this office',
    schema: {
      example: {
        statusCode: 409,
        message: 'User is not assigned to this office',
        error: 'Conflict',
      },
    },
  })
  async removeManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('managerId') managerId: string,
  ) {
    return this.officeService.removeManager(id, managerId);
  }
}

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Public()
  @Get('countries')
  @ResponseMessage('Countries retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get all countries',
    description:
      '**No Authentication Required**\n\nRetrieves a list of all available countries with their IDs and names.',
  })
  @ApiResponse({
    status: 200,
    description: 'Countries retrieved successfully',
    schema: {
      example: {
        message: 'Countries retrieved successfully',
        data: [
          {
            id: 233,
            name: 'United States',
            iso2: 'US',
          },
          {
            id: 38,
            name: 'Canada',
            iso2: 'CA',
          },
          {
            id: 232,
            name: 'United Kingdom',
            iso2: 'GB',
          },
        ],
      },
    },
  })
  async getCountries() {
    return this.locationService.getCountries();
  }

  @Public()
  @Get('countries/:countryId/states')
  @ResponseMessage('States retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get states by country ID',
    description:
      '**No Authentication Required**\n\nRetrieves all states/provinces for a specific country using country ID.',
  })
  @ApiParam({
    name: 'countryId',
    description: 'Country ID from location API',
    type: 'number',
    example: 233,
  })
  @ApiResponse({
    status: 200,
    description: 'States retrieved successfully',
    schema: {
      example: {
        message: 'States retrieved successfully',
        data: [
          {
            id: 1452,
            name: 'New York',
            iso2: 'NY',
            countryId: 233,
            countryName: 'United States',
          },
          {
            id: 1416,
            name: 'California',
            iso2: 'CA',
            countryId: 233,
            countryName: 'United States',
          },
          {
            id: 1407,
            name: 'Texas',
            iso2: 'TX',
            countryId: 233,
            countryName: 'United States',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid country ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid country ID: 999',
        error: 'Bad Request',
      },
    },
  })
  async getStates(@Param('countryId', ParseIntPipe) countryId: number) {
    return this.locationService.getStates(countryId);
  }

  @Public()
  @Get('states/:stateId/cities')
  @ResponseMessage('Cities retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get cities by state ID',
    description:
      '**No Authentication Required**\n\nRetrieves all cities for a specific state/province using state ID.',
  })
  @ApiParam({
    name: 'stateId',
    description: 'State ID from location API',
    type: 'number',
    example: 1452,
  })
  @ApiResponse({
    status: 200,
    description: 'Cities retrieved successfully',
    schema: {
      example: {
        message: 'Cities retrieved successfully',
        data: [
          {
            id: 102571,
            name: 'New York City',
            stateId: 1452,
            stateName: 'New York',
            countryName: 'United States',
          },
          {
            id: 111237,
            name: 'Buffalo',
            stateId: 1452,
            stateName: 'New York',
            countryName: 'United States',
          },
          {
            id: 115320,
            name: 'Rochester',
            stateId: 1452,
            stateName: 'New York',
            countryName: 'United States',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid state ID',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid state ID: 999',
        error: 'Bad Request',
      },
    },
  })
  async getCities(@Param('stateId', ParseIntPipe) stateId: number) {
    return this.locationService.getCities(stateId);
  }
}
