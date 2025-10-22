import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor, ApiResponse } from './response.interceptor';
import { Reflector } from '@nestjs/core';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(async () => {
    const mockReflectorValue = {
      get: jest.fn().mockReturnValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResponseInterceptor,
        {
          provide: Reflector,
          useValue: mockReflectorValue,
        },
      ],
    }).compile();

    interceptor = module.get<ResponseInterceptor<unknown>>(ResponseInterceptor);

    mockExecutionContext = {
      switchToHttp: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(),
    } as jest.Mocked<CallHandler>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should wrap simple data response', (done) => {
      const testData = { id: 1, name: 'Test' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: testData,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle response with message property', (done) => {
      const testData = { message: 'Custom message', id: 1, name: 'Test' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Custom message',
            data: { id: 1, name: 'Test' },
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle response with only message property', (done) => {
      const testData = { message: 'Only message' };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Only message',
            data: { message: 'Only message' },
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle array responses', (done) => {
      const testData = [{ id: 1 }, { id: 2 }];
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: testData,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle null response', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(null));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<null>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: null,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle undefined response', (done) => {
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<undefined>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: undefined,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle primitive responses', (done) => {
      const testData = 'Simple string';
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: testData,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle number responses', (done) => {
      const testData = 42;
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: testData,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle boolean responses', (done) => {
      const testData = true;
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Request processed successfully',
            data: testData,
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should generate valid timestamp', (done) => {
      const beforeTime = new Date().getTime();
      const testData = { id: 1 };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          const afterTime = new Date().getTime();
          const timestamp = new Date(response.timestamp).getTime();

          expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
          expect(timestamp).toBeLessThanOrEqual(afterTime);
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });

    it('should handle complex nested objects', (done) => {
      const testData = {
        user: { id: 1, name: 'John' },
        items: [{ id: 1 }, { id: 2 }],
        message: 'Complex response',
      };
      (mockCallHandler.handle as jest.Mock).mockReturnValue(of(testData));

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (response: ApiResponse<typeof testData>) => {
          expect(response).toEqual({
            success: true,
            message: 'Complex response',
            data: {
              user: { id: 1, name: 'John' },
              items: [{ id: 1 }, { id: 2 }],
            },
            timestamp: expect.any(String) as string,
          });
          done();
        },
        error: (err: unknown) => {
          done(err instanceof Error ? err : new Error(String(err)));
        },
      });
    });
  });

  describe('transformData', () => {
    it('should handle null data', () => {
      const result = interceptor['transformData'](null);
      expect(result).toBeNull();
    });

    it('should handle undefined data', () => {
      const result = interceptor['transformData'](undefined);
      expect(result).toBeUndefined();
    });

    it('should handle array data', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = interceptor['transformData'](data);
      expect(result).toEqual(data);
    });

    it('should handle object data', () => {
      const data = { id: 1, name: 'Test' };
      const result = interceptor['transformData'](data);
      expect(result).toEqual(data);
    });

    it('should handle primitive data', () => {
      expect(interceptor['transformData']('string')).toBe('string');
      expect(interceptor['transformData'](123)).toBe(123);
      expect(interceptor['transformData'](true)).toBe(true);
    });
  });

  describe('isResponseWithMessage', () => {
    it('should return true for objects with message property', () => {
      expect(interceptor['isResponseWithMessage']({ message: 'test' })).toBe(
        true,
      );
      expect(
        interceptor['isResponseWithMessage']({ message: 'test', id: 1 }),
      ).toBe(true);
    });

    it('should return false for objects without message property', () => {
      expect(interceptor['isResponseWithMessage']({ id: 1 })).toBe(false);
      expect(interceptor['isResponseWithMessage']({})).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(interceptor['isResponseWithMessage']('string')).toBe(false);
      expect(interceptor['isResponseWithMessage'](123)).toBe(false);
      expect(interceptor['isResponseWithMessage'](null)).toBe(false);
      expect(interceptor['isResponseWithMessage'](undefined)).toBe(false);
    });

    it('should return false for objects with non-string message', () => {
      expect(interceptor['isResponseWithMessage']({ message: 123 })).toBe(
        false,
      );
      expect(interceptor['isResponseWithMessage']({ message: null })).toBe(
        false,
      );
      expect(interceptor['isResponseWithMessage']({ message: {} })).toBe(false);
    });
  });
});
