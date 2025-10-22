import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeFeatureGroup } from '../entities/office-feature-group.entity';

@Injectable()
export class FeatureExpirationService {
  private readonly logger = new Logger(FeatureExpirationService.name);

  constructor(
    @InjectRepository(OfficeFeatureGroup)
    private readonly officeFeatureGroupRepository: Repository<OfficeFeatureGroup>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredFeatures() {
    this.logger.log('Starting expired features cleanup...');

    try {
      const now = new Date();

      // Find all active office feature groups that have expired
      const expiredGroups = await this.officeFeatureGroupRepository
        .createQueryBuilder('ofg')
        .where('ofg.isActive = :isActive', { isActive: true })
        .andWhere('ofg.expiresAt IS NOT NULL')
        .andWhere('ofg.expiresAt < :now', { now })
        .getMany();

      if (expiredGroups.length === 0) {
        this.logger.log('No expired features found');
        return;
      }

      // Deactivate expired groups
      const result = await this.officeFeatureGroupRepository
        .createQueryBuilder()
        .update()
        .set({ isActive: false })
        .where('isActive = :isActive', { isActive: true })
        .andWhere('expiresAt IS NOT NULL')
        .andWhere('expiresAt < :now', { now })
        .execute();

      this.logger.log(`Deactivated ${result.affected} expired feature groups`);
    } catch (error) {
      this.logger.error('Error during expired features cleanup:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async logFeatureGroupStats() {
    this.logger.log('Generating feature group statistics...');

    try {
      const totalActiveGroups = await this.officeFeatureGroupRepository.count({
        where: { isActive: true },
      });

      const totalExpiredGroups = await this.officeFeatureGroupRepository
        .createQueryBuilder('ofg')
        .where('ofg.isActive = :isActive', { isActive: true })
        .andWhere('ofg.expiresAt IS NOT NULL')
        .andWhere('ofg.expiresAt < :now', { now: new Date() })
        .getCount();

      this.logger.log(
        `Feature Group Stats - Active: ${totalActiveGroups}, Expired: ${totalExpiredGroups}`,
      );
    } catch (error) {
      this.logger.error('Error generating feature group statistics:', error);
    }
  }
}
