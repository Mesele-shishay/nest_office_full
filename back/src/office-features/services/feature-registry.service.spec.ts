import { Test, TestingModule } from '@nestjs/testing';
import { FeatureRegistryService } from './feature-registry.service';

describe('FeatureRegistryService', () => {
  let service: FeatureRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeatureRegistryService],
    }).compile();

    service = module.get<FeatureRegistryService>(FeatureRegistryService);

    // Mock the logger to prevent error logs during tests
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    service.clearAllFeatures();
  });

  describe('registerFeature', () => {
    it('should register a feature service', () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);

      expect(service.isFeatureRegistered(featureName)).toBe(true);
    });

    it('should register multiple feature services', () => {
      const features = [
        { name: 'Office Management', service: { createOffice: jest.fn() } },
        { name: 'Invoice Management', service: { createInvoice: jest.fn() } },
        { name: 'Payment Processing', service: { processPayment: jest.fn() } },
      ];

      features.forEach(({ name, service: featureService }) => {
        service.registerFeature(name, featureService);
      });

      features.forEach(({ name }) => {
        expect(service.isFeatureRegistered(name)).toBe(true);
      });
    });

    it('should overwrite existing feature registration', () => {
      const featureName = 'Office Management';
      const firstService = { createOffice: jest.fn() };
      const secondService = {
        createOffice: jest.fn(),
        updateOffice: jest.fn(),
      };

      service.registerFeature(featureName, firstService);
      service.registerFeature(featureName, secondService);

      const retrievedService = service.getFeatureService(featureName);
      expect(retrievedService).toBe(secondService);
      expect(retrievedService).not.toBe(firstService);
    });
  });

  describe('getFeatureService', () => {
    it('should return registered feature service', () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);
      const retrievedService = service.getFeatureService(featureName);

      expect(retrievedService).toBe(mockService);
    });

    it('should return undefined for unregistered feature', () => {
      const retrievedService = service.getFeatureService(
        'Non-existent Feature',
      );

      expect(retrievedService).toBeUndefined();
    });
  });

  describe('executeFeatureAction', () => {
    it('should execute method on registered feature service', async () => {
      const featureName = 'Office Management';
      const mockService = {
        createOffice: jest.fn().mockResolvedValue({ id: 'receipt-123' }),
      };

      service.registerFeature(featureName, mockService);

      const result = await service.executeFeatureAction(
        featureName,
        'createOffice',
        { amount: 100 },
      );

      expect(result).toEqual({ id: 'receipt-123' });
      expect(mockService.createOffice).toHaveBeenCalledWith({ amount: 100 });
    });

    it('should execute method with multiple arguments', async () => {
      const featureName = 'Office Management';
      const mockService = {
        updateOffice: jest
          .fn()
          .mockResolvedValue({ id: 'receipt-123', updated: true }),
      };

      service.registerFeature(featureName, mockService);

      const result = await service.executeFeatureAction(
        featureName,
        'updateOffice',
        'receipt-123',
        { amount: 150 },
        { validate: true },
      );

      expect(result).toEqual({ id: 'receipt-123', updated: true });
      expect(mockService.updateOffice).toHaveBeenCalledWith(
        'receipt-123',
        { amount: 150 },
        { validate: true },
      );
    });

    it('should throw error for unregistered feature', async () => {
      await expect(
        service.executeFeatureAction('Non-existent Feature', 'someMethod'),
      ).rejects.toThrow('Feature service not found: Non-existent Feature');
    });

    it('should throw error for non-existent method', async () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);

      await expect(
        service.executeFeatureAction(featureName, 'nonExistentMethod'),
      ).rejects.toThrow(
        'Action nonExistentMethod not found for feature Office Management',
      );
    });

    it('should handle service method errors', async () => {
      const featureName = 'Office Management';
      const error = new Error('Service method failed');
      const mockService = {
        createOffice: jest.fn().mockRejectedValue(error),
      };

      service.registerFeature(featureName, mockService);

      await expect(
        service.executeFeatureAction(featureName, 'createOffice'),
      ).rejects.toThrow(error);
    });

    it('should handle synchronous service methods', async () => {
      const featureName = 'Office Management';
      const mockService = {
        validateOffice: jest.fn().mockReturnValue(true),
      };

      service.registerFeature(featureName, mockService);

      const result = await service.executeFeatureAction(
        featureName,
        'validateOffice',
        { amount: 100 },
      );

      expect(result).toBe(true);
      expect(mockService.validateOffice).toHaveBeenCalledWith({ amount: 100 });
    });
  });

  describe('isFeatureRegistered', () => {
    it('should return true for registered feature', () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);

      expect(service.isFeatureRegistered(featureName)).toBe(true);
    });

    it('should return false for unregistered feature', () => {
      expect(service.isFeatureRegistered('Non-existent Feature')).toBe(false);
    });

    it('should be case sensitive', () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);

      expect(service.isFeatureRegistered('receipt management')).toBe(false);
      expect(service.isFeatureRegistered('Office Management')).toBe(true);
    });
  });

  describe('getRegisteredFeatures', () => {
    it('should return empty array when no features are registered', () => {
      const features = service.getRegisteredFeatures();

      expect(features).toEqual([]);
    });

    it('should return array of registered feature names', () => {
      const features = [
        { name: 'Office Management', service: { createOffice: jest.fn() } },
        { name: 'Invoice Management', service: { createInvoice: jest.fn() } },
        { name: 'Payment Processing', service: { processPayment: jest.fn() } },
      ];

      features.forEach(({ name, service: featureService }) => {
        service.registerFeature(name, featureService);
      });

      const registeredFeatures = service.getRegisteredFeatures();

      expect(registeredFeatures).toHaveLength(3);
      expect(registeredFeatures).toContain('Office Management');
      expect(registeredFeatures).toContain('Invoice Management');
      expect(registeredFeatures).toContain('Payment Processing');
    });

    it('should return features in registration order', () => {
      const features = ['First Feature', 'Second Feature', 'Third Feature'];

      features.forEach((name) => {
        service.registerFeature(name, {});
      });

      const registeredFeatures = service.getRegisteredFeatures();

      expect(registeredFeatures).toEqual(features);
    });
  });

  describe('unregisterFeature', () => {
    it('should unregister existing feature', () => {
      const featureName = 'Office Management';
      const mockService = { createOffice: jest.fn() };

      service.registerFeature(featureName, mockService);
      expect(service.isFeatureRegistered(featureName)).toBe(true);

      service.unregisterFeature(featureName);

      expect(service.isFeatureRegistered(featureName)).toBe(false);
    });

    it('should handle unregistering non-existent feature gracefully', () => {
      // Should not throw error
      expect(() => {
        service.unregisterFeature('Non-existent Feature');
      }).not.toThrow();
    });

    it('should not affect other registered features', () => {
      const features = [
        { name: 'Office Management', service: { createOffice: jest.fn() } },
        { name: 'Invoice Management', service: { createInvoice: jest.fn() } },
      ];

      features.forEach(({ name, service: featureService }) => {
        service.registerFeature(name, featureService);
      });

      service.unregisterFeature('Office Management');

      expect(service.isFeatureRegistered('Office Management')).toBe(false);
      expect(service.isFeatureRegistered('Invoice Management')).toBe(true);
    });
  });

  describe('clearAllFeatures', () => {
    it('should clear all registered features', () => {
      const features = [
        { name: 'Office Management', service: { createOffice: jest.fn() } },
        { name: 'Invoice Management', service: { createInvoice: jest.fn() } },
        { name: 'Payment Processing', service: { processPayment: jest.fn() } },
      ];

      features.forEach(({ name, service: featureService }) => {
        service.registerFeature(name, featureService);
      });

      expect(service.getRegisteredFeatures()).toHaveLength(3);

      service.clearAllFeatures();

      expect(service.getRegisteredFeatures()).toHaveLength(0);
    });

    it('should handle clearing when no features are registered', () => {
      service.clearAllFeatures();

      expect(service.getRegisteredFeatures()).toHaveLength(0);
    });
  });

  describe('integration tests', () => {
    it('should work with real service-like objects', async () => {
      class MockReceiptService {
        async createOffice(data: any) {
          return { id: 'receipt-123', ...data };
        }

        async updateOffice(id: string, data: any) {
          return { id, ...data, updated: true };
        }

        validateOffice(data: any) {
          return data.amount > 0;
        }
      }

      const receiptService = new MockReceiptService();
      service.registerFeature('Office Management', receiptService);

      // Test async method
      const createResult = await service.executeFeatureAction(
        'Office Management',
        'createOffice',
        { amount: 100, customer: 'John Doe' },
      );
      expect(createResult).toEqual({
        id: 'receipt-123',
        amount: 100,
        customer: 'John Doe',
      });

      // Test async method with multiple args
      const updateResult = await service.executeFeatureAction(
        'Office Management',
        'updateOffice',
        'receipt-123',
        { amount: 150 },
      );
      expect(updateResult).toEqual({
        id: 'receipt-123',
        amount: 150,
        updated: true,
      });

      // Test sync method
      const validationResult = await service.executeFeatureAction(
        'Office Management',
        'validateOffice',
        { amount: 200 },
      );
      expect(validationResult).toBe(true);
    });
  });
});
