import { Test, TestingModule } from '@nestjs/testing';
import { GlobalSettingsController } from './global-settings.controller';
import { GlobalSettingsService } from './global-settings.service';

describe('GlobalSettingsController', () => {
  let controller: GlobalSettingsController;
  let service: jest.Mocked<GlobalSettingsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalSettingsController],
      providers: [
        {
          provide: GlobalSettingsService,
          useValue: {
            findAll: jest.fn(),
            findByKey: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(GlobalSettingsController);
    service = module.get(
      GlobalSettingsService,
    ) as jest.Mocked<GlobalSettingsService>;
  });

  it('should delegate getAll to service.findAll', async () => {
    const data = [{ id: '1' }] as any;
    service.findAll.mockResolvedValue(data);
    const result = await controller.getAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toBe(data);
  });

  it('should delegate getOne to service.findByKey', async () => {
    const item = { id: '1' } as any;
    service.findByKey.mockResolvedValue(item);
    const result = await controller.getOne('k');
    expect(service.findByKey).toHaveBeenCalledWith('k');
    expect(result).toBe(item);
  });

  it('should delegate create to service.create', async () => {
    const dto = { key: 'k', type: 'boolean', category: 'features' } as any;
    const saved = { id: '1', ...dto } as any;
    service.create.mockResolvedValue(saved);
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(saved);
  });

  it('should delegate update to service.update', async () => {
    const dto = { description: 'x' } as any;
    const updated = { id: '1' } as any;
    service.update.mockResolvedValue(updated);
    const result = await controller.update('k', dto);
    expect(service.update).toHaveBeenCalledWith('k', dto);
    expect(result).toBe(updated);
  });
});
