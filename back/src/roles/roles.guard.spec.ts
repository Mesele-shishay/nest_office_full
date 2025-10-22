import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from './role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as any;
    });

    it('should return true when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should return true when user has required role', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockRequest = {
        user: { role: UserRole.ADMIN },
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple required roles', () => {
      const requiredRoles = [UserRole.ADMIN, UserRole.USER];
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should return false when user role is not in required roles list', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should handle empty required roles array', () => {
      const requiredRoles: UserRole[] = [];
      const mockRequest = {
        user: { role: UserRole.USER },
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should handle missing user in request', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockRequest = {};

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockContext)).toThrow();
    });

    it('should handle missing user role', () => {
      const requiredRoles = [UserRole.ADMIN];
      const mockRequest = {
        user: {},
      };

      mockReflector.getAllAndOverride.mockReturnValue(requiredRoles);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);

      const result = guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });
});
