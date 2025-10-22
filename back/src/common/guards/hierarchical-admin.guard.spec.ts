import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HierarchicalAdminGuard } from './hierarchical-admin.guard';
import { UserRole } from '../../users/entities/user.entity';

describe('HierarchicalAdminGuard', () => {
  let guard: HierarchicalAdminGuard;
  let reflector: Reflector;

  const mockExecutionContext = (
    user: any,
    body: any = {},
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          body,
        }),
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HierarchicalAdminGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<HierarchicalAdminGuard>(HierarchicalAdminGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException when user is not authenticated', () => {
      const context = mockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'User not authenticated',
      );
    });

    it('should throw BadRequestException when target role is missing', () => {
      const user = { id: '1', role: UserRole.ADMIN };
      const context = mockExecutionContext(user, {});

      expect(() => guard.canActivate(context)).toThrow(BadRequestException);
      expect(() => guard.canActivate(context)).toThrow(
        'Target role is required',
      );
    });

    describe('ADMIN role permissions', () => {
      const adminUser = { id: '1', role: UserRole.ADMIN };

      it('should allow ADMIN to assign COUNTRY_ADMIN', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.COUNTRY_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow ADMIN to assign STATE_ADMIN', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.STATE_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow ADMIN to assign CITY_ADMIN', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.CITY_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should not allow ADMIN to assign ADMIN', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign ADMIN role',
        );
      });

      it('should not allow ADMIN to assign MANAGER', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.MANAGER,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign MANAGER role',
        );
      });

      it('should not allow ADMIN to assign USER', () => {
        const context = mockExecutionContext(adminUser, {
          role: UserRole.USER,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign USER role',
        );
      });
    });

    describe('COUNTRY_ADMIN role permissions', () => {
      const countryAdminUser = { id: '2', role: UserRole.COUNTRY_ADMIN };

      it('should allow COUNTRY_ADMIN to assign STATE_ADMIN', () => {
        const context = mockExecutionContext(countryAdminUser, {
          role: UserRole.STATE_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should allow COUNTRY_ADMIN to assign CITY_ADMIN', () => {
        const context = mockExecutionContext(countryAdminUser, {
          role: UserRole.CITY_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should not allow COUNTRY_ADMIN to assign COUNTRY_ADMIN', () => {
        const context = mockExecutionContext(countryAdminUser, {
          role: UserRole.COUNTRY_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign COUNTRY_ADMIN role',
        );
      });

      it('should not allow COUNTRY_ADMIN to assign ADMIN', () => {
        const context = mockExecutionContext(countryAdminUser, {
          role: UserRole.ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign ADMIN role',
        );
      });
    });

    describe('STATE_ADMIN role permissions', () => {
      const stateAdminUser = { id: '3', role: UserRole.STATE_ADMIN };

      it('should allow STATE_ADMIN to assign CITY_ADMIN', () => {
        const context = mockExecutionContext(stateAdminUser, {
          role: UserRole.CITY_ADMIN,
        });

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should not allow STATE_ADMIN to assign STATE_ADMIN', () => {
        const context = mockExecutionContext(stateAdminUser, {
          role: UserRole.STATE_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign STATE_ADMIN role',
        );
      });

      it('should not allow STATE_ADMIN to assign COUNTRY_ADMIN', () => {
        const context = mockExecutionContext(stateAdminUser, {
          role: UserRole.COUNTRY_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign COUNTRY_ADMIN role',
        );
      });

      it('should not allow STATE_ADMIN to assign ADMIN', () => {
        const context = mockExecutionContext(stateAdminUser, {
          role: UserRole.ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign ADMIN role',
        );
      });
    });

    describe('Other role permissions', () => {
      it('should not allow CITY_ADMIN to assign any role', () => {
        const cityAdminUser = { id: '4', role: UserRole.CITY_ADMIN };
        const context = mockExecutionContext(cityAdminUser, {
          role: UserRole.CITY_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign CITY_ADMIN role',
        );
      });

      it('should not allow MANAGER to assign any role', () => {
        const managerUser = { id: '5', role: UserRole.MANAGER };
        const context = mockExecutionContext(managerUser, {
          role: UserRole.CITY_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign CITY_ADMIN role',
        );
      });

      it('should not allow USER to assign any role', () => {
        const user = { id: '6', role: UserRole.USER };
        const context = mockExecutionContext(user, {
          role: UserRole.CITY_ADMIN,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'You do not have permission to assign CITY_ADMIN role',
        );
      });
    });
  });

  describe('canAssignRole', () => {
    it('should return correct permissions for ADMIN', () => {
      expect(
        guard['canAssignRole'](UserRole.ADMIN, UserRole.COUNTRY_ADMIN),
      ).toBe(true);
      expect(guard['canAssignRole'](UserRole.ADMIN, UserRole.STATE_ADMIN)).toBe(
        true,
      );
      expect(guard['canAssignRole'](UserRole.ADMIN, UserRole.CITY_ADMIN)).toBe(
        true,
      );
      expect(guard['canAssignRole'](UserRole.ADMIN, UserRole.ADMIN)).toBe(
        false,
      );
      expect(guard['canAssignRole'](UserRole.ADMIN, UserRole.MANAGER)).toBe(
        false,
      );
      expect(guard['canAssignRole'](UserRole.ADMIN, UserRole.USER)).toBe(false);
    });

    it('should return correct permissions for COUNTRY_ADMIN', () => {
      expect(
        guard['canAssignRole'](UserRole.COUNTRY_ADMIN, UserRole.STATE_ADMIN),
      ).toBe(true);
      expect(
        guard['canAssignRole'](UserRole.COUNTRY_ADMIN, UserRole.CITY_ADMIN),
      ).toBe(true);
      expect(
        guard['canAssignRole'](UserRole.COUNTRY_ADMIN, UserRole.COUNTRY_ADMIN),
      ).toBe(false);
      expect(
        guard['canAssignRole'](UserRole.COUNTRY_ADMIN, UserRole.ADMIN),
      ).toBe(false);
    });

    it('should return correct permissions for STATE_ADMIN', () => {
      expect(
        guard['canAssignRole'](UserRole.STATE_ADMIN, UserRole.CITY_ADMIN),
      ).toBe(true);
      expect(
        guard['canAssignRole'](UserRole.STATE_ADMIN, UserRole.STATE_ADMIN),
      ).toBe(false);
      expect(
        guard['canAssignRole'](UserRole.STATE_ADMIN, UserRole.COUNTRY_ADMIN),
      ).toBe(false);
      expect(guard['canAssignRole'](UserRole.STATE_ADMIN, UserRole.ADMIN)).toBe(
        false,
      );
    });

    it('should return false for other roles', () => {
      expect(
        guard['canAssignRole'](UserRole.CITY_ADMIN, UserRole.CITY_ADMIN),
      ).toBe(false);
      expect(
        guard['canAssignRole'](UserRole.MANAGER, UserRole.CITY_ADMIN),
      ).toBe(false);
      expect(guard['canAssignRole'](UserRole.USER, UserRole.CITY_ADMIN)).toBe(
        false,
      );
    });
  });
});
