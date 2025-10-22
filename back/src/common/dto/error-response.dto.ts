import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Array of error messages',
    type: [String],
    example: ['email must be an email', 'password is required'],
  })
  message: string[];

  @ApiProperty({
    description: 'Error type name',
    example: 'Bad Request',
  })
  error: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    type: ErrorDetailDto,
  })
  error: ErrorDetailDto;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

// Specific error response DTOs for different status codes
export class BadRequestErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 400,
      message: ['email must be an email', 'password is required'],
      error: 'Bad Request',
    },
  })
  error: {
    statusCode: 400;
    message: string[];
    error: 'Bad Request';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 401,
      message: ['Invalid credentials'],
      error: 'Unauthorized',
    },
  })
  error: {
    statusCode: 401;
    message: string[];
    error: 'Unauthorized';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class ForbiddenErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 403,
      message: ['You do not have permission to access this resource'],
      error: 'Forbidden',
    },
  })
  error: {
    statusCode: 403;
    message: string[];
    error: 'Forbidden';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class NotFoundErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 404,
      message: ['Resource not found'],
      error: 'Not Found',
    },
  })
  error: {
    statusCode: 404;
    message: string[];
    error: 'Not Found';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class ConflictErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 409,
      message: ['Resource already exists'],
      error: 'Conflict',
    },
  })
  error: {
    statusCode: 409;
    message: string[];
    error: 'Conflict';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class UnprocessableEntityErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 422,
      message: ['The request contains invalid data'],
      error: 'Unprocessable Entity',
    },
  })
  error: {
    statusCode: 422;
    message: string[];
    error: 'Unprocessable Entity';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class TooManyRequestsErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 429,
      message: ['Rate limit exceeded. Please try again later'],
      error: 'Too Many Requests',
    },
  })
  error: {
    statusCode: 429;
    message: string[];
    error: 'Too Many Requests';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}

export class InternalServerErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Detailed error information',
    example: {
      statusCode: 500,
      message: ['An unexpected error occurred'],
      error: 'Internal Server Error',
    },
  })
  error: {
    statusCode: 500;
    message: string[];
    error: 'Internal Server Error';
  };

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2025-10-20T17:10:14.235Z',
  })
  timestamp: string;
}
