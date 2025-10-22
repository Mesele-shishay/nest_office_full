import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
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
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '../../common/enums/roles.enum';
import { Permission } from '../../common/enums/permissions.enum';
import { OfficeTypeService } from '../services/office-type.service';
import {
  CreateOfficeTypeDto,
  UpdateOfficeTypeDto,
} from '../dto/office-type.dto';
import { OfficeTypeResponseDto } from '../dto/response.dto';

@ApiTags('Office Types')
@ApiBearerAuth('JWT-auth')
@Controller('office-types')
export class OfficeTypeController {
  constructor(private readonly officeTypeService: OfficeTypeService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Permissions(Permission.MANAGE_OFFICE_TYPES)
  @ResponseMessage('Office type created successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Create a new office type',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** MANAGE_OFFICE_TYPES\n\nCreates a new office type category.',
  })
  @ApiBody({
    type: CreateOfficeTypeDto,
    examples: {
      example1: {
        summary: 'Corporate Office Type',
        value: {
          name: 'Corporate Office',
          description: 'Main corporate headquarters',
        },
      },
      example2: {
        summary: 'Branch Office Type',
        value: {
          name: 'Branch Office',
          description: 'Regional branch office',
        },
      },
      example3: {
        summary: 'Minimal Office Type',
        value: {
          name: 'Remote Office',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Office type created successfully',
    type: OfficeTypeResponseDto,
    schema: {
      example: {
        message: 'Office type created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Corporate Office',
          description: 'Main corporate headquarters',
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
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
        message: ['name should not be empty', 'name must be a string'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - office type with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Office type with name "Corporate Office" already exists',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createOfficeTypeDto: CreateOfficeTypeDto) {
    return this.officeTypeService.create(createOfficeTypeDto);
  }

  @Get()
  @Public()
  @ResponseMessage('Office types retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get all office types',
    description:
      '**No Authentication Required**\n\nRetrieves a list of all office type categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'Office types retrieved successfully',
    type: [OfficeTypeResponseDto],
    schema: {
      example: {
        message: 'Office types retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Corporate Office',
            description: 'Main corporate headquarters',
            createdAt: '2025-10-18T10:00:00.000Z',
            updatedAt: '2025-10-18T10:00:00.000Z',
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174000',
            name: 'Branch Office',
            description: 'Regional branch office',
            createdAt: '2025-10-18T11:00:00.000Z',
            updatedAt: '2025-10-18T11:00:00.000Z',
          },
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            name: 'Remote Office',
            description: null,
            createdAt: '2025-10-18T11:30:00.000Z',
            updatedAt: '2025-10-18T11:30:00.000Z',
          },
        ],
      },
    },
  })
  async findAll() {
    return this.officeTypeService.findAll();
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Office type retrieved successfully')
  @ApiOperation({
    summary: '🌐 [Public] Get office type by ID',
    description:
      '**No Authentication Required**\n\nRetrieves detailed information about a specific office type.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office type ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office type retrieved successfully',
    type: OfficeTypeResponseDto,
    schema: {
      example: {
        message: 'Office type retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Corporate Office',
          description: 'Main corporate headquarters',
          createdAt: '2025-10-18T10:00:00.000Z',
          updatedAt: '2025-10-18T10:00:00.000Z',
        },
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
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.officeTypeService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.MANAGE_OFFICE_TYPES)
  @ResponseMessage('Office type updated successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Update office type',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** MANAGE_OFFICE_TYPES\n\nUpdates an office type. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office type ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateOfficeTypeDto,
    examples: {
      example1: {
        summary: 'Update Name Only',
        value: {
          name: 'Updated Office Type',
        },
      },
      example2: {
        summary: 'Update Description Only',
        value: {
          description: 'Updated description for office type',
        },
      },
      example3: {
        summary: 'Update Both Fields',
        value: {
          name: 'Regional Office',
          description: 'Regional headquarters and branch offices',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Office type updated successfully',
    type: OfficeTypeResponseDto,
    schema: {
      example: {
        message: 'Office type updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Office Type',
          description: 'Updated description for office type',
          createdAt: '2025-10-18T10:00:00.000Z',
          updatedAt: '2025-10-18T13:00:00.000Z',
        },
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
  @ApiResponse({
    status: 409,
    description: 'Conflict - office type with this name already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Office type with name "Regional Office" already exists',
        error: 'Conflict',
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOfficeTypeDto: UpdateOfficeTypeDto,
  ) {
    return this.officeTypeService.update(id, updateOfficeTypeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.MANAGE_OFFICE_TYPES)
  @ResponseMessage('Office type deleted successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Delete office type',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** MANAGE_OFFICE_TYPES\n\nDeletes an office type. Cannot delete if there are offices using this type.',
  })
  @ApiParam({
    name: 'id',
    description: 'Office type ID',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Office type deleted successfully',
    schema: {
      example: {
        message: 'Office type deleted successfully',
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
  @ApiResponse({
    status: 409,
    description: 'Conflict - office type has associated offices',
    schema: {
      example: {
        statusCode: 409,
        message: 'Cannot delete office type with associated offices',
        error: 'Conflict',
      },
    },
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.officeTypeService.remove(id);
    return null;
  }
}
