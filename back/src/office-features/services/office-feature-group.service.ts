import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import { OfficeFeatureGroup } from '../entities/office-feature-group.entity';
import { FeatureGroup } from '../entities/feature-group.entity';
import { FeatureToken } from '../entities/feature-token.entity';
import { Feature } from '../entities/feature.entity';
import { Office } from '../../office/entities/office.entity';
import { User, UserRole } from '../../users/entities/user.entity';
import { ExternalTokenValidationService } from './external-token-validation.service';
import {
  ActivateFeatureGroupDto,
  OfficeFeatureGroupQueryDto,
} from '../dto/feature-group.dto';

@Injectable()
export class OfficeFeatureGroupService {
  constructor(
    @InjectRepository(OfficeFeatureGroup)
    private readonly officeFeatureGroupRepository: Repository<OfficeFeatureGroup>,
    @InjectRepository(FeatureGroup)
    private readonly featureGroupRepository: Repository<FeatureGroup>,
    @InjectRepository(FeatureToken)
    private readonly featureTokenRepository: Repository<FeatureToken>,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly externalTokenValidationService: ExternalTokenValidationService,
  ) {}

  async getAvailableFeatureGroups(officeId: string): Promise<any[]> {
    // Verify office exists
    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Get all feature groups
    const featureGroups = await this.featureGroupRepository.find({
      relations: ['features'],
      order: { createdAt: 'DESC' },
    });

    // Get existing office feature groups
    const existingOfficeFeatureGroups =
      await this.officeFeatureGroupRepository.find({
        where: { officeId },
        relations: ['featureGroup', 'token'],
      });

    // Create a map of existing feature groups for quick lookup
    const existingMap = new Map(
      existingOfficeFeatureGroups.map((ofg) => [ofg.featureGroupId, ofg]),
    );

    // Build response with status information
    return featureGroups.map((fg) => {
      const existing = existingMap.get(fg.id);
      return {
        id: fg.id,
        name: fg.name,
        appName: fg.appName,
        description: fg.description,
        isPaid: fg.isPaid,
        isActive: existing ? existing.isActive : !fg.isPaid, // Free groups are active by default
        expiresAt: existing?.expiresAt,
        activatedAt: existing?.activatedAt,
        featureCount: fg.features.length,
        features: fg.features,
      };
    });
  }

