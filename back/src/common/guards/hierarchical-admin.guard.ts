import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class HierarchicalAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get the target role from the request body
    const targetRole = request.body?.role;

    if (!targetRole) {
      throw new BadRequestException('Target role is required');
    }

    // Check if user can assign the target role
    const canAssign = this.canAssignRole(
      user.role as UserRole,
      targetRole as UserRole,
    );

    if (!canAssign) {
      throw new ForbiddenException(
        `You do not have permission to assign ${targetRole} role. Your role: ${user.role}`,
      );
    }

    return true;
  }

  private canAssignRole(
    currentUserRole: UserRole,
    targetRole: UserRole,
  ): boolean {
    switch (currentUserRole) {
      case UserRole.ADMIN:
        return [
          UserRole.CITY_ADMIN,
          UserRole.STATE_ADMIN,
          UserRole.COUNTRY_ADMIN,
        ].includes(targetRole);
      case UserRole.COUNTRY_ADMIN:
        return [UserRole.CITY_ADMIN, UserRole.STATE_ADMIN].includes(targetRole);
      case UserRole.STATE_ADMIN:
        return targetRole === UserRole.CITY_ADMIN;
      default:
        return false;
    }
  }
}
