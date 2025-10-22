import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OfficeManagementService } from './office-management.service';
import { Office } from '../entities/office.entity';
import { User } from '../../users/entities/user.entity';
import { LocationService } from './location.service';
import { OfficeTypeService } from './office-type.service';
import { CreateOfficeDto, UpdateOfficeDto } from '../dto/office.dto';

describe('OfficeManagementService', () => {
  let service: OfficeManagementService;
  let officeRepository: jest.Mocked<Repository<Office>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let locationService: jest.Mocked<LocationService>;
  let officeTypeService: jest.Mocked<OfficeTypeService>;

  const mockOffice: Office = {
    id: 'office-123',
    name: 'Test Office',
    image: 'test-image.jpg',
    status: 'ACTIVE' as any,
    isTemplate: false,
    qrCode: 'test-qr-code',
    officeTypeId: 'office-type-123',
    latitude: 40.7128,
    longitude: -74.006,
    countryId: 1,
    stateId: 1,
    cityId: 1,
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    deletedAt: null,
    officeType: null,
    managers: [],
    featureGroups: [],
  };

  const mockCreateOfficeDto: CreateOfficeDto = {
    name: 'New Office',
    image: 'new-image.jpg',
    officeTypeId: 'office-type-123',
    latitude: 40.7128,
    longitude: -74.006,
    countryId: 1,
    stateId: 1,
    cityId: 1,
  };

  const mockUpdateOfficeDto: UpdateOfficeDto = {
    name: 'Updated Office',
    image: 'updated-image.jpg',
  };

  beforeEach(async () => {
    const mockOfficeRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockLocationService = {
      validateLocation: jest.fn(),
    };

    const mockOfficeTypeService = {
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeManagementService,
        {
          provide: getRepositoryToken(Office),
          useValue: mockOfficeRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
        {
          provide: OfficeTypeService,
          useValue: mockOfficeTypeService,
        },
      ],
    }).compile();

    service = module.get<OfficeManagementService>(OfficeManagementService);
    officeRepository = module.get(getRepositoryToken(Office));
    userRepository = module.get(getRepositoryToken(User));
    locationService = module.get(LocationService);
    officeTypeService = module.get(OfficeTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOffice', () => {
    it('should create office successfully', async () => {
      const officeId = 'user-123';
      const createdOffice = { ...mockOffice, ...mockCreateOfficeDto };

      officeTypeService.exists.mockResolvedValue(true);
      locationService.validateLocation.mockResolvedValue(undefined);
      officeRepository.create.mockReturnValue(createdOffice as any);
      officeRepository.save.mockResolvedValue(createdOffice as any);

      const result = await service.createOffice(officeId, mockCreateOfficeDto);

      expect(officeTypeService.exists).toHaveBeenCalledWith(
        mockCreateOfficeDto.officeTypeId,
      );
      expect(locationService.validateLocation).toHaveBeenCalledWith(
        mockCreateOfficeDto.countryId,
        mockCreateOfficeDto.stateId,
        mockCreateOfficeDto.cityId,
      );
      expect(officeRepository.create).toHaveBeenCalledWith({
        ...mockCreateOfficeDto,
        createdBy: officeId,
      });
      expect(officeRepository.save).toHaveBeenCalledWith(createdOffice);
      expect(result).toEqual(service['mapToResponseDto'](createdOffice));
    });

    it('should throw NotFoundException when office type does not exist', async () => {
      const officeId = 'user-123';

      officeTypeService.exists.mockResolvedValue(false);

      await expect(
        service.createOffice(officeId, mockCreateOfficeDto),
      ).rejects.toThrow(
        new NotFoundException(
          `Office type with ID ${mockCreateOfficeDto.officeTypeId} not found`,
        ),
      );
    });

    it('should throw error when location validation fails', async () => {
      const officeId = 'user-123';
      const error = new BadRequestException('Invalid location');

      officeTypeService.exists.mockResolvedValue(true);
      locationService.validateLocation.mockRejectedValue(error);

      await expect(
        service.createOffice(officeId, mockCreateOfficeDto),
      ).rejects.toThrow(error);
    });
  });

  describe('getOffices', () => {
    it('should return offices for given office ID', async () => {
      const officeId = 'user-123';
      const offices = [mockOffice];

      officeRepository.find.mockResolvedValue(offices as any);

      const result = await service.getOffices(officeId);

      expect(officeRepository.find).toHaveBeenCalledWith({
        where: { createdBy: officeId },
        relations: ['officeType'],
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(service['mapToResponseDto'](mockOffice));
    });

    it('should return empty array when no offices found', async () => {
      const officeId = 'user-123';

      officeRepository.find.mockResolvedValue([]);

      const result = await service.getOffices(officeId);

      expect(result).toEqual([]);
    });
  });

  describe('getOfficeById', () => {
    it('should return office by ID', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'office-123';

      officeRepository.findOne.mockResolvedValue(mockOffice as any);

      const result = await service.getOfficeById(officeId, targetOfficeId);

      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: targetOfficeId, createdBy: officeId },
        relations: ['officeType'],
      });
      expect(result).toEqual(service['mapToResponseDto'](mockOffice));
    });

    it('should throw NotFoundException when office not found', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getOfficeById(officeId, targetOfficeId),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });
  });

  describe('updateOffice', () => {
    it('should update office successfully', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'office-123';
      const updatedOffice = { ...mockOffice, ...mockUpdateOfficeDto };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      officeRepository.save.mockResolvedValue(updatedOffice as any);

      const result = await service.updateOffice(
        officeId,
        targetOfficeId,
        mockUpdateOfficeDto,
      );

      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: targetOfficeId, createdBy: officeId },
      });
      expect(officeRepository.save).toHaveBeenCalledWith({
        ...mockOffice,
        ...mockUpdateOfficeDto,
        updatedBy: officeId,
      });
      expect(result).toEqual(service['mapToResponseDto'](updatedOffice));
    });

    it('should throw NotFoundException when office not found', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateOffice(officeId, targetOfficeId, mockUpdateOfficeDto),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });

    it('should validate office type when provided in update', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'office-123';
      const updateDtoWithType = {
        ...mockUpdateOfficeDto,
        officeTypeId: 'new-office-type-123',
      };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      officeTypeService.exists.mockResolvedValue(false);

      await expect(
        service.updateOffice(officeId, targetOfficeId, updateDtoWithType),
      ).rejects.toThrow(
        new NotFoundException(
          'Office type with ID new-office-type-123 not found',
        ),
      );
    });
  });

  describe('deleteOffice', () => {
    it('should delete office successfully', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'office-123';

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      officeRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteOffice(officeId, targetOfficeId);

      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: targetOfficeId, createdBy: officeId },
      });
      expect(officeRepository.softDelete).toHaveBeenCalledWith(targetOfficeId);
    });

    it('should throw NotFoundException when office not found', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteOffice(officeId, targetOfficeId),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });
  });

  describe('getOfficeManagementStatistics', () => {
    it('should return office management statistics', async () => {
      const officeId = 'user-123';
      const mockStats = {
        totalOffices: 10,
        activeOffices: 8,
        inactiveOffices: 2,
        templateOffices: 1,
        officesWithQRCodes: 5,
        averageOfficesPerType: 3.33,
      };

      // Mock all count operations
      officeRepository.count
        .mockResolvedValueOnce(10) // totalOffices
        .mockResolvedValueOnce(8) // activeOffices
        .mockResolvedValueOnce(2) // inactiveOffices
        .mockResolvedValueOnce(1) // templateOffices
        .mockResolvedValueOnce(5); // officesWithQRCodes

      // Mock query builder for average calculation
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { officeTypeId: 'type1', count: '5' },
          { officeTypeId: 'type2', count: '3' },
        ]),
      };

      officeRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getOfficeManagementStatistics(officeId);

      expect(result.totalOffices).toBe(10);
      expect(result.activeOffices).toBe(8);
      expect(result.inactiveOffices).toBe(2);
      expect(result.templateOffices).toBe(1);
      expect(result.officesWithQRCodes).toBe(5);
      expect(result.averageOfficesPerType).toBe(4);
    });

    it('should handle empty office types for average calculation', async () => {
      const officeId = 'user-123';

      officeRepository.count.mockResolvedValue(0);
      officeRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.getOfficeManagementStatistics(officeId);

      expect(result.averageOfficesPerType).toBe(0);
    });
  });

  describe('generateOfficeQRCode', () => {
    it('should generate QR code successfully', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'office-123';

      // Create a completely fresh office object for this test
      const freshOffice = {
        id: 'office-123',
        name: 'Test Office',
        image: 'test-image.jpg',
        status: 'ACTIVE' as any,
        isTemplate: false,
        qrCode: 'test-qr-code',
        officeTypeId: 'office-type-123',
        latitude: 40.7128,
        longitude: -74.006,
        countryId: 1,
        stateId: 1,
        cityId: 1,
        createdBy: 'user-123',
        updatedBy: 'user-123',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        deletedAt: null,
        officeType: null,
        managers: [],
        featureGroups: [],
      };

      const updatedOffice = {
        ...freshOffice,
        qrCode: 'office:office-123:Test Office',
      };

      officeRepository.findOne.mockResolvedValue(freshOffice as any);
      officeRepository.save.mockResolvedValue(updatedOffice as any);

      const result = await service.generateOfficeQRCode(
        officeId,
        targetOfficeId,
      );

      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: targetOfficeId, createdBy: officeId },
      });
      expect(officeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'office-123',
          name: 'Test Office',
          qrCode: 'office:office-123:Test Office',
        }),
      );
      expect(result).toEqual({ qrCode: 'office:office-123:Test Office' });
    });

    it('should throw NotFoundException when office not found', async () => {
      const officeId = 'user-123';
      const targetOfficeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.generateOfficeQRCode(officeId, targetOfficeId),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });
  });

  describe('mapToResponseDto', () => {
    it('should map office entity to response DTO', () => {
      const result = service['mapToResponseDto'](mockOffice);

      expect(result).toEqual({
        id: mockOffice.id,
        name: mockOffice.name,
        image: mockOffice.image,
        status: mockOffice.status,
        isTemplate: mockOffice.isTemplate,
        qrCode: mockOffice.qrCode,
        officeTypeId: mockOffice.officeTypeId,
        latitude: mockOffice.latitude,
        longitude: mockOffice.longitude,
        countryId: mockOffice.countryId,
        stateId: mockOffice.stateId,
        cityId: mockOffice.cityId,
        createdBy: mockOffice.createdBy,
        updatedBy: mockOffice.updatedBy,
        createdAt: mockOffice.createdAt,
        updatedAt: mockOffice.updatedAt,
      });
    });
  });
});
