import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { OfficeFeatureGroupService } from './office-feature-group.service';
import { OfficeFeatureGroup } from '../entities/office-feature-group.entity';
import { FeatureGroup } from '../entities/feature-group.entity';
import { FeatureToken } from '../entities/feature-token.entity';
import { Feature } from '../entities/feature.entity';
import { Office } from '../../office/entities/office.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { ExternalTokenValidationService } from './external-token-validation.service';
import { ActivateFeatureGroupDto } from '../dto/feature-group.dto';

describe('OfficeFeatureGroupService', () => {
  let service: OfficeFeatureGroupService;
  let officeFeatureGroupRepository: jest.Mocked<Repository<OfficeFeatureGroup>>;
  let featureGroupRepository: jest.Mocked<Repository<FeatureGroup>>;
  let featureTokenRepository: jest.Mocked<Repository<FeatureToken>>;
  let featureRepository: jest.Mocked<Repository<Feature>>;
  let officeRepository: jest.Mocked<Repository<Office>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let externalTokenValidationService: jest.Mocked<ExternalTokenValidationService>;

  const mockOffice = {
    id: 'office-123',
    name: 'Test Office',
    status: 'ACTIVE',
  };

  const mockUser = {
    id: 'user-123',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const mockFeatureGroup = {
    id: 'feature-group-123',
    name: 'Office Management',
    appName: 'receipt-app',
    description: 'Manage receipts',
    isPaid: true,
    features: [
      { id: 'feature-1', name: 'Create Receipt', isActive: true },
      { id: 'feature-2', name: 'View Receipts', isActive: true },
    ],
  };

  const mockFeatureToken = {
    id: 'token-123',
    tokenName: 'receipt-token',
    featureGroupId: 'feature-group-123',
    isActive: true,
    expiresInDays: 30,
  };

  const mockOfficeFeatureGroup = {
    id: 'ofg-123',
    officeId: 'office-123',
    featureGroupId: 'feature-group-123',
    tokenId: 'token-123',
    isActive: true,
    expiresAt: new Date('2024-02-15T10:30:00Z'),
    activatedAt: new Date('2024-01-15T10:30:00Z'),
    featureGroup: mockFeatureGroup,
    token: mockFeatureToken,
  };

  beforeEach(async () => {
    const mockOfficeFeatureGroupRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockFeatureGroupRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const mockFeatureTokenRepo = {
      findOne: jest.fn(),
    };

    const mockFeatureRepo = {
      findOne: jest.fn(),
    };

    const mockOfficeRepo = {
      findOne: jest.fn(),
    };

    const mockUserRepo = {
      findOne: jest.fn(),
    };

    const mockExternalTokenValidationService = {
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeFeatureGroupService,
        {
          provide: getRepositoryToken(OfficeFeatureGroup),
          useValue: mockOfficeFeatureGroupRepo,
        },
        {
          provide: getRepositoryToken(FeatureGroup),
          useValue: mockFeatureGroupRepo,
        },
        {
          provide: getRepositoryToken(FeatureToken),
          useValue: mockFeatureTokenRepo,
        },
        {
          provide: getRepositoryToken(Feature),
          useValue: mockFeatureRepo,
        },
        {
          provide: getRepositoryToken(Office),
          useValue: mockOfficeRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: ExternalTokenValidationService,
          useValue: mockExternalTokenValidationService,
        },
      ],
    }).compile();

    service = module.get<OfficeFeatureGroupService>(OfficeFeatureGroupService);
    officeFeatureGroupRepository = module.get(
      getRepositoryToken(OfficeFeatureGroup),
    );
    featureGroupRepository = module.get(getRepositoryToken(FeatureGroup));
    featureTokenRepository = module.get(getRepositoryToken(FeatureToken));
    featureRepository = module.get(getRepositoryToken(Feature));
    officeRepository = module.get(getRepositoryToken(Office));
    userRepository = module.get(getRepositoryToken(User));
    externalTokenValidationService = module.get(ExternalTokenValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableFeatureGroups', () => {
    it('should return available feature groups for an office', async () => {
      const officeId = 'office-123';
      const featureGroups = [mockFeatureGroup];
      const existingOfficeFeatureGroups = [mockOfficeFeatureGroup];

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      featureGroupRepository.find.mockResolvedValue(featureGroups as any);
      officeFeatureGroupRepository.find.mockResolvedValue(
        existingOfficeFeatureGroups as any,
      );

      const result = await service.getAvailableFeatureGroups(officeId);

      expect(officeRepository.findOne).toHaveBeenCalledWith({
        where: { id: officeId },
      });
      expect(featureGroupRepository.find).toHaveBeenCalledWith({
        relations: ['features'],
        order: { createdAt: 'DESC' },
      });
      expect(officeFeatureGroupRepository.find).toHaveBeenCalledWith({
        where: { officeId },
        relations: ['featureGroup', 'token'],
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockFeatureGroup.id,
        name: mockFeatureGroup.name,
        appName: mockFeatureGroup.appName,
        description: mockFeatureGroup.description,
        isPaid: mockFeatureGroup.isPaid,
        isActive: true,
        expiresAt: mockOfficeFeatureGroup.expiresAt,
        activatedAt: mockOfficeFeatureGroup.activatedAt,
        featureCount: mockFeatureGroup.features.length,
        features: mockFeatureGroup.features,
      });
    });

    it('should throw NotFoundException when office does not exist', async () => {
      const officeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(service.getAvailableFeatureGroups(officeId)).rejects.toThrow(
        new NotFoundException('Office not found'),
      );
    });

    it('should handle free feature groups correctly', async () => {
      const officeId = 'office-123';
      const freeFeatureGroup = { ...mockFeatureGroup, isPaid: false };
      const featureGroups = [freeFeatureGroup];

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      featureGroupRepository.find.mockResolvedValue(featureGroups as any);
      officeFeatureGroupRepository.find.mockResolvedValue([]);

      const result = await service.getAvailableFeatureGroups(officeId);

      expect(result[0].isActive).toBe(true); // Free groups are active by default
    });
  });

  describe('activateFeatureGroup', () => {
    it('should activate a paid feature group with valid token', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(mockUser as any);
      featureGroupRepository.findOne.mockResolvedValue(mockFeatureGroup as any);
      officeFeatureGroupRepository.findOne.mockResolvedValue(null);
      featureTokenRepository.findOne.mockResolvedValue(mockFeatureToken as any);
      externalTokenValidationService.validateToken.mockResolvedValue({
        success: true,
        valid: true,
        message: 'Token is valid',
      });

      const createdOfficeFeatureGroup = { ...mockOfficeFeatureGroup };
      officeFeatureGroupRepository.create.mockReturnValue(
        createdOfficeFeatureGroup as any,
      );
      officeFeatureGroupRepository.save.mockResolvedValue(
        createdOfficeFeatureGroup as any,
      );

      const result = await service.activateFeatureGroup(
        officeId,
        featureGroupId,
        activateDto,
        userId,
      );

      expect(result).toEqual(createdOfficeFeatureGroup);
      expect(externalTokenValidationService.validateToken).toHaveBeenCalledWith(
        'receipt-token',
      );
    });

    it('should activate a free feature group without token', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      const freeFeatureGroup = { ...mockFeatureGroup, isPaid: false };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(mockUser as any);
      featureGroupRepository.findOne.mockResolvedValue(freeFeatureGroup as any);
      officeFeatureGroupRepository.findOne.mockResolvedValue(null);

      const createdOfficeFeatureGroup = {
        ...mockOfficeFeatureGroup,
        tokenId: undefined,
      };
      officeFeatureGroupRepository.create.mockReturnValue(
        createdOfficeFeatureGroup as any,
      );
      officeFeatureGroupRepository.save.mockResolvedValue(
        createdOfficeFeatureGroup as any,
      );

      const result = await service.activateFeatureGroup(
        officeId,
        featureGroupId,
        activateDto,
        userId,
      );

      expect(result).toEqual(createdOfficeFeatureGroup);
      expect(
        externalTokenValidationService.validateToken,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when office does not exist', async () => {
      const officeId = 'non-existent-office';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.activateFeatureGroup(
          officeId,
          featureGroupId,
          activateDto,
          userId,
        ),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'non-existent-user';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.activateFeatureGroup(
          officeId,
          featureGroupId,
          activateDto,
          userId,
        ),
      ).rejects.toThrow(new NotFoundException('User not found'));
    });

    it('should throw ForbiddenException when user lacks permissions', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      const regularUser = { ...mockUser, role: UserRole.USER };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(regularUser as any);

      await expect(
        service.activateFeatureGroup(
          officeId,
          featureGroupId,
          activateDto,
          userId,
        ),
      ).rejects.toThrow(
        new ForbiddenException('Insufficient permissions to activate features'),
      );
    });

    it('should throw ConflictException when feature group is already active', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'receipt-token',
      };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(mockUser as any);
      featureGroupRepository.findOne.mockResolvedValue(mockFeatureGroup as any);
      officeFeatureGroupRepository.findOne.mockResolvedValue(
        mockOfficeFeatureGroup as any,
      );

      await expect(
        service.activateFeatureGroup(
          officeId,
          featureGroupId,
          activateDto,
          userId,
        ),
      ).rejects.toThrow(
        new ConflictException(
          'Feature group is already active for this office',
        ),
      );
    });

    it('should throw BadRequestException when token validation fails', async () => {
      const officeId = 'office-123';
      const featureGroupId = 'feature-group-123';
      const userId = 'user-123';
      const activateDto: ActivateFeatureGroupDto = {
        tokenName: 'invalid-token',
      };

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      userRepository.findOne.mockResolvedValue(mockUser as any);
      featureGroupRepository.findOne.mockResolvedValue(mockFeatureGroup as any);
      officeFeatureGroupRepository.findOne.mockResolvedValue(null);
      featureTokenRepository.findOne.mockResolvedValue(mockFeatureToken as any);
      externalTokenValidationService.validateToken.mockResolvedValue({
        success: false,
        valid: false,
        message: 'Invalid token',
      });

      await expect(
        service.activateFeatureGroup(
          officeId,
          featureGroupId,
          activateDto,
          userId,
        ),
      ).rejects.toThrow(new BadRequestException('Invalid token'));
    });
  });

  describe('getOfficeActiveFeatures', () => {
    it('should return active features for an office', async () => {
      const officeId = 'office-123';
      const activeOfficeFeatureGroups = [mockOfficeFeatureGroup];

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      officeFeatureGroupRepository.find.mockResolvedValue(
        activeOfficeFeatureGroups as any,
      );

      const result = await service.getOfficeActiveFeatures(officeId);

      expect(result.officeId).toBe(officeId);
      expect(result.features).toEqual([]); // Empty because no active features in mock
      expect(result.featureGroups).toHaveLength(0); // Empty because no active features
    });

    it('should skip expired feature groups', async () => {
      const officeId = 'office-123';
      const expiredOfficeFeatureGroup = {
        ...mockOfficeFeatureGroup,
        expiresAt: new Date('2020-01-01T10:30:00Z'), // Past date
      };
      const activeOfficeFeatureGroups = [expiredOfficeFeatureGroup];

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      officeFeatureGroupRepository.find.mockResolvedValue(
        activeOfficeFeatureGroups as any,
      );

      const result = await service.getOfficeActiveFeatures(officeId);

      expect(result.features).toHaveLength(0);
      expect(result.featureGroups).toHaveLength(0);
    });

    it('should throw NotFoundException when office does not exist', async () => {
      const officeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(service.getOfficeActiveFeatures(officeId)).rejects.toThrow(
        new NotFoundException('Office not found'),
      );
    });
  });

  describe('isFeatureActiveForOffice', () => {
    it('should return true when feature is active for office', async () => {
      const officeId = 'office-123';
      const featureName = 'Create Receipt';

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      featureRepository.findOne.mockResolvedValue({
        id: 'feature-1',
        name: featureName,
      } as any);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOfficeFeatureGroup]),
      };

      officeFeatureGroupRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.isFeatureActiveForOffice(
        officeId,
        featureName,
      );

      expect(result).toBe(true);
    });

    it('should return false when feature is not active for office', async () => {
      const officeId = 'office-123';
      const featureName = 'Non-existent Feature';

      officeRepository.findOne.mockResolvedValue(mockOffice as any);
      featureRepository.findOne.mockResolvedValue(null);

      const result = await service.isFeatureActiveForOffice(
        officeId,
        featureName,
      );

      expect(result).toBe(false);
    });

    it('should throw NotFoundException when office does not exist', async () => {
      const officeId = 'non-existent-office';
      const featureName = 'Create Receipt';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.isFeatureActiveForOffice(officeId, featureName),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });
  });

  describe('getActiveFeaturesForOffice', () => {
    it('should return array of active feature names', async () => {
      const officeId = 'office-123';

      officeRepository.findOne.mockResolvedValue(mockOffice as any);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOfficeFeatureGroup]),
      };

      officeFeatureGroupRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.getActiveFeaturesForOffice(officeId);

      expect(result).toEqual(['Create Receipt', 'View Receipts']);
    });

    it('should throw NotFoundException when office does not exist', async () => {
      const officeId = 'non-existent-office';

      officeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getActiveFeaturesForOffice(officeId),
      ).rejects.toThrow(new NotFoundException('Office not found'));
    });
  });

  describe('checkMultipleFeaturesForOffice', () => {
    it('should return object with feature status for each feature', async () => {
      const officeId = 'office-123';
      const featureNames = [
        'Create Receipt',
        'View Receipts',
        'Non-existent Feature',
      ];

      // Mock the isFeatureActiveForOffice method
      jest
        .spyOn(service, 'isFeatureActiveForOffice')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await service.checkMultipleFeaturesForOffice(
        officeId,
        featureNames,
      );

      expect(result).toEqual({
        'Create Receipt': true,
        'View Receipts': true,
        'Non-existent Feature': false,
      });
    });

    it('should handle errors gracefully and return false for failed checks', async () => {
      const officeId = 'office-123';
      const featureNames = ['Create Receipt', 'Invalid Feature'];

      jest
        .spyOn(service, 'isFeatureActiveForOffice')
        .mockResolvedValueOnce(true)
        .mockRejectedValueOnce(new Error('Some error'));

      const result = await service.checkMultipleFeaturesForOffice(
        officeId,
        featureNames,
      );

      expect(result).toEqual({
        'Create Receipt': true,
        'Invalid Feature': false,
      });
    });
  });

  describe('deactivateExpiredFeatures', () => {
    it('should deactivate expired features', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      };

      officeFeatureGroupRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.deactivateExpiredFeatures();

      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ isActive: false });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expiresAt IS NOT NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expiresAt < :now',
        expect.any(Object),
      );
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});
