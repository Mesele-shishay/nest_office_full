import { UseGuards, applyDecorators } from '@nestjs/common';
import { HierarchicalAdminGuard } from '../guards/hierarchical-admin.guard';

export function RequireHierarchicalAdminPermission() {
  return applyDecorators(UseGuards(HierarchicalAdminGuard));
}
