import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should be an instance of JwtAuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
    });
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn(),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should have canActivate method', () => {
      expect(typeof guard.canActivate).toBe('function');
    });
  });
});
