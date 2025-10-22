import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UserWithRole {
  id: string;
  email: string;
  role: string; // UserRole enum value (ADMIN, MANAGER, USER)
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow if endpoint is marked public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: UserWithRole }>();
    const user = request.user;

    if (!user || !user.id || !user.email || !user.role) {
      throw new ForbiddenException('User not authenticated');
    }

    // Compare roles case-insensitively to handle both UserRole (ADMIN) and Role (admin)
    const userRoleUpper = user.role.toUpperCase();
    const hasRole = requiredRoles.some(
      (role) => role.toUpperCase() === userRoleUpper,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to access this resource',
      );
    }

    return true;
  }
}
