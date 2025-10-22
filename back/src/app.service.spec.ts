import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return "System is running"', () => {
      const result = service.getHealth();
      expect(result).toBe('System is running');
    });

    it('should return a string', () => {
      const result = service.getHealth();
      expect(typeof result).toBe('string');
    });

    it('should return consistent result', () => {
      const result1 = service.getHealth();
      const result2 = service.getHealth();
      expect(result1).toBe(result2);
    });
  });
});
