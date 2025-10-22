import { Test, TestingModule } from '@nestjs/testing';
import { OfficeManagementController } from './office-management.controller';
import { OfficeManagementService } from '../services/office-management.service';
import { OfficeFeatureGroupService } from '../../office-features/services/office-feature-group.service';
import { GranularFeatureRegistryService } from '../../office-features/services/granular-feature-registry.service';
import { CreateOfficeDto, UpdateOfficeDto } from '../dto/office.dto';

describe('OfficeManagementController', () => {
  let controller: OfficeManagementController;
  let service: jest.Mocked<OfficeManagementService>;

  const mockOfficeResponse = {
    id: 'office-123',
    name: 'Test Office',
    image: 'test-image.jpg',
    status: 'ACTIVE',
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

  const mockStatistics = {
    totalOffices: 10,
    activeOffices: 8,
    inactiveOffices: 2,
    templateOffices: 1,
    officesWithQRCodes: 5,
    averageOfficesPerType: 3.33,
  };

  const mockRequest = {
    user: { id: 'user-123', email: 'admin@example.com', role: 'ADMIN' },
  };

  beforeEach(async () => {
    const mockOfficeManagementService = {
      createOffice: jest.fn(),
      getOffices: jest.fn(),
      getOfficeById: jest.fn(),
      updateOffice: jest.fn(),
      deleteOffice: jest.fn(),
      getOfficeManagementStatistics: jest.fn(),
      generateOfficeQRCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficeManagementController],
      providers: [
        {
          provide: OfficeManagementService,
          useValue: mockOfficeManagementService,
        },
        {
          provide: OfficeFeatureGroupService,
          useValue: {
            isFeatureActiveForOffice: jest.fn(),
          },
        },
        {
          provide: GranularFeatureRegistryService,
          useValue: {
            isGranularFeatureRegistered: jest.fn().mockReturnValue(true),
            executeGranularFeature: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OfficeManagementController>(
      OfficeManagementController,
    );
    service = module.get(OfficeManagementService);

    // Mock the logger to prevent error logs during tests
    jest.spyOn(controller['logger'], 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOffice', () => {
    it('should create office successfully', async () => {
      const officeId = 'office-123';

      service.createOffice.mockResolvedValue(mockOfficeResponse);

      const result = await controller.createOffice(
        mockCreateOfficeDto,
        officeId,
        mockRequest,
      );

      expect(service.createOffice).toHaveBeenCalledWith(
        officeId,
        mockCreateOfficeDto,
      );
      expect(result).toEqual(mockOfficeResponse);
    });

    it('should throw error when officeId is missing', async () => {
      await expect(
        controller.createOffice(mockCreateOfficeDto, '', mockRequest),
      ).rejects.toThrow('Office ID is required');
    });

    it('should propagate service errors', async () => {
      const officeId = 'office-123';
      const error = new Error('Service error');

      service.createOffice.mockRejectedValue(error);

      await expect(
        controller.createOffice(mockCreateOfficeDto, officeId, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('getOffices', () => {
    it('should return offices successfully', async () => {
      const officeId = 'office-123';
      const offices = [mockOfficeResponse];

      service.getOffices.mockResolvedValue(offices);

      const result = await controller.getOffices(officeId, mockRequest);

      expect(service.getOffices).toHaveBeenCalledWith(officeId);
      expect(result).toEqual(offices);
    });

    it('should throw error when officeId is missing', async () => {
      await expect(controller.getOffices('', mockRequest)).rejects.toThrow(
        'Office ID is required',
      );
    });
  });

  describe('getOfficeManagementStatistics', () => {
    it('should return office management statistics', async () => {
      const officeId = 'office-123';

      service.getOfficeManagementStatistics.mockResolvedValue(mockStatistics);

      const result = await controller.getOfficeManagementStatistics(
        officeId,
        mockRequest,
      );

      expect(service.getOfficeManagementStatistics).toHaveBeenCalledWith(
        officeId,
      );
      expect(result).toEqual(mockStatistics);
    });

    it('should throw error when officeId is missing', async () => {
      await expect(
        controller.getOfficeManagementStatistics('', mockRequest),
      ).rejects.toThrow('Office ID is required');
    });
  });

  describe('getOfficeById', () => {
    it('should return office by ID', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';

      service.getOfficeById.mockResolvedValue(mockOfficeResponse);

      const result = await controller.getOfficeById(
        targetOfficeId,
        officeId,
        mockRequest,
      );

      expect(service.getOfficeById).toHaveBeenCalledWith(
        officeId,
        targetOfficeId,
      );
      expect(result).toEqual(mockOfficeResponse);
    });

    it('should throw error when officeId is missing', async () => {
      const targetOfficeId = 'target-office-123';

      await expect(
        controller.getOfficeById(targetOfficeId, '', mockRequest),
      ).rejects.toThrow('Office ID is required');
    });

    it('should propagate service errors', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const error = new Error('Service error');

      service.getOfficeById.mockRejectedValue(error);

      await expect(
        controller.getOfficeById(targetOfficeId, officeId, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('updateOffice', () => {
    it('should update office successfully', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const updatedOffice = { ...mockOfficeResponse, name: 'Updated Office' };

      service.updateOffice.mockResolvedValue(updatedOffice);

      const result = await controller.updateOffice(
        targetOfficeId,
        mockUpdateOfficeDto,
        officeId,
        mockRequest,
      );

      expect(service.updateOffice).toHaveBeenCalledWith(
        officeId,
        targetOfficeId,
        mockUpdateOfficeDto,
      );
      expect(result).toEqual(updatedOffice);
    });

    it('should throw error when officeId is missing', async () => {
      const targetOfficeId = 'target-office-123';

      await expect(
        controller.updateOffice(
          targetOfficeId,
          mockUpdateOfficeDto,
          '',
          mockRequest,
        ),
      ).rejects.toThrow('Office ID is required');
    });

    it('should propagate service errors', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const error = new Error('Service error');

      service.updateOffice.mockRejectedValue(error);

      await expect(
        controller.updateOffice(
          targetOfficeId,
          mockUpdateOfficeDto,
          officeId,
          mockRequest,
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteOffice', () => {
    it('should delete office successfully', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';

      service.deleteOffice.mockResolvedValue(undefined);

      const result = await controller.deleteOffice(
        targetOfficeId,
        officeId,
        mockRequest,
      );

      expect(service.deleteOffice).toHaveBeenCalledWith(
        officeId,
        targetOfficeId,
      );
      expect(result).toBeUndefined();
    });

    it('should throw error when officeId is missing', async () => {
      const targetOfficeId = 'target-office-123';

      await expect(
        controller.deleteOffice(targetOfficeId, '', mockRequest),
      ).rejects.toThrow('Office ID is required');
    });

    it('should propagate service errors', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const error = new Error('Service error');

      service.deleteOffice.mockRejectedValue(error);

      await expect(
        controller.deleteOffice(targetOfficeId, officeId, mockRequest),
      ).rejects.toThrow(error);
    });
  });

  describe('generateOfficeQRCode', () => {
    it('should generate QR code successfully', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const qrCodeResult = { qrCode: 'office:target-office-123:Test Office' };

      service.generateOfficeQRCode.mockResolvedValue(qrCodeResult);

      const result = await controller.generateOfficeQRCode(
        targetOfficeId,
        officeId,
        mockRequest,
      );

      expect(service.generateOfficeQRCode).toHaveBeenCalledWith(
        officeId,
        targetOfficeId,
      );
      expect(result).toEqual(qrCodeResult);
    });

    it('should throw error when officeId is missing', async () => {
      const targetOfficeId = 'target-office-123';

      await expect(
        controller.generateOfficeQRCode(targetOfficeId, '', mockRequest),
      ).rejects.toThrow('Office ID is required');
    });

    it('should propagate service errors', async () => {
      const officeId = 'office-123';
      const targetOfficeId = 'target-office-123';
      const error = new Error('Service error');

      service.generateOfficeQRCode.mockRejectedValue(error);

      await expect(
        controller.generateOfficeQRCode(targetOfficeId, officeId, mockRequest),
      ).rejects.toThrow(error);
    });
  });
});
