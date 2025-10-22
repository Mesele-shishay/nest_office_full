import { UserRole } from '../entities/user.entity';

/**
 * Test data fixtures for user deactivation functionality
 * These provide consistent test data across all test files
 */

export const createMockUser = (overrides: Partial<any> = {}): any => ({
  id: 'user-id',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.USER,
  isActive: true,
  officeId: null,
  adminScope: null,
  assignedBy: null,
  assignedAt: null,
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  password: 'hashed-password',
  permissions: [],
  bannedPermissions: [],
  resetToken: null,
  resetTokenExpiry: null,
  ...overrides,
});

export const createMockAdmin = (role: UserRole, adminScope: string): any => ({
  id: `${role.toLowerCase()}-admin-id`,
  email: `${role.toLowerCase()}@example.com`,
  firstName: 'Admin',
  lastName: 'User',
  role,
  isActive: true,
  officeId: null,
  adminScope,
  assignedBy: 'admin-id',
  assignedAt: new Date('2023-01-01T00:00:00.000Z'),
  createdAt: new Date('2023-01-01T00:00:00.000Z'),
  updatedAt: new Date('2023-01-01T00:00:00.000Z'),
  password: 'hashed-password',
  permissions: [],
  bannedPermissions: [],
  resetToken: null,
  resetTokenExpiry: null,
});

export const createMockRequest = (user: any) => ({
  user,
});

// Test scenarios for different admin roles
export const ADMIN_SCENARIOS = [
  {
    role: UserRole.ADMIN,
    adminScope: '{}',
    description: 'ADMIN user',
    canDeactivate: [
      UserRole.USER,
      UserRole.MANAGER,
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
    ],
    cannotDeactivate: [],
  },
  {
    role: UserRole.COUNTRY_ADMIN,
    adminScope: '{"countryIds": ["US", "CA"]}',
    description: 'COUNTRY_ADMIN user',
    canDeactivate: [
      UserRole.USER,
      UserRole.MANAGER,
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
    ],
    cannotDeactivate: [UserRole.COUNTRY_ADMIN, UserRole.ADMIN],
  },
  {
    role: UserRole.STATE_ADMIN,
    adminScope: '{"stateIds": ["CA", "NY"]}',
    description: 'STATE_ADMIN user',
    canDeactivate: [UserRole.USER, UserRole.MANAGER, UserRole.CITY_ADMIN],
    cannotDeactivate: [
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
      UserRole.ADMIN,
    ],
  },
  {
    role: UserRole.CITY_ADMIN,
    adminScope: '{"cityIds": ["SF", "LA"]}',
    description: 'CITY_ADMIN user',
    canDeactivate: [UserRole.USER, UserRole.MANAGER],
    cannotDeactivate: [
      UserRole.CITY_ADMIN,
      UserRole.STATE_ADMIN,
      UserRole.COUNTRY_ADMIN,
      UserRole.ADMIN,
    ],
  },
];

// Test data for scope validation
export const SCOPE_TEST_DATA = {
  country: {
    valid: '{"countryIds": ["US", "CA"]}',
    invalid: '{"stateIds": ["CA"]}',
    malformed: '{"countryIds": ["US", "CA"]',
    empty: '{}',
  },
  state: {
    valid: '{"stateIds": ["CA", "NY"]}',
    invalid: '{"cityIds": ["SF"]}',
    malformed: '{"stateIds": ["CA", "NY"]',
    empty: '{}',
  },
  city: {
    valid: '{"cityIds": ["SF", "LA"]}',
    invalid: '{"stateIds": ["CA"]}',
    malformed: '{"cityIds": ["SF", "LA"]',
    empty: '{}',
  },
};

// Mock repository responses
export const MOCK_REPOSITORY_RESPONSES = {
  findOne: {
    success: (user: any) => Promise.resolve(user),
    notFound: () => Promise.resolve(null),
    error: (message: string) => Promise.reject(new Error(message)),
  },
  save: {
    success: (user: any) => Promise.resolve(user),
    error: (message: string) => Promise.reject(new Error(message)),
  },
  find: {
    success: (users: any[]) => Promise.resolve(users),
    empty: () => Promise.resolve([]),
    error: (message: string) => Promise.reject(new Error(message)),
  },
};

// Error scenarios for testing
export const ERROR_SCENARIOS = {
  notFound: (userId: string) => new Error(`User with ID ${userId} not found`),
  forbidden: (message: string) => new Error(`Forbidden: ${message}`),
  badRequest: (message: string) => new Error(`Bad Request: ${message}`),
  conflict: (message: string) => new Error(`Conflict: ${message}`),
};

// Bulk operation test data
export const BULK_OPERATION_DATA = {
  userIds: ['user-1', 'user-2', 'user-3', 'user-4'],
  partialSuccess: {
    userIds: ['user-1', 'user-2', 'user-3'],
    successIds: ['user-1', 'user-3'],
    failureIds: ['user-2'],
  },
  allSuccess: {
    userIds: ['user-1', 'user-2'],
    successIds: ['user-1', 'user-2'],
    failureIds: [],
  },
  allFailure: {
    userIds: ['user-1', 'user-2'],
    successIds: [],
    failureIds: ['user-1', 'user-2'],
  },
};

