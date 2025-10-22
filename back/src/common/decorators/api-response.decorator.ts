import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import {
  BadRequestErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
  UnprocessableEntityErrorResponseDto,
  TooManyRequestsErrorResponseDto,
  InternalServerErrorResponseDto,
} from '../dto/error-response.dto';

interface StandardResponseOptions {
  status?: number;
  description?: string;
  dataType?: Type<unknown> | 'array' | 'object';
  message?: string;
  isArray?: boolean;
}

/**
 * Decorator for standard API responses with success/error examples
 * @param dataType - The type of data returned in the response
 * @param options - Additional options for the response
 */
export const ApiStandardResponse = (
  dataType?: Type<unknown>,
  options?: StandardResponseOptions,
) => {
  const decorators: Array<MethodDecorator & ClassDecorator> = [];

  // Add extra models if dataType is provided
  if (dataType) {
    decorators.push(ApiExtraModels(dataType));
  }

  // Success response
  decorators.push(
    ApiResponse({
      status: options?.status || 200,
      description: options?.description || 'Successful response',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: {
            type: 'string',
            example: options?.message || 'Request processed successfully',
          },
          data: dataType
            ? options?.isArray
              ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(dataType) },
                }
              : { $ref: getSchemaPath(dataType) }
            : { type: 'object' },
          timestamp: { type: 'string', example: new Date().toISOString() },
        },
      },
    }),
  );

  return applyDecorators(...decorators);
};

/**
 * Decorator for standard error responses
 */
export const ApiStandardErrorResponses = () => {
  return applyDecorators(
    // Add all error response DTOs to the schema
    ApiExtraModels(
      BadRequestErrorResponseDto,
      UnauthorizedErrorResponseDto,
      ForbiddenErrorResponseDto,
      NotFoundErrorResponseDto,
      ConflictErrorResponseDto,
      UnprocessableEntityErrorResponseDto,
      TooManyRequestsErrorResponseDto,
      InternalServerErrorResponseDto,
    ),
    // 400 Bad Request
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation failed or invalid input',
      type: BadRequestErrorResponseDto,
    }),
    // 401 Unauthorized
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Authentication required',
      type: UnauthorizedErrorResponseDto,
    }),
    // 403 Forbidden
    ApiResponse({
      status: 403,
      description: 'Forbidden - Insufficient permissions',
      type: ForbiddenErrorResponseDto,
    }),
    // 404 Not Found
    ApiResponse({
      status: 404,
      description: 'Not Found - Resource does not exist',
      type: NotFoundErrorResponseDto,
    }),
    // 409 Conflict
    ApiResponse({
      status: 409,
      description:
        'Conflict - Resource already exists or conflicts with current state',
      type: ConflictErrorResponseDto,
    }),
    // 422 Unprocessable Entity
    ApiResponse({
      status: 422,
      description:
        'Unprocessable Entity - Request is well-formed but contains semantic errors',
      type: UnprocessableEntityErrorResponseDto,
    }),
    // 429 Too Many Requests
    ApiResponse({
      status: 429,
      description: 'Too Many Requests - Rate limit exceeded',
      type: TooManyRequestsErrorResponseDto,
    }),
    // 500 Internal Server Error
    ApiResponse({
      status: 500,
      description: 'Internal Server Error - Unexpected server error',
      type: InternalServerErrorResponseDto,
    }),
  );
};

/**
 * Combined decorator for standard success and error responses
 */
export const ApiStandardResponses = (
  dataType?: Type<unknown>,
  options?: StandardResponseOptions,
) => {
  return applyDecorators(
    ApiStandardResponse(dataType, options),
    ApiStandardErrorResponses(),
  );
};
