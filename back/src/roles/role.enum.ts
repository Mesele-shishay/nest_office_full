// This file is kept for backward compatibility
// Use Role enum from common/enums/roles.enum.ts instead

import { Role } from '../common/enums/roles.enum';

export enum UserRole {
  USER = 'USER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN',
}

// Export the new Role enum for convenience
export { Role };
