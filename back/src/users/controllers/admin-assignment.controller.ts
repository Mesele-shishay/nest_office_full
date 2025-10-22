import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { UserRole } from '../entities/user.entity';
import { Permission } from '../../common/enums/permissions.enum';
import { AdminAssignmentService } from '../services/admin-assignment.service';
import {
  AssignCityAdminDto,
  AssignStateAdminDto,
  AssignCountryAdminDto,
} from '../dto/admin-assignment.dto';

@ApiTags('Admin Assignment')
@ApiBearerAuth()
@Controller('admin-assignment')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminAssignmentController {
  constructor(private adminAssignmentService: AdminAssignmentService) {}

  @Post('assign-city-admin')
  @ApiOperation({ summary: 'Assign city admin role to a user' })
  @ApiResponse({ status: 200, description: 'City admin assigned successfully' })
  @ApiResponse({ status: 404, description: 'User or city not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ADMIN, UserRole.COUNTRY_ADMIN, UserRole.STATE_ADMIN)
  @Permissions(Permission.ASSIGN_CITY_ADMIN)
  async assignCityAdmin(@Body() dto: AssignCityAdminDto, @Request() req: any) {
    return this.adminAssignmentService.assignCityAdmin(
      dto.userId,
      dto.cityId,
      req.user.id,
    );
  }

  @Post('assign-state-admin')
  @ApiOperation({ summary: 'Assign state admin role to a user' })
  @ApiResponse({
    status: 200,
    description: 'State admin assigned successfully',
  })
  @ApiResponse({ status: 404, description: 'User or state not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ADMIN, UserRole.COUNTRY_ADMIN)
  @Permissions(Permission.ASSIGN_STATE_ADMIN)
  async assignStateAdmin(
    @Body() dto: AssignStateAdminDto,
    @Request() req: any,
  ) {
    return this.adminAssignmentService.assignStateAdmin(
      dto.userId,
      dto.stateId,
      req.user.id,
    );
  }

  @Post('assign-country-admin')
  @ApiOperation({ summary: 'Assign country admin role to a user' })
  @ApiResponse({
    status: 200,
    description: 'Country admin assigned successfully',
  })
  @ApiResponse({ status: 404, description: 'User or country not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.ADMIN)
  @Permissions(Permission.ASSIGN_COUNTRY_ADMIN)
  async assignCountryAdmin(
    @Body() dto: AssignCountryAdminDto,
    @Request() req: any,
  ) {
    return this.adminAssignmentService.assignCountryAdmin(
      dto.userId,
      dto.countryId,
      req.user.id,
    );
  }

  @Post('remove-admin-role')
  @ApiOperation({ summary: 'Remove hierarchical admin role from a user' })
  @ApiResponse({ status: 200, description: 'Admin role removed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User is not a hierarchical admin' })
  @Roles(UserRole.ADMIN, UserRole.COUNTRY_ADMIN, UserRole.STATE_ADMIN)
  @Permissions(Permission.MANAGE_HIERARCHICAL_ADMINS)
  async removeAdminRole(@Body() dto: { userId: string }, @Request() req: any) {
    return this.adminAssignmentService.removeAdminRole(dto.userId, req.user.id);
  }
}
