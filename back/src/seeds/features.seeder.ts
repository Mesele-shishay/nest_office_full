import { DataSource } from 'typeorm';
import { Feature } from '../office-features/entities/feature.entity';

export class FeaturesSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    const featureRepository = this.dataSource.getRepository(Feature);

    const features = [
      // General Office / Management Features
      {
        name: 'Manage Items',
        description: 'Create, edit, and manage office items and inventory',
        isActive: true,
      },
      {
        name: 'Item Categories',
        description: 'Organize items into categories and subcategories',
        isActive: true,
      },
      {
        name: 'Currency Settings',
        description: 'Configure office currency settings and exchange rates',
        isActive: true,
      },
      {
        name: 'Office Name',
        description: 'Customize office name and branding settings',
        isActive: true,
      },
      {
        name: 'Location Range (meters)',
        description: 'Set and manage office location range parameters',
        isActive: true,
      },
      {
        name: 'Office Verification',
        description: 'Verify office authenticity and compliance',
        isActive: true,
      },
      {
        name: 'Feature Groups',
        description: 'Manage feature group assignments and configurations',
        isActive: true,
      },
      {
        name: 'Feature Status, Order & Payment',
        description: 'Track feature usage, orders, and payment status',
        isActive: true,
      },

      // Shortlinks & QR Code Features
      {
        name: 'Shortlink Creation & Management',
        description:
          'Create, customize, and manage short links for office content',
        isActive: true,
      },
      {
        name: 'Shortlink Analytics',
        description:
          'Track shortlink performance, clicks, and engagement metrics',
        isActive: true,
      },
      {
        name: 'QR Code Generator & Management',
        description:
          'Generate, customize, and manage QR codes for office content',
        isActive: true,
      },
      {
        name: 'QR Code Analytics',
        description: 'Analyze QR code usage, scans, and performance data',
        isActive: true,
      },

      // Content & Media Features
      {
        name: 'Content Upload',
        description: 'Upload and manage various types of content files',
        isActive: true,
      },
      {
        name: 'Video Management',
        description: 'Upload, edit, and manage video content',
        isActive: true,
      },
      {
        name: 'Content Analytics',
        description: 'Track content performance, views, and engagement',
        isActive: true,
      },
      {
        name: 'Content Manager',
        description: 'Comprehensive content management and organization tools',
        isActive: true,
      },

      // Games Features
      {
        name: 'Spinner Game Management',
        description: 'Create, customize, and manage spinner games',
        isActive: true,
      },
      {
        name: 'Stopwatch Game Management',
        description: 'Create, customize, and manage stopwatch games',
        isActive: true,
      },
      {
        name: 'Game Analytics',
        description: 'Track game performance, engagement, and user statistics',
        isActive: true,
      },

      // Social / Engagement Features
      {
        name: 'Social Sharing',
        description: 'Enable social media sharing and integration',
        isActive: true,
      },
      {
        name: 'Engagement Tracking',
        description: 'Track user engagement metrics and interactions',
        isActive: true,
      },
      {
        name: 'User Interaction',
        description: 'Monitor and analyze user interactions and behavior',
        isActive: true,
      },

      // Usage & Payment Tracking
      {
        name: 'Usage Statistics',
        description: 'View detailed usage statistics and analytics',
        isActive: true,
      },
      {
        name: 'Payment Statistics',
        description: 'Track payment data, revenue, and financial analytics',
        isActive: true,
      },

      // Office Management Features (Granular)
      {
        name: 'Create Office',
        description: 'Create new office locations and configurations',
        isActive: true,
      },
      {
        name: 'Update Office',
        description: 'Update office information, settings, and configurations',
        isActive: true,
      },
      {
        name: 'Delete Office',
        description: 'Remove office locations and configurations',
        isActive: true,
      },
      {
        name: 'View Office Details',
        description: 'View detailed office information and settings',
        isActive: true,
      },
      {
        name: 'Office Statistics',
        description: 'View office management analytics and statistics',
        isActive: true,
      },
      {
        name: 'Generate Office QR Code',
        description: 'Generate QR codes for office identification',
        isActive: true,
      },
      {
        name: 'Office Name Management',
        description: 'Change and manage office names',
        isActive: true,
      },
      {
        name: 'Office Location Management',
        description: 'Update office locations and coordinates',
        isActive: true,
      },
      {
        name: 'Invoice Management',
        description: 'Create, send, and manage invoices for office services',
        isActive: true,
      },
      {
        name: 'Payment Processing',
        description: 'Process payments and manage payment methods',
        isActive: true,
      },
      {
        name: 'Advanced Reporting',
        description: 'Generate comprehensive reports with custom templates',
        isActive: true,
      },
      {
        name: 'Custom Branding',
        description: 'Customize office interface with company branding',
        isActive: true,
      },
      {
        name: 'API Access',
        description: 'Access to office management APIs and integrations',
        isActive: true,
      },
      {
        name: 'White-labeling',
        description: 'Complete white-label solution for office management',
        isActive: true,
      },
      {
        name: 'Priority Support',
        description: 'Priority customer support and assistance',
        isActive: true,
      },
    ];

    for (const featureData of features) {
      const existingFeature = await featureRepository.findOne({
        where: { name: featureData.name },
      });

      if (!existingFeature) {
        const feature = featureRepository.create(featureData);
        await featureRepository.save(feature);
      }
    }
  }

  /**
   * Create a new feature programmatically
   */
  async createFeature(
    name: string,
    description: string,
    isActive: boolean = true,
  ): Promise<Feature> {
    const featureRepository = this.dataSource.getRepository(Feature);

    const existingFeature = await featureRepository.findOne({
      where: { name },
    });

    if (existingFeature) {
      throw new Error(`Feature with name '${name}' already exists`);
    }

    const feature = featureRepository.create({
      name,
      description,
      isActive,
    });

    return await featureRepository.save(feature);
  }

  /**
   * Update an existing feature
   */
  async updateFeature(
    name: string,
    updates: Partial<Pick<Feature, 'description' | 'isActive'>>,
  ): Promise<Feature> {
    const featureRepository = this.dataSource.getRepository(Feature);

    const feature = await featureRepository.findOne({
      where: { name },
    });

    if (!feature) {
      throw new Error(`Feature with name '${name}' not found`);
    }

    Object.assign(feature, updates);
    return await featureRepository.save(feature);
  }

  /**
   * Delete a feature (soft delete)
   */
  async deleteFeature(name: string): Promise<void> {
    const featureRepository = this.dataSource.getRepository(Feature);

    const feature = await featureRepository.findOne({
      where: { name },
    });

    if (!feature) {
      throw new Error(`Feature with name '${name}' not found`);
    }

    await featureRepository.softDelete(feature.id);
  }
}
