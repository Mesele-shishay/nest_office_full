import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Accept string roles to support both Role enum (lowercase) and UserRole enum (uppercase)
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
