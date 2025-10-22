export enum Permission {
  // Office Management
  CREATE_OFFICE = 'create_office',
  UPDATE_OFFICE = 'update_office',
  DELETE_OFFICE = 'delete_office',
  VIEW_OFFICE = 'view_office',

  // Manager Assignment
  ASSIGN_MANAGER = 'assign_manager',
  REMOVE_MANAGER = 'remove_manager',

  // Reports & Analytics
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',

  // User Management
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  VIEW_USER = 'view_user',

  // Office Types
  MANAGE_OFFICE_TYPES = 'manage_office_types',

  // Location Management
  MANAGE_LOCATIONS = 'manage_locations',

  // Hierarchical Admin Permissions
  ASSIGN_CITY_ADMIN = 'assign_city_admin',
  ASSIGN_STATE_ADMIN = 'assign_state_admin',
  ASSIGN_COUNTRY_ADMIN = 'assign_country_admin',
  MANAGE_HIERARCHICAL_ADMINS = 'manage_hierarchical_admins',

  // Scope-specific permissions
  VIEW_SCOPE_OFFICES = 'view_scope_offices',
  MANAGE_SCOPE_OFFICES = 'manage_scope_offices',
  VIEW_SCOPE_USERS = 'view_scope_users',
  MANAGE_SCOPE_USERS = 'manage_scope_users',
}