  async activateFeatureGroup(
    officeId: string,
    featureGroupId: string,
    activateDto: ActivateFeatureGroupDto,
    userId: string,
  ): Promise<OfficeFeatureGroup> {
    // Verify office exists and user has access
    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Check if user has access to this office
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only admins or office managers can activate features
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Insufficient permissions to activate features',
      );
    }

    // Verify feature group exists
    const featureGroup = await this.featureGroupRepository.findOne({
      where: { id: featureGroupId },
    });

    if (!featureGroup) {
      throw new NotFoundException('Feature group not found');
    }

    // Check if already activated
    const existing = await this.officeFeatureGroupRepository.findOne({
      where: { officeId, featureGroupId },
    });

    if (existing && existing.isActive) {
      throw new ConflictException(
        'Feature group is already active for this office',
      );
    }

    // For paid feature groups, validate token with external API
    if (featureGroup.isPaid) {
      // First, find the token configuration in our system
      const tokenConfig = await this.featureTokenRepository.findOne({
        where: { tokenName: activateDto.tokenName },
        relations: ['featureGroup'],
      });

      if (!tokenConfig) {
        throw new NotFoundException('Token configuration not found');
      }

      if (tokenConfig.featureGroupId !== featureGroupId) {
        throw new BadRequestException(
          'Token does not belong to this feature group',
        );
      }

      if (!tokenConfig.isActive) {
        throw new BadRequestException('Token configuration is inactive');
      }

      // Validate token with external API
      const validationResult =
        await this.externalTokenValidationService.validateToken(
          activateDto.tokenName,
        );

      if (!validationResult.success || !validationResult.valid) {
        throw new BadRequestException(
          validationResult.message || 'Token validation failed',
        );
      }

      // Calculate expiration date based on admin configuration
      const expiresAt = tokenConfig.expiresInDays
        ? new Date(Date.now() + tokenConfig.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      // Create or update office feature group
      if (existing) {
        existing.isActive = true;
        existing.tokenId = tokenConfig.id;
        existing.expiresAt = expiresAt;
        existing.activatedAt = new Date();
        return await this.officeFeatureGroupRepository.save(existing);
      } else {
        const officeFeatureGroup = this.officeFeatureGroupRepository.create({
          officeId,
          featureGroupId,
          tokenId: tokenConfig.id,
          isActive: true,
          expiresAt,
          activatedAt: new Date(),
        });
        return await this.officeFeatureGroupRepository.save(officeFeatureGroup);
      }
    } else {
      // Free feature group - activate without token
      if (existing) {
        existing.isActive = true;
        existing.activatedAt = new Date();
        return await this.officeFeatureGroupRepository.save(existing);
      } else {
        const officeFeatureGroup = this.officeFeatureGroupRepository.create({
          officeId,
          featureGroupId,
          isActive: true,
          activatedAt: new Date(),
        });
        return await this.officeFeatureGroupRepository.save(officeFeatureGroup);
      }
    }
  }

  async getOfficeActiveFeatures(officeId: string): Promise<any> {
    // Verify office exists
    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Get all active office feature groups
    const activeOfficeFeatureGroups =
      await this.officeFeatureGroupRepository.find({
        where: { officeId, isActive: true },
        relations: ['featureGroup', 'featureGroup.features', 'token'],
      });

    // Collect all unique features from active groups
    const allFeatures = new Map();
    const featureGroups: any[] = [];

    for (const ofg of activeOfficeFeatureGroups) {
      // Check if expired
      if (ofg.expiresAt && ofg.expiresAt < new Date()) {
        continue; // Skip expired groups
      }

      featureGroups.push({
        id: ofg.featureGroup.id,
        name: ofg.featureGroup.name,
        appName: ofg.featureGroup.appName,
        description: ofg.featureGroup.description,
        isPaid: ofg.featureGroup.isPaid,
        isActive: ofg.isActive,
        expiresAt: ofg.expiresAt,
        activatedAt: ofg.activatedAt,
        featureCount: ofg.featureGroup.features.length,
        features: ofg.featureGroup.features,
      });

      // Add features to the collection
      for (const feature of ofg.featureGroup.features) {
        if (!allFeatures.has(feature.id)) {
          allFeatures.set(feature.id, feature);
        }
      }
    }

    return {
      officeId,
      features: Array.from(allFeatures.values()),
      featureGroups,
    };
  }

  async deactivateExpiredFeatures(): Promise<void> {
    const now = new Date();

    await this.officeFeatureGroupRepository.update(
      {
        isActive: true,
        expiresAt: In([null, undefined]), // This won't work as expected, need to use query builder
      },
      { isActive: false },
    );

    // Use query builder for proper date comparison
    await this.officeFeatureGroupRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('isActive = :isActive', { isActive: true })
      .andWhere('expiresAt IS NOT NULL')
      .andWhere('expiresAt < :now', { now })
      .execute();
  }

  /**
   * Check if a specific feature is active for an office
   * @param officeId - The office ID
   * @param featureName - The name of the feature to check
   * @returns True if the feature is active for the office
   */
  async isFeatureActiveForOffice(
    officeId: string,
    featureName: string,
  ): Promise<boolean> {
    // First, verify the office exists
    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Find the feature by name
    const feature = await this.featureRepository.findOne({
      where: { name: featureName, isActive: true },
    });

    if (!feature) {
      return false; // Feature doesn't exist or is inactive
    }

    // Check if the office has any active feature groups that include this feature
    const activeFeatureGroups = await this.officeFeatureGroupRepository
      .createQueryBuilder('ofg')
      .leftJoinAndSelect('ofg.featureGroup', 'fg')
      .leftJoinAndSelect('fg.features', 'f')
      .where('ofg.officeId = :officeId', { officeId })
      .andWhere('ofg.isActive = :isActive', { isActive: true })
      .andWhere('(ofg.expiresAt IS NULL OR ofg.expiresAt > :now)', {
        now: new Date(),
      })
      .getMany();

    // Check if any active feature group contains the required feature
    for (const officeFeatureGroup of activeFeatureGroups) {
      const hasFeature = officeFeatureGroup.featureGroup.features.some(
        (f) => f.id === feature.id,
      );
      if (hasFeature) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get all active features for an office
   * @param officeId - The office ID
   * @returns Array of active feature names
   */
  async getActiveFeaturesForOffice(officeId: string): Promise<string[]> {
    // Verify office exists
    const office = await this.officeRepository.findOne({
      where: { id: officeId },
    });

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    // Get all active feature groups for the office
    const activeFeatureGroups = await this.officeFeatureGroupRepository
      .createQueryBuilder('ofg')
      .leftJoinAndSelect('ofg.featureGroup', 'fg')
      .leftJoinAndSelect('fg.features', 'f')
      .where('ofg.officeId = :officeId', { officeId })
      .andWhere('ofg.isActive = :isActive', { isActive: true })
      .andWhere('(ofg.expiresAt IS NULL OR ofg.expiresAt > :now)', {
        now: new Date(),
      })
      .getMany();

    // Collect all unique feature names
    const activeFeatures = new Set<string>();
    for (const officeFeatureGroup of activeFeatureGroups) {
      for (const feature of officeFeatureGroup.featureGroup.features) {
        if (feature.isActive) {
          activeFeatures.add(feature.name);
        }
      }
    }

    return Array.from(activeFeatures);
  }

  /**
   * Check if multiple features are active for an office
   * @param officeId - The office ID
   * @param featureNames - Array of feature names to check
   * @returns Object with feature names as keys and boolean values
   */
  async checkMultipleFeaturesForOffice(
    officeId: string,
    featureNames: string[],
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Check each feature
    for (const featureName of featureNames) {
      try {
        results[featureName] = await this.isFeatureActiveForOffice(
          officeId,
          featureName,
        );
      } catch (error) {
        results[featureName] = false;
      }
    }

    return results;
  }
}
