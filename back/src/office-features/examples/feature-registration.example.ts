import { Injectable, OnModuleInit } from '@nestjs/common';
import { FeatureRegistryService } from '../services/feature-registry.service';

/**
 * Example service that demonstrates how to register features
 * This would typically be in your actual feature modules
 */
@Injectable()
export class ExampleFeatureService {
  async createOffice(data: any): Promise<any> {
    return { id: 'office-123', ...data };
  }

  async updateOffice(id: string, data: any): Promise<any> {
    return { id, ...data, updated: true };
  }

  async generateInvoice(data: any): Promise<any> {
    return { id: 'invoice-123', ...data };
  }

  async processPayment(data: any): Promise<any> {
    return { id: 'payment-123', ...data };
  }
}

/**
 * Example module that registers features on initialization
 * This demonstrates the proper way to register features
 */
@Injectable()
export class FeatureRegistrationExample implements OnModuleInit {
  constructor(
    private readonly featureRegistry: FeatureRegistryService,
    private readonly exampleFeatureService: ExampleFeatureService,
  ) {}

  onModuleInit() {
    // Register features that have actual service implementations
    this.featureRegistry.registerFeature(
      'Office Management',
      this.exampleFeatureService,
    );

    this.featureRegistry.registerFeature(
      'Invoice Management',
      this.exampleFeatureService,
    );

    this.featureRegistry.registerFeature(
      'Payment Processing',
      this.exampleFeatureService,
    );

    console.log('✅ Example features registered successfully');
  }
}

/**
 * Usage Example:
 *
 * 1. Register features in your module's OnModuleInit:
 *    this.featureRegistry.registerFeature('Office Management', officeService);
 *
 * 2. Admin can then create database records for registered features:
 *    POST /api/v1/admin/features
 *    {
 *      "name": "Office Management",
 *      "description": "Manage office operations",
 *      "isActive": true
 *    }
 *
 * 3. Admin can check what features are registered:
 *    GET /api/v1/admin/features/registered
 *
 * 4. Admin can create feature groups with registered features:
 *    POST /api/v1/admin/feature-groups
 *    {
 *      "name": "Premium Office Suite",
 *      "appName": "premium-office-suite",
 *      "featureIds": ["feature-uuid-from-step-2"]
 *    }
 */
