import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerApiResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponse } from './common/interceptors/response.interceptor';
import { Public } from './common/decorators/public.decorator';
import { ResponseMessage } from './common/decorators/response-message.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ResponseMessage('Welcome to Nest Office API')
  @ApiOperation({
    summary: '🌐 [Public] Root health check',
    description:
      '**No Authentication Required**\n\nReturns the health status of the application',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        success: true,
        message: 'Welcome to Nest Office API',
        data: { message: 'API is running' },
        statusCode: 200,
        timestamp: '2025-10-18T12:00:00.000Z',
      },
    },
  })
  getHealth(): ApiResponse<{ message: string }> | string {
    return this.appService.getHealth();
  }

  @Public()
  @Get('health')
  @ResponseMessage('Health check successful')
  @ApiOperation({
    summary: '🌐 [Public] Detailed health check',
    description:
      '**No Authentication Required**\n\nReturns detailed health status with timestamp',
  })
  @SwaggerApiResponse({
    status: 200,
    description: 'Health check response',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2025-10-18T12:00:00.000Z',
      },
    },
  })
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
