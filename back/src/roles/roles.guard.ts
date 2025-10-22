// This file is kept for backward compatibility
// Use guards from common/guards/roles.guard.ts instead

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user: { role: UserRole } }>();
    const user = request.user;
    return requiredRoles.some((role) => user.role === role);
  }
}

// Re-export from the new location
export { RolesGuard as RolesGuardNew } from '../common/guards/roles.guard';
