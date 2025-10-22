import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { FeatureGroup } from '../entities/feature-group.entity';

export interface OfficeManagementFeatureGroup {
  name: string;
  appName: string;
  description: string;
  isPaid: boolean;
  features: string[]; // Feature names
}

@Injectable()
export class OfficeManagementFeatureGroupService {
  private readonly logger = new Logger(
    OfficeManagementFeatureGroupService.name,
  );

  constructor(
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(FeatureGroup)
    private readonly featureGroupRepository: Repository<FeatureGroup>,
  ) {}

  /**
   * Create predefined office management feature groups
   * This demonstrates how admins can create different tiers of office management features
   */
  async createPredefinedOfficeManagementGroups(): Promise<FeatureGroup[]> {
    const predefinedGroups: OfficeManagementFeatureGroup[] = [
      {
        name: 'Basic Office Management',
        appName: 'basic-office-management',
        description: 'Essential office management features for small offices',
        isPaid: false,
        features: [
          'Create Office',
          'View Office Details',
          'Office Name Management',
        ],
      },
      {
        name: 'Standard Office Management',
        appName: 'standard-office-management',
        description: 'Complete office management with location and QR features',
        isPaid: true,
        features: [
          'Create Office',
          'Update Office',
          'View Office Details',
          'Office Name Management',
          'Office Location Management',
          'Generate Office QR Code',
        ],
      },
      {
        name: 'Premium Office Management',
        appName: 'premium-office-management',
        description:
          'Full office management suite with analytics and advanced features',
        isPaid: true,
        features: [
          'Create Office',
          'Update Office',
          'Delete Office',
          'View Office Details',
          'Office Statistics',
          'Generate Office QR Code',
          'Office Name Management',
          'Office Location Management',
        ],
      },
      {
        name: 'Office Analytics Only',
        appName: 'office-analytics-only',
        description: 'Office statistics and analytics features only',
        isPaid: true,
        features: ['Office Statistics', 'View Office Details'],
      },
      {
        name: 'Office QR Management',
        appName: 'office-qr-management',
        description: 'QR code generation and management for offices',
        isPaid: false,
        features: ['Generate Office QR Code', 'View Office Details'],
      },
    ];

    const createdGroups: FeatureGroup[] = [];

    for (const groupData of predefinedGroups) {
      try {
        const existingGroup = await this.featureGroupRepository.findOne({
          where: { name: groupData.name },
        });

        if (existingGroup) {
          this.logger.log(
            `Feature group '${groupData.name}' already exists, skipping...`,
          );
          createdGroups.push(existingGroup);
          continue;
        }

        // Find features by name
        const features = await this.featureRepository.find({
          where: { name: In(groupData.features) },
        });

        if (features.length !== groupData.features.length) {
          const foundFeatureNames = features.map((f) => f.name);
          const missingFeatures = groupData.features.filter(
            (f) => !foundFeatureNames.includes(f),
          );
          this.logger.warn(
            `Some features not found for group '${groupData.name}': ${missingFeatures.join(', ')}`,
          );
        }

        const featureGroup = this.featureGroupRepository.create({
          name: groupData.name,
          appName: groupData.appName,
          description: groupData.description,
          isPaid: groupData.isPaid,
          features,
        });

        const savedGroup = await this.featureGroupRepository.save(featureGroup);
        createdGroups.push(savedGroup);
        this.logger.log(
          `Created feature group: ${groupData.name} with ${features.length} features`,
        );
      } catch (error) {
        this.logger.error(
          `Error creating feature group '${groupData.name}':`,
          error,
        );
      }
    }

    return createdGroups;
  }

  /**
   * Create a custom office management feature group
   * @param groupData - The group configuration
   * @returns Created feature group
   */
  async createCustomOfficeManagementGroup(
    groupData: OfficeManagementFeatureGroup,
  ): Promise<FeatureGroup> {
    // Check if group already exists
    const existingGroup = await this.featureGroupRepository.findOne({
      where: { name: groupData.name },
    });

    if (existingGroup) {
      throw new Error(`Feature group '${groupData.name}' already exists`);
    }

    // Find features by name
    const features = await this.featureRepository.find({
      where: { name: In(groupData.features) },
    });

    if (features.length !== groupData.features.length) {
      const foundFeatureNames = features.map((f) => f.name);
      const missingFeatures = groupData.features.filter(
        (f) => !foundFeatureNames.includes(f),
      );
      throw new Error(`Features not found: ${missingFeatures.join(', ')}`);
    }

    const featureGroup = this.featureGroupRepository.create({
      name: groupData.name,
      appName: groupData.appName,
      description: groupData.description,
      isPaid: groupData.isPaid,
      features,
    });

    return await this.featureGroupRepository.save(featureGroup);
  }

  /**
   * Get all office management related feature groups
   * @returns Array of office management feature groups
   */
  async getOfficeManagementFeatureGroups(): Promise<FeatureGroup[]> {
    return await this.featureGroupRepository.find({
      where: {
        name: In([
          'Basic Office Management',
          'Standard Office Management',
          'Premium Office Management',
          'Office Analytics Only',
          'Office QR Management',
        ]),
      },
      relations: ['features'],
    });
  }

  /**
   * Get available office management features
   * @returns Array of office management features
   */
  async getAvailableOfficeManagementFeatures(): Promise<Feature[]> {
    const officeManagementFeatureNames = [
      'Create Office',
      'Update Office',
      'Delete Office',
      'View Office Details',
      'Office Statistics',
      'Generate Office QR Code',
      'Office Name Management',
      'Office Location Management',
    ];

    return await this.featureRepository.find({
      where: { name: In(officeManagementFeatureNames) },
    });
  }
}
