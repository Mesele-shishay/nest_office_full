import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

describe('UsersController - User Deactivation Endpoints', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    deactivateUserByScope: jest.fn(),
    activateUserByScope: jest.fn(),
    deactivateUsersByScope: jest.fn(),
    activateUsersByScope: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleActiveStatus: jest.fn(),
    getAvailableManagers: jest.fn(),
    assignHierarchicalAdmin: jest.fn(),
    getHierarchicalAdmins: jest.fn(),
    getHierarchicalAdminsByScope: jest.fn(),
    canAssignRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any remaining timers or async operations
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // Test data fixtures
  const createMockUser = (overrides: any = {}) => ({
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const createMockRequest = (user: any) => ({
    user,
  });

  describe('deactivateUserByScope', () => {
    const userId = 'target-user-id';
    const mockRequest = createMockRequest({
      id: 'admin-id',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
    });

    it('should successfully deactivate a user', async () => {
      const targetUser = createMockUser({ id: userId, isActive: true });
      const deactivatedUser = { ...targetUser, isActive: false };

      mockUsersService.deactivateUserByScope.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        userId,
        mockRequest,
      );

      expect(mockUsersService.deactivateUserByScope).toHaveBeenCalledWith(
        userId,
        mockRequest.user,
      );
      expect(result).toEqual(deactivatedUser);
    });

    it('should handle NotFoundException', async () => {
      const error = new NotFoundException(`User with ID ${userId} not found`);
      mockUsersService.deactivateUserByScope.mockRejectedValue(error);

      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(`User with ID ${userId} not found`);
    });

    it('should handle ForbiddenException for insufficient permissions', async () => {
      const error = new ForbiddenException(
        'You can only deactivate users within your administrative scope',
      );
      mockUsersService.deactivateUserByScope.mockRejectedValue(error);

      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(
        'You can only deactivate users within your administrative scope',
      );
    });

    it('should handle ForbiddenException for role hierarchy violation', async () => {
      const error = new ForbiddenException(
        'You cannot deactivate users with equal or higher administrative roles',
      );
      mockUsersService.deactivateUserByScope.mockRejectedValue(error);

      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.deactivateUserByScope(userId, mockRequest),
      ).rejects.toThrow(
        'You cannot deactivate users with equal or higher administrative roles',
      );
    });

    it('should work with different admin roles', async () => {
      const countryAdminRequest = createMockRequest({
        id: 'country-admin-id',
        role: UserRole.COUNTRY_ADMIN,
        email: 'country@example.com',
        adminScope: '{"countryIds": ["US"]}',
      });

      const deactivatedUser = createMockUser({ id: userId, isActive: false });
      mockUsersService.deactivateUserByScope.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        userId,
        countryAdminRequest,
      );

      expect(mockUsersService.deactivateUserByScope).toHaveBeenCalledWith(
        userId,
        countryAdminRequest.user,
      );
      expect(result).toEqual(deactivatedUser);
    });

    it('should work with STATE_ADMIN role', async () => {
      const stateAdminRequest = createMockRequest({
        id: 'state-admin-id',
        role: UserRole.STATE_ADMIN,
        email: 'state@example.com',
        adminScope: '{"stateIds": ["CA"]}',
      });

      const deactivatedUser = createMockUser({ id: userId, isActive: false });
      mockUsersService.deactivateUserByScope.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        userId,
        stateAdminRequest,
      );

      expect(mockUsersService.deactivateUserByScope).toHaveBeenCalledWith(
        userId,
        stateAdminRequest.user,
      );
      expect(result).toEqual(deactivatedUser);
    });

    it('should work with CITY_ADMIN role', async () => {
      const cityAdminRequest = createMockRequest({
        id: 'city-admin-id',
        role: UserRole.CITY_ADMIN,
        email: 'city@example.com',
        adminScope: '{"cityIds": ["SF"]}',
      });

      const deactivatedUser = createMockUser({ id: userId, isActive: false });
      mockUsersService.deactivateUserByScope.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        userId,
        cityAdminRequest,
      );

      expect(mockUsersService.deactivateUserByScope).toHaveBeenCalledWith(
        userId,
        cityAdminRequest.user,
      );
      expect(result).toEqual(deactivatedUser);
    });
  });

  describe('activateUserByScope', () => {
    const userId = 'target-user-id';
    const mockRequest = createMockRequest({
      id: 'admin-id',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
    });

    it('should successfully activate a user', async () => {
      const targetUser = createMockUser({ id: userId, isActive: false });
      const activatedUser = { ...targetUser, isActive: true };

      mockUsersService.activateUserByScope.mockResolvedValue(activatedUser);

      const result = await controller.activateUserByScope(userId, mockRequest);

      expect(mockUsersService.activateUserByScope).toHaveBeenCalledWith(
        userId,
        mockRequest.user,
      );
      expect(result).toEqual(activatedUser);
    });

    it('should handle NotFoundException', async () => {
      const error = new NotFoundException(`User with ID ${userId} not found`);
      mockUsersService.activateUserByScope.mockRejectedValue(error);

      await expect(
        controller.activateUserByScope(userId, mockRequest),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.activateUserByScope(userId, mockRequest),
      ).rejects.toThrow(`User with ID ${userId} not found`);
    });

    it('should handle ForbiddenException for insufficient permissions', async () => {
      const error = new ForbiddenException(
        'You can only activate users within your administrative scope',
      );
      mockUsersService.activateUserByScope.mockRejectedValue(error);

      await expect(
        controller.activateUserByScope(userId, mockRequest),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.activateUserByScope(userId, mockRequest),
      ).rejects.toThrow(
        'You can only activate users within your administrative scope',
      );
    });

    it('should work with hierarchical admin roles', async () => {
      const countryAdminRequest = createMockRequest({
        id: 'country-admin-id',
        role: UserRole.COUNTRY_ADMIN,
        email: 'country@example.com',
        adminScope: '{"countryIds": ["US"]}',
      });

      const activatedUser = createMockUser({ id: userId, isActive: true });
      mockUsersService.activateUserByScope.mockResolvedValue(activatedUser);

      const result = await controller.activateUserByScope(
        userId,
        countryAdminRequest,
      );

      expect(mockUsersService.activateUserByScope).toHaveBeenCalledWith(
        userId,
        countryAdminRequest.user,
      );
      expect(result).toEqual(activatedUser);
    });
  });

  describe('bulkDeactivateUsersByScope', () => {
    const userIds = ['user-1', 'user-2', 'user-3'];
    const mockRequest = createMockRequest({
      id: 'admin-id',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
    });

    it('should successfully deactivate multiple users', async () => {
      const deactivatedUsers = userIds.map((id) =>
        createMockUser({ id, isActive: false }),
      );
      const mockResult = {
        deactivated: deactivatedUsers,
        failed: [],
      };

      mockUsersService.deactivateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(mockUsersService.deactivateUsersByScope).toHaveBeenCalledWith(
        userIds,
        mockRequest.user,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle partial failures', async () => {
      const deactivatedUsers = [
        createMockUser({ id: 'user-1', isActive: false }),
        createMockUser({ id: 'user-3', isActive: false }),
      ];
      const mockResult = {
        deactivated: deactivatedUsers,
        failed: [
          {
            userId: 'user-2',
            reason:
              'You can only deactivate users within your administrative scope',
          },
        ],
      };

      mockUsersService.deactivateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(result).toEqual(mockResult);
      expect(result.deactivated).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
    });

    it('should handle all failures', async () => {
      const mockResult = {
        deactivated: [],
        failed: userIds.map((id) => ({
          userId: id,
          reason:
            'You can only deactivate users within your administrative scope',
        })),
      };

      mockUsersService.deactivateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(result).toEqual(mockResult);
      expect(result.deactivated).toHaveLength(0);
      expect(result.failed).toHaveLength(3);
    });

    it('should handle empty userIds array', async () => {
      const mockResult = {
        deactivated: [],
        failed: [],
      };

      mockUsersService.deactivateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds: [] },
        mockRequest,
      );

      expect(result).toEqual(mockResult);
    });

    it('should work with hierarchical admin roles', async () => {
      const countryAdminRequest = createMockRequest({
        id: 'country-admin-id',
        role: UserRole.COUNTRY_ADMIN,
        email: 'country@example.com',
        adminScope: '{"countryIds": ["US"]}',
      });

      const mockResult = {
        deactivated: [createMockUser({ id: 'user-1', isActive: false })],
        failed: [],
      };

      mockUsersService.deactivateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds: ['user-1'] },
        countryAdminRequest,
      );

      expect(mockUsersService.deactivateUsersByScope).toHaveBeenCalledWith(
        ['user-1'],
        countryAdminRequest.user,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid user IDs');
      mockUsersService.deactivateUsersByScope.mockRejectedValue(error);

      await expect(
        controller.bulkDeactivateUsersByScope({ userIds }, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.bulkDeactivateUsersByScope({ userIds }, mockRequest),
      ).rejects.toThrow('Invalid user IDs');
    });
  });

  describe('bulkActivateUsersByScope', () => {
    const userIds = ['user-1', 'user-2'];
    const mockRequest = createMockRequest({
      id: 'admin-id',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
    });

    it('should successfully activate multiple users', async () => {
      const activatedUsers = userIds.map((id) =>
        createMockUser({ id, isActive: true }),
      );
      const mockResult = {
        activated: activatedUsers,
        failed: [],
      };

      mockUsersService.activateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkActivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(mockUsersService.activateUsersByScope).toHaveBeenCalledWith(
        userIds,
        mockRequest.user,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle partial failures', async () => {
      const activatedUsers = [createMockUser({ id: 'user-1', isActive: true })];
      const mockResult = {
        activated: activatedUsers,
        failed: [
          {
            userId: 'user-2',
            reason:
              'You can only activate users within your administrative scope',
          },
        ],
      };

      mockUsersService.activateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkActivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(result).toEqual(mockResult);
      expect(result.activated).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
    });

    it('should handle empty userIds array', async () => {
      const mockResult = {
        activated: [],
        failed: [],
      };

      mockUsersService.activateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkActivateUsersByScope(
        { userIds: [] },
        mockRequest,
      );

      expect(result).toEqual(mockResult);
    });

    it('should work with hierarchical admin roles', async () => {
      const stateAdminRequest = createMockRequest({
        id: 'state-admin-id',
        role: UserRole.STATE_ADMIN,
        email: 'state@example.com',
        adminScope: '{"stateIds": ["CA"]}',
      });

      const mockResult = {
        activated: [createMockUser({ id: 'user-1', isActive: true })],
        failed: [],
      };

      mockUsersService.activateUsersByScope.mockResolvedValue(mockResult);

      const result = await controller.bulkActivateUsersByScope(
        { userIds: ['user-1'] },
        stateAdminRequest,
      );

      expect(mockUsersService.activateUsersByScope).toHaveBeenCalledWith(
        ['user-1'],
        stateAdminRequest.user,
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid user IDs');
      mockUsersService.activateUsersByScope.mockRejectedValue(error);

      await expect(
        controller.bulkActivateUsersByScope({ userIds }, mockRequest),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.bulkActivateUsersByScope({ userIds }, mockRequest),
      ).rejects.toThrow('Invalid user IDs');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete deactivation and activation flow', async () => {
      const userId = 'target-user-id';
      const mockRequest = createMockRequest({
        id: 'admin-id',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });

      // Deactivate user
      const deactivatedUser = createMockUser({ id: userId, isActive: false });
      mockUsersService.deactivateUserByScope.mockResolvedValue(deactivatedUser);

      const deactivateResult = await controller.deactivateUserByScope(
        userId,
        mockRequest,
      );
      expect(deactivateResult).toEqual(deactivatedUser);

      // Activate user
      const activatedUser = createMockUser({ id: userId, isActive: true });
      mockUsersService.activateUserByScope.mockResolvedValue(activatedUser);

      const activateResult = await controller.activateUserByScope(
        userId,
        mockRequest,
      );
      expect(activateResult).toEqual(activatedUser);

      // Bulk deactivate
      const bulkDeactivateResult = {
        deactivated: [deactivatedUser],
        failed: [],
      };
      mockUsersService.deactivateUsersByScope.mockResolvedValue(
        bulkDeactivateResult,
      );

      const bulkDeactivate = await controller.bulkDeactivateUsersByScope(
        { userIds: [userId] },
        mockRequest,
      );
      expect(bulkDeactivate).toEqual(bulkDeactivateResult);

      // Bulk activate
      const bulkActivateResult = {
        activated: [activatedUser],
        failed: [],
      };
      mockUsersService.activateUsersByScope.mockResolvedValue(
        bulkActivateResult,
      );

      const bulkActivate = await controller.bulkActivateUsersByScope(
        { userIds: [userId] },
        mockRequest,
      );
      expect(bulkActivate).toEqual(bulkActivateResult);
    });

    it('should handle different admin role scenarios', async () => {
      const userId = 'target-user-id';
      const userIds = [userId];

      const adminScenarios = [
        {
          role: UserRole.ADMIN,
          adminScope: '{}',
          description: 'ADMIN user',
        },
        {
          role: UserRole.COUNTRY_ADMIN,
          adminScope: '{"countryIds": ["US"]}',
          description: 'COUNTRY_ADMIN user',
        },
        {
          role: UserRole.STATE_ADMIN,
          adminScope: '{"stateIds": ["CA"]}',
          description: 'STATE_ADMIN user',
        },
        {
          role: UserRole.CITY_ADMIN,
          adminScope: '{"cityIds": ["SF"]}',
          description: 'CITY_ADMIN user',
        },
      ];

      for (const scenario of adminScenarios) {
        const mockRequest = createMockRequest({
          id: `${scenario.role.toLowerCase()}-id`,
          role: scenario.role,
          email: `${scenario.role.toLowerCase()}@example.com`,
          adminScope: scenario.adminScope,
        });

        const deactivatedUser = createMockUser({ id: userId, isActive: false });
        mockUsersService.deactivateUserByScope.mockResolvedValue(
          deactivatedUser,
        );

        const result = await controller.deactivateUserByScope(
          userId,
          mockRequest,
        );

        expect(result).toEqual(deactivatedUser);
        expect(mockUsersService.deactivateUserByScope).toHaveBeenCalledWith(
          userId,
          mockRequest.user,
        );
      }
    });

    it('should handle error propagation correctly', async () => {
      const userId = 'target-user-id';
      const mockRequest = createMockRequest({
        id: 'admin-id',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });

      const errorScenarios = [
        {
          error: new NotFoundException(`User with ID ${userId} not found`),
          description: 'User not found',
        },
        {
          error: new ForbiddenException(
            'You can only deactivate users within your administrative scope',
          ),
          description: 'Scope violation',
        },
        {
          error: new ForbiddenException(
            'You cannot deactivate users with equal or higher administrative roles',
          ),
          description: 'Role hierarchy violation',
        },
        {
          error: new BadRequestException('Invalid admin scope'),
          description: 'Invalid scope',
        },
      ];

      for (const scenario of errorScenarios) {
        mockUsersService.deactivateUserByScope.mockRejectedValue(
          scenario.error,
        );

        await expect(
          controller.deactivateUserByScope(userId, mockRequest),
        ).rejects.toThrow(scenario.error.constructor);
        await expect(
          controller.deactivateUserByScope(userId, mockRequest),
        ).rejects.toThrow(scenario.error.message);
      }
    });
  });

  describe('Request Validation', () => {
    it('should handle malformed request bodies', async () => {
      const mockRequest = createMockRequest({
        id: 'admin-id',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });

      // Test with invalid userIds format
      const invalidBody = { userIds: 'not-an-array' };

      // This should be handled by NestJS validation pipes, but we test the service call
      mockUsersService.deactivateUsersByScope.mockRejectedValue(
        new BadRequestException('userIds must be an array'),
      );

      await expect(
        controller.bulkDeactivateUsersByScope(invalidBody as any, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle missing request body properties', async () => {
      const mockRequest = createMockRequest({
        id: 'admin-id',
        role: UserRole.ADMIN,
        email: 'admin@example.com',
      });

      const incompleteBody = {}; // Missing userIds

      mockUsersService.deactivateUsersByScope.mockRejectedValue(
        new BadRequestException('userIds is required'),
      );

      await expect(
        controller.bulkDeactivateUsersByScope(
          incompleteBody as any,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
