import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { UsersController } from '../users.controller';
import { User, UserRole } from '../entities/user.entity';
import {
  createMockUser,
  createMockAdmin,
  createMockRequest,
  ADMIN_SCENARIOS,
  SCOPE_TEST_DATA,
  BULK_OPERATION_DATA,
  MOCK_SERVICE_RESPONSES,
  ASSERTION_HELPERS,
} from './deactivation.test-fixtures';

describe('User Deactivation - Integration Tests', () => {
  let service: UsersService;
  let controller: UsersController;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset all mock implementations
    mockUserRepository.findOne.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.findAndCount.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.remove.mockReset();
    mockUserRepository.createQueryBuilder.mockReset();
  });

  afterAll(async () => {
    // Clean up any remaining timers or async operations
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Complete Deactivation Flow', () => {
    it('should handle complete user deactivation and activation cycle', async () => {
      const userId = 'target-user-id';
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const targetUser = createMockUser({ id: userId, isActive: true });
      const deactivatedUser = { ...targetUser, isActive: false };
      const activatedUser = { ...targetUser, isActive: true };

      // Mock repository responses
      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockUserRepository.save
        .mockResolvedValueOnce(deactivatedUser)
        .mockResolvedValueOnce(activatedUser);

      // Step 1: Deactivate user
      const deactivateResult = await controller.deactivateUserByScope(
        userId,
        mockRequest,
      );
      ASSERTION_HELPERS.expectUserDeactivated(deactivateResult);
      ASSERTION_HELPERS.expectServiceCalled(mockUserRepository, 'findOne', {
        where: { id: userId },
        relations: ['office'],
      });

      // Step 2: Activate user
      const activateResult = await controller.activateUserByScope(
        userId,
        mockRequest,
      );
      ASSERTION_HELPERS.expectUserActivated(activateResult);
      ASSERTION_HELPERS.expectServiceCalled(mockUserRepository, 'findOne', {
        where: { id: userId },
        relations: ['office'],
      });

      // Step 3: Bulk deactivate
      const bulkDeactivateResult = await controller.bulkDeactivateUsersByScope(
        { userIds: [userId] },
        mockRequest,
      );
      expect(bulkDeactivateResult.deactivated).toHaveLength(1);
      expect(bulkDeactivateResult.failed).toHaveLength(0);

      // Step 4: Bulk activate
      const bulkActivateResult = await controller.bulkActivateUsersByScope(
        { userIds: [userId] },
        mockRequest,
      );
      expect(bulkActivateResult.activated).toHaveLength(1);
      expect(bulkActivateResult.failed).toHaveLength(0);
    });

    it('should handle mixed success/failure in bulk operations', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const userIds = BULK_OPERATION_DATA.partialSuccess.userIds;
      const successUsers = userIds
        .slice(0, 2)
        .map((id) => createMockUser({ id }));
      const failedUsers = userIds.slice(2).map((id) => createMockUser({ id }));

      // Mock successful deactivations
      successUsers.forEach((user) => {
        mockUserRepository.findOne
          .mockResolvedValueOnce(user)
          .mockResolvedValueOnce(user);
        mockUserRepository.save.mockResolvedValueOnce({
          ...user,
          isActive: false,
        });
      });

      // Mock failed deactivations
      failedUsers.forEach((user) => {
        mockUserRepository.findOne
          .mockResolvedValueOnce(user)
          .mockResolvedValueOnce(user);
        // Simulate scope validation failure
        mockUserRepository.save.mockRejectedValueOnce(
          new ForbiddenException(
            'You can only deactivate users within your administrative scope',
          ),
        );
      });

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );

      expect(result.deactivated).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(
        result.failed.every((failure) =>
          failure.reason.includes('administrative scope'),
        ),
      ).toBe(true);
    });
  });

  describe('Role Hierarchy Validation', () => {
    ADMIN_SCENARIOS.forEach((scenario) => {
      it(`should validate ${scenario.description} permissions correctly`, async () => {
        const adminUser = createMockAdmin(scenario.role, scenario.adminScope);
        const mockRequest = createMockRequest(adminUser);

        // Test roles that can be deactivated
        for (const targetRole of scenario.canDeactivate) {
          const targetUser = createMockUser({
            id: `target-${targetRole.toLowerCase()}`,
            role: targetRole,
            adminScope: targetRole.includes('ADMIN')
              ? targetRole === UserRole.CITY_ADMIN
                ? '{"cityIds": ["SF"]}'
                : targetRole === UserRole.STATE_ADMIN
                  ? '{"stateIds": ["CA"]}'
                  : '{"countryIds": ["US"]}'
              : null,
          });
          const deactivatedUser = { ...targetUser, isActive: false };

          mockUserRepository.findOne.mockResolvedValue(targetUser);
          mockUserRepository.save.mockResolvedValue(deactivatedUser);

          const result = await controller.deactivateUserByScope(
            targetUser.id,
            mockRequest,
          );

          ASSERTION_HELPERS.expectUserDeactivated(result);
        }

        // Test roles that cannot be deactivated
        for (const targetRole of scenario.cannotDeactivate) {
          const targetUser = createMockUser({
            id: `target-${targetRole.toLowerCase()}`,
            role: targetRole,
            adminScope: targetRole.includes('ADMIN')
              ? targetRole === UserRole.CITY_ADMIN
                ? '{"cityIds": ["SF"]}'
                : targetRole === UserRole.STATE_ADMIN
                  ? '{"stateIds": ["CA"]}'
                  : '{"countryIds": ["US"]}'
              : null,
          });

          mockUserRepository.findOne.mockResolvedValue(targetUser);

          await expect(
            controller.deactivateUserByScope(targetUser.id, mockRequest),
          ).rejects.toThrow(ForbiddenException);
        }
      });
    });
  });

  describe('Scope Validation', () => {
    it('should validate COUNTRY_ADMIN scope correctly', async () => {
      const countryAdmin = createMockAdmin(
        UserRole.COUNTRY_ADMIN,
        SCOPE_TEST_DATA.country.valid,
      );
      const mockRequest = createMockRequest(countryAdmin);

      // Valid scope - should succeed
      const targetUser = createMockUser({
        id: 'target-user',
        role: UserRole.USER,
      });
      const deactivatedUser = { ...targetUser, isActive: false };

      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockUserRepository.save.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        targetUser.id,
        mockRequest,
      );

      ASSERTION_HELPERS.expectUserDeactivated(result);
    });

    it('should validate STATE_ADMIN scope correctly', async () => {
      const stateAdmin = createMockAdmin(
        UserRole.STATE_ADMIN,
        SCOPE_TEST_DATA.state.valid,
      );
      const mockRequest = createMockRequest(stateAdmin);

      const targetUser = createMockUser({
        id: 'target-user',
        role: UserRole.USER,
      });
      const deactivatedUser = { ...targetUser, isActive: false };

      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockUserRepository.save.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        targetUser.id,
        mockRequest,
      );

      ASSERTION_HELPERS.expectUserDeactivated(result);
    });

    it('should validate CITY_ADMIN scope correctly', async () => {
      const cityAdmin = createMockAdmin(
        UserRole.CITY_ADMIN,
        SCOPE_TEST_DATA.city.valid,
      );
      const mockRequest = createMockRequest(cityAdmin);

      const targetUser = createMockUser({
        id: 'target-user',
        role: UserRole.USER,
      });
      const deactivatedUser = { ...targetUser, isActive: false };

      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockUserRepository.save.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivateUserByScope(
        targetUser.id,
        mockRequest,
      );

      ASSERTION_HELPERS.expectUserDeactivated(result);
    });

    it('should handle invalid admin scope', async () => {
      const countryAdmin = createMockAdmin(
        UserRole.COUNTRY_ADMIN,
        SCOPE_TEST_DATA.country.malformed,
      );
      const mockRequest = createMockRequest(countryAdmin);

      const targetUser = createMockUser({ id: 'target-user' });
      mockUserRepository.findOne.mockResolvedValue(targetUser);

      await expect(
        controller.deactivateUserByScope(targetUser.id, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Error Handling', () => {
    it('should handle user not found errors', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        controller.deactivateUserByScope('non-existent-id', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle permission denied errors', async () => {
      const regularUser = createMockUser({ role: UserRole.USER });
      const mockRequest = createMockRequest(regularUser);

      const targetUser = createMockUser({ id: 'target-user' });
      mockUserRepository.findOne.mockResolvedValue(targetUser);

      await expect(
        controller.deactivateUserByScope(targetUser.id, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle role hierarchy violations', async () => {
      const stateAdmin = createMockAdmin(
        UserRole.STATE_ADMIN,
        SCOPE_TEST_DATA.state.valid,
      );
      const mockRequest = createMockRequest(stateAdmin);

      const countryAdminUser = createMockUser({
        id: 'country-admin',
        role: UserRole.COUNTRY_ADMIN,
        adminScope: '{"countryIds": ["US"]}',
      });
      mockUserRepository.findOne.mockResolvedValue(countryAdminUser);

      await expect(
        controller.deactivateUserByScope(countryAdminUser.id, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty userIds array in bulk operations', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const deactivateResult = await controller.bulkDeactivateUsersByScope(
        { userIds: [] },
        mockRequest,
      );
      const activateResult = await controller.bulkActivateUsersByScope(
        { userIds: [] },
        mockRequest,
      );

      expect(deactivateResult.deactivated).toHaveLength(0);
      expect(deactivateResult.failed).toHaveLength(0);
      expect(activateResult.activated).toHaveLength(0);
      expect(activateResult.failed).toHaveLength(0);
    });

    it('should handle null/undefined admin scope', async () => {
      const countryAdmin = createMockUser({
        role: UserRole.COUNTRY_ADMIN,
        adminScope: null,
      });
      const mockRequest = createMockRequest(countryAdmin);

      const targetUser = createMockUser({ id: 'target-user' });
      mockUserRepository.findOne.mockResolvedValue(targetUser);

      await expect(
        controller.deactivateUserByScope(targetUser.id, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle malformed JSON in admin scope', async () => {
      const countryAdmin = createMockUser({
        role: UserRole.COUNTRY_ADMIN,
        adminScope: '{"countryIds": ["US", "CA"]', // Missing closing brace
      });
      const mockRequest = createMockRequest(countryAdmin);

      const targetUser = createMockUser({ id: 'target-user' });
      mockUserRepository.findOne.mockResolvedValue(targetUser);

      await expect(
        controller.deactivateUserByScope(targetUser.id, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk operations with many users efficiently', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
      const users = userIds.map((id) => createMockUser({ id }));

      // Mock all successful operations
      users.forEach((user) => {
        mockUserRepository.findOne
          .mockResolvedValueOnce(user)
          .mockResolvedValueOnce(user);
        mockUserRepository.save.mockResolvedValueOnce({
          ...user,
          isActive: false,
        });
      });

      const startTime = Date.now();
      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );
      const endTime = Date.now();

      ASSERTION_HELPERS.expectBulkResult(result, 100, 0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data integrity during bulk operations', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const userIds = ['user-1', 'user-2', 'user-3'];
      const users = userIds.map((id) => createMockUser({ id }));

      // Mock successful deactivations
      users.forEach((user) => {
        mockUserRepository.findOne
          .mockResolvedValueOnce(user)
          .mockResolvedValueOnce(user);
        mockUserRepository.save.mockResolvedValueOnce({
          ...user,
          isActive: false,
        });
      });

      const result = await controller.bulkDeactivateUsersByScope(
        { userIds },
        mockRequest,
      );

      // Verify all users were properly deactivated
      result.deactivated.forEach((user) => {
        ASSERTION_HELPERS.expectUserDeactivated(user);
        expect(userIds).toContain(user.id);
      });

      // Verify no users were lost
      expect(result.deactivated).toHaveLength(userIds.length);
      expect(result.failed).toHaveLength(0);
    });

    it('should preserve user data during activation/deactivation', async () => {
      const adminUser = createMockAdmin(UserRole.ADMIN, '{}');
      const mockRequest = createMockRequest(adminUser);

      const originalUser = createMockUser({
        id: 'target-user',
        email: 'original@example.com',
        firstName: 'Original',
        lastName: 'Name',
        role: UserRole.USER,
        officeId: 'office-123',
      });

      const deactivatedUser = { ...originalUser, isActive: false };
      const activatedUser = { ...originalUser, isActive: true };

      mockUserRepository.findOne.mockResolvedValue(originalUser);
      mockUserRepository.save
        .mockResolvedValueOnce(deactivatedUser)
        .mockResolvedValueOnce(activatedUser);

      // Deactivate
      const deactivateResult = await controller.deactivateUserByScope(
        originalUser.id,
        mockRequest,
      );

      // Verify only isActive changed
      expect(deactivateResult.id).toBe(originalUser.id);
      expect(deactivateResult.email).toBe(originalUser.email);
      expect(deactivateResult.firstName).toBe(originalUser.firstName);
      expect(deactivateResult.lastName).toBe(originalUser.lastName);
      expect(deactivateResult.role).toBe(originalUser.role);
      expect(deactivateResult.officeId).toBe(originalUser.officeId);
      expect(deactivateResult.isActive).toBe(false);

      // Activate
      const activateResult = await controller.activateUserByScope(
        originalUser.id,
        mockRequest,
      );

      // Verify only isActive changed
      expect(activateResult.id).toBe(originalUser.id);
      expect(activateResult.email).toBe(originalUser.email);
      expect(activateResult.firstName).toBe(originalUser.firstName);
      expect(activateResult.lastName).toBe(originalUser.lastName);
      expect(activateResult.role).toBe(originalUser.role);
      expect(activateResult.officeId).toBe(originalUser.officeId);
      expect(activateResult.isActive).toBe(true);
    });
  });
});
