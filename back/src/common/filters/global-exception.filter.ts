import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string[];
    error: string;
  };
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'Internal Server Error';
    let messageArray: string[] = ['Internal Server Error'];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle different types of exception responses
      if (typeof exceptionResponse === 'string') {
        messageArray = [exceptionResponse];
        errorName = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>;

        // Handle validation errors (BadRequestException with validation details)
        if (
          exception instanceof BadRequestException &&
          Array.isArray(responseObj.message)
        ) {
          messageArray = responseObj.message as string[];
          errorName = 'Bad Request';
        } else {
          // Handle other structured responses
          const extractedMessage = responseObj.message as string | string[];
          if (Array.isArray(extractedMessage)) {
            messageArray = extractedMessage;
          } else if (typeof extractedMessage === 'string') {
            messageArray = [extractedMessage];
          } else {
            // Fallback to error field or exception name
            const fallbackMessage =
              (responseObj.error as string) || exception.name;
            messageArray = [fallbackMessage];
          }

          errorName = (responseObj.error as string) || exception.name;
        }
      }
    } else if (exception instanceof Error) {
      // Handle non-HTTP exceptions
      messageArray = [exception.message];
      errorName = exception.name;
    }

    // Map status codes to appropriate error names if not already set
    if (errorName === 'Internal Server Error' || errorName === 'Error') {
      errorName = this.getErrorNameFromStatus(status);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        statusCode: status,
        message: messageArray,
        error: errorName,
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }

  private getErrorNameFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      406: 'Not Acceptable',
      407: 'Proxy Authentication Required',
      408: 'Request Timeout',
      409: 'Conflict',
      410: 'Gone',
      411: 'Length Required',
      412: 'Precondition Failed',
      413: 'Payload Too Large',
      414: 'URI Too Long',
      415: 'Unsupported Media Type',
      416: 'Range Not Satisfiable',
      417: 'Expectation Failed',
      418: "I'm a teapot",
      421: 'Misdirected Request',
      422: 'Unprocessable Entity',
      423: 'Locked',
      424: 'Failed Dependency',
      425: 'Too Early',
      426: 'Upgrade Required',
      428: 'Precondition Required',
      429: 'Too Many Requests',
      431: 'Request Header Fields Too Large',
      451: 'Unavailable For Legal Reasons',
      500: 'Internal Server Error',
      501: 'Not Implemented',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
      505: 'HTTP Version Not Supported',
      506: 'Variant Also Negotiates',
      507: 'Insufficient Storage',
      508: 'Loop Detected',
      510: 'Not Extended',
      511: 'Network Authentication Required',
    };

    return statusMap[status] || 'Unknown Error';
  }
}
