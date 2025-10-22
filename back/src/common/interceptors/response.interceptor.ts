import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
  timestamp: string;
}

interface ResponseWithMessage {
  message?: string;
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    // Get custom message from decorator if exists
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data: T) => {
        // Transform the data to apply class-transformer decorators (like @Exclude)
        const transformedData = this.transformData(data);

        // If the response is already formatted with success/message, use it
        if (this.isResponseWithMessage(transformedData)) {
          const { message, ...rest } = transformedData;
          const responseData: T | ResponseWithMessage =
            Object.keys(rest).length > 0 ? rest : transformedData;
          return {
            success: true,
            message:
              customMessage || message || 'Request processed successfully',
            data: responseData as T,
            timestamp: new Date().toISOString(),
          };
        }

        // Otherwise, wrap the response
        return {
          success: true,
          message: customMessage || 'Request processed successfully',
          data: transformedData as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private transformData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    // If data is an array, transform each item
    if (Array.isArray(data)) {
      return data.map((item) => this.transformData(item));
    }

    // If data is an object, apply class-transformer transformation
    if (typeof data === 'object') {
      return instanceToPlain(data, { excludeExtraneousValues: false });
    }

    // For primitives, return as is
    return data;
  }

  private isResponseWithMessage(data: unknown): data is ResponseWithMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as ResponseWithMessage).message === 'string'
    );
  }
}
