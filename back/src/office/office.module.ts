import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Office } from './entities/office.entity';
import { OfficeType } from './entities/office-type.entity';
import { User } from '../users/entities/user.entity';
import {
  OfficeController,
  LocationController,
} from './controllers/office.controller';
import { OfficeTypeController } from './controllers/office-type.controller';
import { OfficeManagementController } from './controllers/office-management.controller';
import { OfficeService } from './services/office.service';
import { OfficeTypeService } from './services/office-type.service';
import { LocationService } from './services/location.service';
import { OfficeManagementService } from './services/office-management.service';
import { FeatureRegistryService } from '../office-features/services/feature-registry.service';
import { GranularFeatureRegistryService } from '../office-features/services/granular-feature-registry.service';
import { OfficeFeatureModule } from '../office-features/office-feature.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Office, OfficeType, User]),
    HttpModule,
    OfficeFeatureModule,
    MailModule,
  ],
  controllers: [
    OfficeController,
    OfficeTypeController,
    LocationController,
    OfficeManagementController,
  ],
  providers: [
    OfficeService,
    OfficeTypeService,
    LocationService,
    OfficeManagementService,
    GranularFeatureRegistryService,
  ],
  exports: [
    OfficeService,
    OfficeTypeService,
    LocationService,
    OfficeManagementService,
    GranularFeatureRegistryService,
  ],
})
export class OfficeModule {
  constructor(
    private readonly featureRegistry: FeatureRegistryService,
    private readonly granularFeatureRegistry: GranularFeatureRegistryService,
  ) {
    // Office management features have been removed
  }
}
