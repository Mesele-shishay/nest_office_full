/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { GlobalSettingsService } from './global-settings.service';
import { GlobalSettings } from './entities/global-settings.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateGlobalSettingDto } from './dto/create-global-setting.dto';
import { UpdateGlobalSettingDto } from './dto/update-global-setting.dto';

type MockRepo<T extends ObjectLiteral = ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepo = (): MockRepo<GlobalSettings> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('GlobalSettingsService', () => {
  let service: GlobalSettingsService;
  let repo: MockRepo<GlobalSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalSettingsService,
        {
          provide: getRepositoryToken(GlobalSettings),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get(GlobalSettingsService);
    repo = module.get(getRepositoryToken(GlobalSettings));
  });

  describe('create', () => {
    it('should create a new setting when key is unique', async () => {
      const dto: CreateGlobalSettingDto = {
        key: 'feature.enableBeta',
        type: 'boolean' as const,
        category: 'features' as const,
        value: 'true',
      };
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create as jest.Mock).mockImplementation(
        (v: Partial<GlobalSettings>) => v as GlobalSettings,
      );
      const saved = { id: 'uuid', ...dto } as GlobalSettings;
      (repo.save as jest.Mock).mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { key: dto.key } });
      expect(repo.create).toHaveBeenCalledWith({ ...dto });
      expect(repo.save).toHaveBeenCalledWith({ ...dto });
      expect(result).toEqual(saved);
    });

    it('should throw BadRequestException when key exists', async () => {
      const dto: CreateGlobalSettingDto = {
        key: 'feature.enableBeta',
        type: 'boolean' as const,
        category: 'features' as const,
      };
      (repo.findOne as jest.Mock).mockResolvedValue({ id: '1', key: dto.key });

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all settings ordered by category and key', async () => {
      const data = [
        { id: '1', key: 'a', category: 'features' },
        { id: '2', key: 'b', category: 'system' },
      ] as unknown as GlobalSettings[];
      (repo.find as jest.Mock).mockResolvedValue(data);

      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        order: { category: 'ASC', key: 'ASC' },
      });
      expect(result).toBe(data);
    });
  });

  describe('findByKey', () => {
    it('should return a setting when found', async () => {
      const setting = { id: '1', key: 'feature.enableBeta' } as GlobalSettings;
      (repo.findOne as jest.Mock).mockResolvedValue(setting);

      const result = await service.findByKey('feature.enableBeta');
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { key: 'feature.enableBeta' },
      });
      expect(result).toBe(setting);
    });

    it('should throw NotFoundException when not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findByKey('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getParsedByKey', () => {
    it('should return null when setting not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const result = await service.getParsedByKey('missing');
      expect(result).toBeNull();
    });

    it('should return parsed value via entity method', async () => {
      const entity = {
        getParsedValue: jest.fn().mockReturnValue(true),
      } as unknown as GlobalSettings;
      (repo.findOne as jest.Mock).mockResolvedValue(entity);
      const result = await service.getParsedByKey('feature.enableBeta');
      expect(entity.getParsedValue).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('should update fields and save', async () => {
      const existing = {
        key: 'feature.enableBeta',
        setValue: jest.fn(),
      } as unknown as GlobalSettings;
      jest.spyOn(service, 'findByKey').mockResolvedValue(existing);
      (repo.save as jest.Mock).mockImplementation(
        (v: GlobalSettings) => v as GlobalSettings,
      );

      const dto: UpdateGlobalSettingDto = {
        description: 'desc',
        value: 'false',
      };
      const result = await service.update('feature.enableBeta', dto);
      expect(existing.setValue).toHaveBeenCalledWith('false');
      // ensure value is removed from dto before assign
      expect(result.description).toBe('desc');
      expect(repo.save).toHaveBeenCalledWith(existing);
    });
  });

  describe('upsert', () => {
    it('should create when not existing', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      (repo.create as jest.Mock).mockImplementation(
        (v: Partial<GlobalSettings>) => v as GlobalSettings,
      );
      (repo.save as jest.Mock).mockImplementation(
        (v: GlobalSettings) => v as GlobalSettings,
      );

      const dto: CreateGlobalSettingDto = {
        key: 'feature.enableBeta',
        type: 'boolean',
        category: 'features',
      };
      const result = await service.upsert('feature.enableBeta', dto);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(dto);
    });

    it('should update when existing', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue({ id: '1', key: 'k' });
      const spy = jest
        .spyOn(service, 'update')
        .mockResolvedValue({ id: '1' } as unknown as GlobalSettings);

      const dto: UpdateGlobalSettingDto = { description: 'x' };
      await service.upsert('k', dto);
      expect(spy).toHaveBeenCalledWith('k', dto);
    });
  });
});