// Integration test scenarios
export const INTEGRATION_SCENARIOS = [
  {
    name: 'Complete deactivation flow',
    steps: [
      'deactivateUserByScope',
      'activateUserByScope',
      'bulkDeactivateUsersByScope',
      'bulkActivateUsersByScope',
    ],
  },
  {
    name: 'Role hierarchy validation',
    steps: [
      'validateDeactivationScope',
      'hasEqualOrHigherRole',
      'isUserWithinScope',
    ],
  },
  {
    name: 'Scope validation',
    steps: ['isScopeWithinCountry', 'isScopeWithinState', 'isScopeWithinCity'],
  },
];

// Performance test data
export const PERFORMANCE_TEST_DATA = {
  small: { userIds: Array.from({ length: 10 }, (_, i) => `user-${i}`) },
  medium: { userIds: Array.from({ length: 100 }, (_, i) => `user-${i}`) },
  large: { userIds: Array.from({ length: 1000 }, (_, i) => `user-${i}`) },
};

// Edge case scenarios
export const EDGE_CASES = {
  emptyArray: { userIds: [] },
  nullValues: { userIds: [null, undefined, ''] },
  invalidIds: { userIds: ['invalid-id', 'not-uuid', ''] },
  duplicateIds: { userIds: ['user-1', 'user-1', 'user-2'] },
  veryLongId: { userIds: ['a'.repeat(1000)] },
  specialCharacters: { userIds: ['user-1', 'user@2', 'user#3'] },
};

// Mock service responses
export const MOCK_SERVICE_RESPONSES = {
  deactivateUserByScope: {
    success: (user: any) => Promise.resolve({ ...user, isActive: false }),
    notFound: (userId: string) =>
      Promise.reject(new Error(`User with ID ${userId} not found`)),
    forbidden: (message: string) =>
      Promise.reject(new Error(`Forbidden: ${message}`)),
  },
  activateUserByScope: {
    success: (user: any) => Promise.resolve({ ...user, isActive: true }),
    notFound: (userId: string) =>
      Promise.reject(new Error(`User with ID ${userId} not found`)),
    forbidden: (message: string) =>
      Promise.reject(new Error(`Forbidden: ${message}`)),
  },
  bulkDeactivateUsersByScope: {
    success: (users: any[]) =>
      Promise.resolve({
        deactivated: users.map((user) => ({ ...user, isActive: false })),
        failed: [],
      }),
    partialSuccess: (successUsers: any[], failedUsers: any[]) =>
      Promise.resolve({
        deactivated: successUsers.map((user) => ({ ...user, isActive: false })),
        failed: failedUsers.map((user) => ({
          userId: user.id,
          reason:
            'You can only deactivate users within your administrative scope',
        })),
      }),
  },
  bulkActivateUsersByScope: {
    success: (users: any[]) =>
      Promise.resolve({
        activated: users.map((user) => ({ ...user, isActive: true })),
        failed: [],
      }),
    partialSuccess: (successUsers: any[], failedUsers: any[]) =>
      Promise.resolve({
        activated: successUsers.map((user) => ({ ...user, isActive: true })),
        failed: failedUsers.map((user) => ({
          userId: user.id,
          reason:
            'You can only activate users within your administrative scope',
        })),
      }),
  },
};

// Test assertions helpers
export const ASSERTION_HELPERS = {
  expectUserDeactivated: (user: any) => {
    expect(user.isActive).toBe(false);
  },
  expectUserActivated: (user: any) => {
    expect(user.isActive).toBe(true);
  },
  expectBulkResult: (
    result: any,
    expectedDeactivated: number,
    expectedFailed: number,
  ) => {
    expect(result.deactivated).toHaveLength(expectedDeactivated);
    expect(result.failed).toHaveLength(expectedFailed);
  },
  expectServiceCalled: (mockService: any, method: string, ...args: any[]) => {
    expect(mockService[method]).toHaveBeenCalledWith(...args);
  },
  expectServiceCalledTimes: (
    mockService: any,
    method: string,
    times: number,
  ) => {
    expect(mockService[method]).toHaveBeenCalledTimes(times);
  },
};

// Test data generators
export const DATA_GENERATORS = {
  generateUsers: (count: number, overrides: Partial<any> = {}) => {
    return Array.from({ length: count }, (_, i) =>
      createMockUser({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        ...overrides,
      }),
    );
  },
  generateAdmins: (roles: UserRole[], scopeTemplate: string) => {
    return roles.map((role) =>
      createMockAdmin(role, scopeTemplate.replace('ROLE', role.toLowerCase())),
    );
  },
  generateBulkRequest: (userIds: string[]) => ({ userIds }),
  generateMockRequest: (user: any) => createMockRequest(user),
};

// Test utilities
export const TEST_UTILITIES = {
  waitForAsync: (ms: number = 0) =>
    new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      // Ensure timer doesn't prevent Jest from exiting
      timer.unref();
    }),
  createMockError: (
    type: 'notFound' | 'forbidden' | 'badRequest' | 'conflict',
    message: string,
  ) => {
    const errorMap = {
      notFound: () => new Error(`Not Found: ${message}`),
      forbidden: () => new Error(`Forbidden: ${message}`),
      badRequest: () => new Error(`Bad Request: ${message}`),
      conflict: () => new Error(`Conflict: ${message}`),
    };
    return errorMap[type]();
  },
  validateUserStructure: (user: any) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('isActive');
    expect(typeof user.isActive).toBe('boolean');
  },
  validateBulkResultStructure: (result: any) => {
    expect(result).toHaveProperty('deactivated');
    expect(result).toHaveProperty('failed');
    expect(Array.isArray(result.deactivated)).toBe(true);
    expect(Array.isArray(result.failed)).toBe(true);
  },
};
