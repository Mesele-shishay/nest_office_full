import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { Feature } from './entities/feature.entity';
import { FeatureGroup } from './entities/feature-group.entity';
import { FeatureToken } from './entities/feature-token.entity';
import { OfficeFeatureGroup } from './entities/office-feature-group.entity';
import { AdminFeatureController } from './controllers/admin-feature.controller';
import { OfficeFeatureController as OfficeFeatureGroupController } from './controllers/office-feature-group.controller';
import { FeatureGroupService } from './services/feature-group-management.service';
import { FeatureService } from './services/feature-group.service';
import { FeatureTokenService } from './services/feature-token.service';
import { OfficeFeatureGroupService } from './services/office-feature-group.service';
import { TokenVerificationService } from './services/token-verification.service';
import { FeatureExpirationService } from './services/feature-expiration.service';
import { ExternalTokenValidationService } from './services/external-token-validation.service';
import { FeatureRegistryService } from './services/feature-registry.service';
import { User } from '../users/entities/user.entity';
import { Office } from '../office/entities/office.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feature,
      FeatureGroup,
      FeatureToken,
      OfficeFeatureGroup,
      User,
      Office,
    ]),
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AdminFeatureController, OfficeFeatureGroupController],
  providers: [
    FeatureGroupService,
    FeatureService,
    FeatureTokenService,
    OfficeFeatureGroupService,
    TokenVerificationService,
    FeatureExpirationService,
    ExternalTokenValidationService,
    FeatureRegistryService,
  ],
  exports: [
    FeatureGroupService,
    FeatureService,
    FeatureTokenService,
    OfficeFeatureGroupService,
    TokenVerificationService,
    FeatureExpirationService,
    ExternalTokenValidationService,
    FeatureRegistryService,
  ],
})
export class OfficeFeatureModule {}
