// This file is kept for backward compatibility
// Use decorators from common/decorators/roles.decorator.ts instead

import { SetMetadata } from '@nestjs/common';
import { UserRole } from './role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Re-export from the new location
export { Roles as RolesNew } from '../common/decorators/roles.decorator';
