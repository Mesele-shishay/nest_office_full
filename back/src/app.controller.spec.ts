import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health message from service', () => {
      const expectedMessage = 'System is running';
      jest.spyOn(appService, 'getHealth').mockReturnValue(expectedMessage);

      const result = appController.getHealth();

      expect(result).toBe(expectedMessage);
      expect(appService.getHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('healthCheck', () => {
    it('should return health status with timestamp', () => {
      const result = appController.healthCheck();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return current timestamp', () => {
      const beforeCall = new Date();
      const result = appController.healthCheck();
      const afterCall = new Date();

      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });
});
