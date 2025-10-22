import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeaturesSeeder } from './features.seeder';
import { Feature } from '../office-features/entities/feature.entity';

describe('FeaturesSeeder', () => {
  let seeder: FeaturesSeeder;
  let featureRepository: jest.Mocked<Repository<Feature>>;
  let mockDataSource: any;

  const mockFeature = {
    id: 'feature-123',
    name: 'Office Management',
    description:
      'Create, manage, and track office locations, settings, and configurations',
    isActive: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FeaturesSeeder,
          useFactory: () => new FeaturesSeeder(mockDataSource),
        },
      ],
    }).compile();

    seeder = module.get<FeaturesSeeder>(FeaturesSeeder);
    featureRepository = mockDataSource.getRepository(Feature);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('seed', () => {
    it('should seed all features successfully', async () => {
      // Mock that no features exist initially
      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      // Mock console.log to avoid cluttering test output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await seeder.seed();

      // Verify that getRepository was called with Feature
      expect(mockDataSource.getRepository).toHaveBeenCalledWith(Feature);

      // Verify that findOne was called for each feature
      expect(featureRepository.findOne).toHaveBeenCalledTimes(39); // Updated number of features

      // Verify that create and save were called for each feature
      expect(featureRepository.create).toHaveBeenCalledTimes(39);
      expect(featureRepository.save).toHaveBeenCalledTimes(39);

      consoleSpy.mockRestore();
    });

    it('should skip existing features', async () => {
      // Mock that some features already exist
      featureRepository.findOne
        .mockResolvedValueOnce(mockFeature as any) // First feature exists
        .mockResolvedValueOnce(null) // Second feature doesn't exist
        .mockResolvedValueOnce(mockFeature as any) // Third feature exists
        .mockResolvedValue(null); // Rest don't exist

      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await seeder.seed();

      // Should only create and save features that don't exist
      expect(featureRepository.create).toHaveBeenCalledTimes(37); // 39 - 2 existing
      expect(featureRepository.save).toHaveBeenCalledTimes(37);

      consoleSpy.mockRestore();
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      featureRepository.findOne.mockRejectedValue(error);

      await expect(seeder.seed()).rejects.toThrow(error);
    });

    it('should create features with correct data structure', async () => {
      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      await seeder.seed();

      // Verify that create was called with correct feature data
      expect(featureRepository.create).toHaveBeenCalledWith({
        name: 'Manage Items',
        description: 'Create, edit, and manage office items and inventory',
        isActive: true,
      });

      expect(featureRepository.create).toHaveBeenCalledWith({
        name: 'Create Office',
        description: 'Create new office locations and configurations',
        isActive: true,
      });
    });
  });

  describe('createFeature', () => {
    it('should create a new feature successfully', async () => {
      const name = 'Test Feature';
      const description = 'Test feature description';
      const isActive = true;

      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      const result = await seeder.createFeature(name, description, isActive);

      expect(featureRepository.findOne).toHaveBeenCalledWith({
        where: { name },
      });
      expect(featureRepository.create).toHaveBeenCalledWith({
        name,
        description,
        isActive,
      });
      expect(featureRepository.save).toHaveBeenCalledWith(mockFeature);
      expect(result).toEqual(mockFeature);
    });

    it('should throw error when feature already exists', async () => {
      const name = 'Existing Feature';
      const description = 'Test feature description';

      featureRepository.findOne.mockResolvedValue(mockFeature as any);

      await expect(seeder.createFeature(name, description)).rejects.toThrow(
        "Feature with name 'Existing Feature' already exists",
      );

      expect(featureRepository.create).not.toHaveBeenCalled();
      expect(featureRepository.save).not.toHaveBeenCalled();
    });

    it('should create feature with default isActive value', async () => {
      const name = 'Test Feature';
      const description = 'Test feature description';

      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      await seeder.createFeature(name, description);

      expect(featureRepository.create).toHaveBeenCalledWith({
        name,
        description,
        isActive: true,
      });
    });

    it('should create feature with custom isActive value', async () => {
      const name = 'Test Feature';
      const description = 'Test feature description';
      const isActive = false;

      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      await seeder.createFeature(name, description, isActive);

      expect(featureRepository.create).toHaveBeenCalledWith({
        name,
        description,
        isActive: false,
      });
    });
  });

  describe('updateFeature', () => {
    it('should update an existing feature successfully', async () => {
      const name = 'Existing Feature';
      const updates = {
        description: 'Updated description',
        isActive: false,
      };

      const updatedFeature = { ...mockFeature, ...updates };

      featureRepository.findOne.mockResolvedValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(updatedFeature as any);

      const result = await seeder.updateFeature(name, updates);

      expect(featureRepository.findOne).toHaveBeenCalledWith({
        where: { name },
      });
      expect(featureRepository.save).toHaveBeenCalledWith({
        ...mockFeature,
        ...updates,
      });
      expect(result).toEqual(updatedFeature);
    });

    it('should throw error when feature does not exist', async () => {
      const name = 'Non-existent Feature';
      const updates = { description: 'Updated description' };

      featureRepository.findOne.mockResolvedValue(null);

      await expect(seeder.updateFeature(name, updates)).rejects.toThrow(
        "Feature with name 'Non-existent Feature' not found",
      );

      expect(featureRepository.save).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const name = 'Existing Feature';
      const updates = { description: 'Only description updated' };

      const updatedFeature = {
        ...mockFeature,
        description: updates.description,
      };

      featureRepository.findOne.mockResolvedValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(updatedFeature as any);

      const result = await seeder.updateFeature(name, updates);

      expect(result.description).toBe(updates.description);
      expect(result.isActive).toBe(mockFeature.isActive); // Should remain unchanged
    });
  });

  describe('deleteFeature', () => {
    it('should soft delete an existing feature', async () => {
      const name = 'Existing Feature';

      featureRepository.findOne.mockResolvedValue(mockFeature as any);
      featureRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await seeder.deleteFeature(name);

      expect(featureRepository.findOne).toHaveBeenCalledWith({
        where: { name },
      });
      expect(featureRepository.softDelete).toHaveBeenCalledWith(mockFeature.id);
    });

    it('should throw error when feature does not exist', async () => {
      const name = 'Non-existent Feature';

      featureRepository.findOne.mockResolvedValue(null);

      await expect(seeder.deleteFeature(name)).rejects.toThrow(
        "Feature with name 'Non-existent Feature' not found",
      );

      expect(featureRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('feature data validation', () => {
    it('should contain all expected features in the seeder', async () => {
      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await seeder.seed();

      // Verify that specific features are being created
      const createCalls = featureRepository.create.mock.calls;
      const featureNames = createCalls.map((call) => call[0].name);

      expect(featureNames).toContain('Manage Items');
      expect(featureNames).toContain('Create Office');
      expect(featureNames).toContain('Update Office');
      expect(featureNames).toContain('Delete Office');
      expect(featureNames).toContain('View Office Details');
      expect(featureNames).toContain('Office Statistics');
      expect(featureNames).toContain('Generate Office QR Code');
      expect(featureNames).toContain('Office Name Management');
      expect(featureNames).toContain('Office Location Management');
      expect(featureNames).toContain('Invoice Management');
      expect(featureNames).toContain('Payment Processing');
      expect(featureNames).toContain('Advanced Reporting');
      expect(featureNames).toContain('Custom Branding');
      expect(featureNames).toContain('API Access');
      expect(featureNames).toContain('White-labeling');
      expect(featureNames).toContain('Priority Support');

      consoleSpy.mockRestore();
    });

    it('should have correct feature categories', async () => {
      featureRepository.findOne.mockResolvedValue(null);
      featureRepository.create.mockReturnValue(mockFeature as any);
      featureRepository.save.mockResolvedValue(mockFeature as any);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await seeder.seed();

      const createCalls = featureRepository.create.mock.calls;
      const featureNames = createCalls.map((call) => call[0].name);

      // General Office Management Features
      expect(featureNames).toContain('Manage Items');
      expect(featureNames).toContain('Item Categories');
      expect(featureNames).toContain('Currency Settings');

      // Shortlinks & QR Code Features
      expect(featureNames).toContain('Shortlink Creation & Management');
      expect(featureNames).toContain('QR Code Generator & Management');

      // Content & Media Features
      expect(featureNames).toContain('Content Upload');
      expect(featureNames).toContain('Video Management');

      // Games Features
      expect(featureNames).toContain('Spinner Game Management');
      expect(featureNames).toContain('Stopwatch Game Management');

      // Social / Engagement Features
      expect(featureNames).toContain('Social Sharing');
      expect(featureNames).toContain('Engagement Tracking');

      consoleSpy.mockRestore();
    });
  });
});
