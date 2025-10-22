import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('catch', () => {
    let mockHost: ArgumentsHost;

    beforeEach(() => {
      mockHost = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as any;
    });

    it('should handle HttpException with string response', () => {
      const exception = new HttpException(
        'Test error message',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Test error message'],
          error: 'HttpException',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Custom error message', error: 'CustomError' },
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: ['Custom error message'],
          error: 'CustomError',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle HttpException with object response without message', () => {
      const exception = new HttpException(
        { error: 'CustomError' },
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.FORBIDDEN,
          message: ['CustomError'],
          error: 'CustomError',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle HttpException with object response using error as message', () => {
      const exception = new HttpException(
        { error: 'Error message' },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.NOT_FOUND,
          message: ['Error message'],
          error: 'Error message',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle HttpException with object response using exception name as error', () => {
      const exception = new HttpException(
        { message: 'Test message' },
        HttpStatus.CONFLICT,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.CONFLICT,
          message: ['Test message'],
          error: 'HttpException',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle non-HttpException errors', () => {
      const error = new Error('Generic error');

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ['Generic error'],
          error: 'Internal Server Error',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle unknown error types', () => {
      const unknownError = 'String error';

      filter.catch(unknownError, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ['Internal Server Error'],
          error: 'Internal Server Error',
        },
        timestamp: expect.any(String),
      });
    });

    it('should handle null/undefined errors', () => {
      filter.catch(null, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ['Internal Server Error'],
          error: 'Internal Server Error',
        },
        timestamp: expect.any(String),
      });
    });

    it('should generate valid timestamp', () => {
      const beforeTime = new Date().getTime();
      const exception = new HttpException('Test', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      const afterTime = new Date().getTime();
      const callArgs = (mockResponse.json as jest.Mock).mock.calls[0][0];
      const timestamp = new Date(callArgs.timestamp).getTime();

      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle different HTTP status codes', () => {
      const statusCodes = [
        HttpStatus.BAD_REQUEST,
        HttpStatus.UNAUTHORIZED,
        HttpStatus.FORBIDDEN,
        HttpStatus.NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ];

      statusCodes.forEach((status) => {
        jest.clearAllMocks();
        const exception = new HttpException('Test message', status);

        filter.catch(exception, mockHost);

        expect(mockResponse.status).toHaveBeenCalledWith(status);
      });
    });
  });
});
