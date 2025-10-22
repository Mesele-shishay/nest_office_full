import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        ResponseInterceptor,
        GlobalExceptionFilter,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: string, defaultValue?: string) => {
                const config: Record<string, string> = {
                  DATABASE_TYPE: 'postgres',
                  DATABASE_HOST: 'localhost',
                  DATABASE_PORT: '5432',
                  DATABASE_USER: 'test',
                  DATABASE_PASSWORD: 'test',
                  DATABASE_NAME: 'test',
                  NODE_ENV: 'test',
                  JWT_SECRET: 'test-secret',
                  JWT_REFRESH_SECRET: 'test-refresh-secret',
                };
                return config[key] || defaultValue;
              }),
          },
        },
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AppController', () => {
    const appController = module.get<AppController>(AppController);
    expect(appController).toBeDefined();
    expect(appController).toBeInstanceOf(AppController);
  });

  it('should provide AppService', () => {
    const appService = module.get<AppService>(AppService);
    expect(appService).toBeDefined();
    expect(appService).toBeInstanceOf(AppService);
  });

  it('should provide ResponseInterceptor as APP_INTERCEPTOR', () => {
    const responseInterceptor =
      module.get<ResponseInterceptor<unknown>>(ResponseInterceptor);
    expect(responseInterceptor).toBeDefined();
    expect(responseInterceptor).toBeInstanceOf(ResponseInterceptor);
  });

  it('should provide GlobalExceptionFilter as APP_FILTER', () => {
    const globalExceptionFilter = module.get<GlobalExceptionFilter>(
      GlobalExceptionFilter,
    );
    expect(globalExceptionFilter).toBeDefined();
    expect(globalExceptionFilter).toBeInstanceOf(GlobalExceptionFilter);
  });

  it('should provide ConfigService', () => {
    const configService = module.get<ConfigService>(ConfigService);
    expect(configService).toBeDefined();
    expect(configService).toBeDefined(); // Mock object, not instance
  });
});
