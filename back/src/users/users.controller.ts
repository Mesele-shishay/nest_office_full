import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Request,
  BadRequestException,
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
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { RequireHierarchicalAdminPermission } from '../common/decorators/require-hierarchical-admin.decorator';
import { Role } from '../common/enums/roles.enum';
import { Permission } from '../common/enums/permissions.enum';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UserQueryDto,
  PaginatedUsersResponseDto,
  AssignHierarchicalAdminDto,
  HierarchicalAdminResponseDto,
} from './dto/user.dto';
import { UserRole } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Permissions(Permission.CREATE_USER)
  @ResponseMessage('User created successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Create new user',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** CREATE_USER\n\nCreates a new user with specified role. If no password is provided, a default password will be used (configurable via DEFAULT_USER_PASSWORD environment variable). Can be used to create managers that can later be assigned to offices.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      manager: {
        summary: 'Create Manager User',
        value: {
          email: 'manager@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'MANAGER',
          isActive: true,
        },
      },
      regularUser: {
        summary: 'Create Regular User',
        value: {
          email: 'user@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'USER',
          isActive: true,
        },
      },
      userWithDefaultPassword: {
        summary: 'Create User with Default Password',
        value: {
          email: 'newuser@example.com',
          firstName: 'Alice',
          lastName: 'Johnson',
          role: 'USER',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
    schema: {
      example: {
        message: 'User created successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'manager@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'MANAGER',
          isActive: true,
          officeId: null,
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User with email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with email manager@example.com already exists',
        error: 'Conflict',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions(Permission.VIEW_USER)
  @ResponseMessage('Users retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN, MANAGER] Get all users',
    description:
      '**Required Role:** ADMIN or MANAGER\n**Required Permission:** VIEW_USER\n\nRetrieves a paginated list of users with optional filtering by role, active status, and search.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: [
      'USER',
      'MANAGER',
      'ADMIN',
      'CITY_ADMIN',
      'STATE_ADMIN',
      'COUNTRY_ADMIN',
    ],
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by email, first name, or last name',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
    schema: {
      example: {
        message: 'Users retrieved successfully',
        data: {
          users: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'manager@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'MANAGER',
              isActive: true,
              officeId: null,
              createdAt: '2025-10-18T12:00:00.000Z',
              updatedAt: '2025-10-18T12:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  async findAll(@Query() queryDto: UserQueryDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get('available-managers')
  @Roles(Role.ADMIN)
  @Permissions(Permission.VIEW_USER)
  @ResponseMessage('Available managers retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Get available managers',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** VIEW_USER\n\nRetrieves users with MANAGER or ADMIN role that are not currently assigned to any office. These users can be assigned as managers to offices.',
  })
  @ApiResponse({
    status: 200,
    description: 'Available managers retrieved successfully',
    type: [UserResponseDto],
    schema: {
      example: {
        message: 'Available managers retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'manager@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'MANAGER',
            isActive: true,
            officeId: null,
            createdAt: '2025-10-18T12:00:00.000Z',
            updatedAt: '2025-10-18T12:00:00.000Z',
          },
        ],
      },
    },
  })
  async getAvailableManagers() {
    return this.usersService.getAvailableManagers();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @Permissions(Permission.VIEW_USER)
  @ResponseMessage('User retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN, MANAGER] Get user by ID',
    description:
      '**Required Role:** ADMIN or MANAGER\n**Required Permission:** VIEW_USER\n\nRetrieves detailed information about a specific user by UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
    schema: {
      example: {
        message: 'User retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'manager@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'MANAGER',
          isActive: true,
          officeId: 1,
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.UPDATE_USER)
  @ResponseMessage('User updated successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Update user',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** UPDATE_USER\n\nUpdates user information including email, name, role, and active status.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateRole: {
        summary: 'Update User Role',
        value: {
          role: 'MANAGER',
        },
      },
      updateInfo: {
        summary: 'Update User Information',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
    schema: {
      example: {
        message: 'User updated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'manager@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'MANAGER',
          isActive: true,
          officeId: null,
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.ADMIN)
  @Permissions(Permission.UPDATE_USER)
  @ResponseMessage('User status toggled successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Toggle user active status',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** UPDATE_USER\n\nToggles the active status of a user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User status toggled successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('User deleted successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN] Delete user',
    description:
      '**Required Role:** ADMIN\n**Required Permission:** DELETE_USER\n\nDeletes a user. Cannot delete users that are currently assigned to an office.',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete user assigned to an office',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Cannot delete user that is assigned to an office. Remove office assignment first.',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post('hierarchical-admin')
  @Roles('admin', 'country_admin', 'state_admin')
  @Permissions(Permission.MANAGE_HIERARCHICAL_ADMINS as Permission)
  @RequireHierarchicalAdminPermission()
  @ResponseMessage('Hierarchical admin assigned successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN] Assign hierarchical admin',
    description:
      '**Required Role:** ADMIN, COUNTRY_ADMIN, or STATE_ADMIN\n**Required Permission:** MANAGE_HIERARCHICAL_ADMINS\n\nAssigns a hierarchical admin role (CITY_ADMIN, STATE_ADMIN, COUNTRY_ADMIN) with appropriate scope. The assigner can only assign roles lower than their own level.',
  })
  @ApiBody({
    type: AssignHierarchicalAdminDto,
    examples: {
      cityAdmin: {
        summary: 'Assign City Admin',
        value: {
          email: 'city.admin@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CITY_ADMIN',
          adminScope: '{"cityIds": ["city-1", "city-2"]}',
          isActive: true,
        },
      },
      stateAdmin: {
        summary: 'Assign State Admin',
        value: {
          email: 'state.admin@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'STATE_ADMIN',
          adminScope: '{"stateIds": ["state-1", "state-2"]}',
          isActive: true,
        },
      },
      countryAdmin: {
        summary: 'Assign Country Admin',
        value: {
          email: 'country.admin@example.com',
          password: 'SecurePass123!',
          firstName: 'Bob',
          lastName: 'Johnson',
          role: 'COUNTRY_ADMIN',
          adminScope: '{"countryIds": ["country-1"]}',
          isActive: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Hierarchical admin assigned successfully',
    type: HierarchicalAdminResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid role assignment or scope validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'User with email already exists',
  })
  async assignHierarchicalAdmin(
    @Body() assignDto: AssignHierarchicalAdminDto,
    @Request() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.assignHierarchicalAdmin(
      assignDto,
      currentUser.id as string,
    );
  }

  @Get('hierarchical-admins')
  @Roles('admin', 'country_admin', 'state_admin')
  @Permissions(Permission.VIEW_USER)
  @ResponseMessage('Hierarchical admins retrieved successfully')
  @ApiOperation({
    summary: '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN] Get hierarchical admins',
    description:
      "**Required Role:** ADMIN, COUNTRY_ADMIN, or STATE_ADMIN\n**Required Permission:** VIEW_USER\n\nRetrieves hierarchical admins based on the current user's role and scope. Users can only see admins at levels below their own.",
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['CITY_ADMIN', 'STATE_ADMIN', 'COUNTRY_ADMIN'],
    description: 'Filter by specific admin role',
  })
  @ApiResponse({
    status: 200,
    description: 'Hierarchical admins retrieved successfully',
    type: [HierarchicalAdminResponseDto],
  })
  async getHierarchicalAdmins(
    @Query('role') role?: string,
    @Request() req?: any,
  ) {
    if (req?.user) {
      // If user is authenticated, filter by their scope
      return this.usersService.getHierarchicalAdminsByScope(
        req.user.role as UserRole,
        req.user.adminScope as string,
      );
    } else {
      // Fallback for admin users
      return this.usersService.getHierarchicalAdmins(role as UserRole);
    }
  }

  @Get('hierarchical-admins/:id')
  @Roles('admin', 'country_admin', 'state_admin')
  @Permissions(Permission.VIEW_USER)
  @ResponseMessage('Hierarchical admin retrieved successfully')
  @ApiOperation({
    summary:
      '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN] Get hierarchical admin by ID',
    description:
      '**Required Role:** ADMIN, COUNTRY_ADMIN, or STATE_ADMIN\n**Required Permission:** VIEW_USER\n\nRetrieves detailed information about a specific hierarchical admin.',
  })
  @ApiParam({
    name: 'id',
    description: 'Hierarchical admin unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Hierarchical admin retrieved successfully',
    type: HierarchicalAdminResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hierarchical admin not found',
  })
  async getHierarchicalAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN, Role.COUNTRY_ADMIN, Role.STATE_ADMIN, Role.CITY_ADMIN)
  @Permissions(Permission.MANAGE_SCOPE_USERS)
  @ResponseMessage('User deactivated successfully')
  @ApiOperation({
    summary:
      '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN, CITY_ADMIN] Deactivate user by scope',
    description:
      "**Required Role:** ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN\n**Required Permission:** MANAGE_SCOPE_USERS\n\nDeactivates a user based on the current user's administrative scope. Hierarchical admins can only deactivate users within their scope and cannot deactivate users with equal or higher roles.",
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: UserResponseDto,
    schema: {
      example: {
        message: 'User deactivated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          isActive: false,
          officeId: null,
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions or user outside scope',
    schema: {
      example: {
        statusCode: 403,
        message:
          'You can only deactivate users within your administrative scope',
        error: 'Forbidden',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deactivateUserByScope(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.deactivateUserByScope(id, currentUser);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN, Role.COUNTRY_ADMIN, Role.STATE_ADMIN, Role.CITY_ADMIN)
  @Permissions(Permission.MANAGE_SCOPE_USERS)
  @ResponseMessage('User activated successfully')
  @ApiOperation({
    summary:
      '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN, CITY_ADMIN] Activate user by scope',
    description:
      "**Required Role:** ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN\n**Required Permission:** MANAGE_SCOPE_USERS\n\nActivates a user based on the current user's administrative scope. Hierarchical admins can only activate users within their scope and cannot activate users with equal or higher roles.",
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
    type: UserResponseDto,
    schema: {
      example: {
        message: 'User activated successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          isActive: true,
          officeId: null,
          createdAt: '2025-10-18T12:00:00.000Z',
          updatedAt: '2025-10-18T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions or user outside scope',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async activateUserByScope(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.activateUserByScope(id, currentUser);
  }

  @Post('bulk-deactivate')
  @Roles(Role.ADMIN, Role.COUNTRY_ADMIN, Role.STATE_ADMIN, Role.CITY_ADMIN)
  @Permissions(Permission.MANAGE_SCOPE_USERS)
  @ResponseMessage('Bulk deactivation completed')
  @ApiOperation({
    summary:
      '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN, CITY_ADMIN] Bulk deactivate users by scope',
    description:
      "**Required Role:** ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN\n**Required Permission:** MANAGE_SCOPE_USERS\n\nDeactivates multiple users based on the current user's administrative scope. Returns results showing which users were successfully deactivated and which failed with reasons.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-43d1-b456-426614174000',
          ],
          description: 'Array of user IDs to deactivate',
        },
      },
      required: ['userIds'],
    },
    examples: {
      bulkDeactivate: {
        summary: 'Bulk Deactivate Users',
        value: {
          userIds: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-43d1-b456-426614174000',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk deactivation completed',
    schema: {
      example: {
        message: 'Bulk deactivation completed',
        data: {
          deactivated: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'user1@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
              isActive: false,
            },
          ],
          failed: [
            {
              userId: '987fcdeb-51a2-43d1-b456-426614174000',
              reason:
                'You can only deactivate users within your administrative scope',
            },
          ],
        },
      },
    },
  })
  async bulkDeactivateUsersByScope(
    @Body() body: { userIds: string[] },
    @Request() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.deactivateUsersByScope(body.userIds, currentUser);
  }

  @Post('bulk-activate')
  @Roles(Role.ADMIN, Role.COUNTRY_ADMIN, Role.STATE_ADMIN, Role.CITY_ADMIN)
  @Permissions(Permission.MANAGE_SCOPE_USERS)
  @ResponseMessage('Bulk activation completed')
  @ApiOperation({
    summary:
      '🔐 [ADMIN, COUNTRY_ADMIN, STATE_ADMIN, CITY_ADMIN] Bulk activate users by scope',
    description:
      "**Required Role:** ADMIN, COUNTRY_ADMIN, STATE_ADMIN, or CITY_ADMIN\n**Required Permission:** MANAGE_SCOPE_USERS\n\nActivates multiple users based on the current user's administrative scope. Returns results showing which users were successfully activated and which failed with reasons.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-43d1-b456-426614174000',
          ],
          description: 'Array of user IDs to activate',
        },
      },
      required: ['userIds'],
    },
    examples: {
      bulkActivate: {
        summary: 'Bulk Activate Users',
        value: {
          userIds: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987fcdeb-51a2-43d1-b456-426614174000',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk activation completed',
    schema: {
      example: {
        message: 'Bulk activation completed',
        data: {
          activated: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'user1@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'USER',
              isActive: true,
            },
          ],
          failed: [
            {
              userId: '987fcdeb-51a2-43d1-b456-426614174000',
              reason:
                'You can only activate users within your administrative scope',
            },
          ],
        },
      },
    },
  })
  async bulkActivateUsersByScope(
    @Body() body: { userIds: string[] },
    @Request() req: any,
  ) {
    const currentUser = req.user;
    return this.usersService.activateUsersByScope(body.userIds, currentUser);
  }
}
