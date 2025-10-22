import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { AdminScope } from '../interfaces/admin-scope.interface';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user has scope-based permissions
    if (this.isHierarchicalAdmin(user)) {
      return this.checkScopeAccess(user, request);
    }

    return true;
  }

  private isHierarchicalAdmin(user: any): boolean {
    return [
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
    ].includes(user.role);
  }

  private checkScopeAccess(user: any, request: any): boolean {
    try {
      const scope: AdminScope = JSON.parse(user.adminScope);
      const { countryId, stateId, cityId } = request.params;

      switch (scope.level) {
        case 'country':
          return scope.countryId === parseInt(countryId);
        case 'state':
          return (
            scope.countryId === parseInt(countryId) &&
            scope.stateId === parseInt(stateId)
          );
        case 'city':
          return (
            scope.countryId === parseInt(countryId) &&
            scope.stateId === parseInt(stateId) &&
            scope.cityId === parseInt(cityId)
          );
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }
}
