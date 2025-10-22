import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureGuard } from './feature.guard';
import { OfficeFeatureGroupService } from '../../office-features/services/office-feature-group.service';

describe('FeatureGuard', () => {
  let guard: FeatureGuard;
  let reflector: Reflector;
  let officeFeatureGroupService: jest.Mocked<OfficeFeatureGroupService>;

  const mockExecutionContext = (
    request: any,
    handler?: any,
    classRef?: any,
  ) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => handler,
      getClass: () => classRef,
    } as ExecutionContext;
    return context;
  };

  beforeEach(async () => {
    const mockOfficeFeatureGroupService = {
      isFeatureActiveForOffice: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: OfficeFeatureGroupService,
          useValue: mockOfficeFeatureGroupService,
        },
      ],
    }).compile();

    guard = module.get<FeatureGuard>(FeatureGuard);
    reflector = module.get<Reflector>(Reflector);
    officeFeatureGroupService = module.get(OfficeFeatureGroupService);

    // Mock the logger to prevent error logs during tests
    jest.spyOn(guard['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no feature is required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = mockExecutionContext({});
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when officeId is not found', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');

      const context = mockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Office context required for feature access'),
      );
    });

    it('should extract officeId from query parameters', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = { query: { officeId: 'office-123' } };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).toHaveBeenCalledWith('office-123', 'Office Management');
    });

    it('should extract officeId from request body', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = { body: { officeId: 'office-456' } };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).toHaveBeenCalledWith('office-456', 'Office Management');
    });

    it('should extract officeId from route parameters', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = { params: { officeId: 'office-789' } };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).toHaveBeenCalledWith('office-789', 'Office Management');
    });

    it('should extract officeId from user context', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = { user: { officeId: 'office-user-123' } };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).toHaveBeenCalledWith('office-user-123', 'Office Management');
    });

    it('should throw ForbiddenException when feature is not active', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        false,
      );

      const request = { query: { officeId: 'office-123' } };
      const context = mockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          "Feature 'Office Management' is not available for this office",
        ),
      );
    });

    it('should return true when feature is active', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = { query: { officeId: 'office-123' } };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should handle service errors and throw ForbiddenException', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockRejectedValue(
        new Error('Database connection failed'),
      );

      const request = { query: { officeId: 'office-123' } };
      const context = mockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Unable to verify feature access'),
      );
    });

    it('should re-throw ForbiddenException from service', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      const forbiddenError = new ForbiddenException('Office not found');
      officeFeatureGroupService.isFeatureActiveForOffice.mockRejectedValue(
        forbiddenError,
      );

      const request = { query: { officeId: 'office-123' } };
      const context = mockExecutionContext(request);

      await expect(guard.canActivate(context)).rejects.toThrow(forbiddenError);
    });

    it('should prioritize query params over other sources', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue('Office Management');
      officeFeatureGroupService.isFeatureActiveForOffice.mockResolvedValue(
        true,
      );

      const request = {
        query: { officeId: 'office-query' },
        body: { officeId: 'office-body' },
        params: { officeId: 'office-params' },
        user: { officeId: 'office-user' },
      };
      const context = mockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(
        officeFeatureGroupService.isFeatureActiveForOffice,
      ).toHaveBeenCalledWith('office-query', 'Office Management');
    });
  });

  describe('extractOfficeId', () => {
    it('should return null when no officeId is found', () => {
      const request = {};
      const context = mockExecutionContext(request);

      // Access private method through any type
      const result = (guard as any).extractOfficeId(request);

      expect(result).toBeNull();
    });

    it('should return officeId from query params', () => {
      const request = { query: { officeId: 'test-office' } };

      const result = (guard as any).extractOfficeId(request);

      expect(result).toBe('test-office');
    });

    it('should return officeId from body', () => {
      const request = { body: { officeId: 'body-office' } };

      const result = (guard as any).extractOfficeId(request);

      expect(result).toBe('body-office');
    });

    it('should return officeId from params', () => {
      const request = { params: { officeId: 'params-office' } };

      const result = (guard as any).extractOfficeId(request);

      expect(result).toBe('params-office');
    });

    it('should return officeId from user', () => {
      const request = { user: { officeId: 'user-office' } };

      const result = (guard as any).extractOfficeId(request);

      expect(result).toBe('user-office');
    });
  });
});
