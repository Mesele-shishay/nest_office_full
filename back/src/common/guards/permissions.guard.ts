import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permissions.enum';
import { RolePermissions } from '../constants/role-permissions.map';

interface UserWithPermissions {
  id: string;
  email: string;
  role: string; // UserRole enum value (ADMIN, MANAGER, USER)
  permissions?: string[];
  bannedPermissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: UserWithPermissions }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Calculate user's effective permissions
    const effectivePermissions = this.calculateEffectivePermissions(user);

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      effectivePermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        'You do not have the required permissions to access this resource',
      );
    }

    return true;
  }

  private calculateEffectivePermissions(
    user: UserWithPermissions,
  ): Permission[] {
    // Get role-based permissions
    const rolePermissions =
      (RolePermissions[user.role] as Permission[] | undefined) ?? [];

    // Get user's custom permissions (convert strings to Permission enum)
    const userPermissions = (user.permissions || []).filter((p) =>
      Object.values(Permission).includes(p as Permission),
    ) as Permission[];

    // Combine role permissions and user permissions
    const allPermissions = new Set([...rolePermissions, ...userPermissions]);

    // Remove banned permissions
    const bannedPermissions = new Set(user.bannedPermissions || []);

    // Return final effective permissions
    return Array.from(allPermissions).filter(
      (permission) => !bannedPermissions.has(permission),
    );
  }
}
