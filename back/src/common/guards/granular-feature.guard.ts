import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GranularFeatureRegistryService } from '../../office-features/services/granular-feature-registry.service';
import { OfficeFeatureGroupService } from '../../office-features/services/office-feature-group.service';
import { GRANULAR_FEATURE_KEY } from '../decorators/require-granular-feature.decorator';

@Injectable()
export class GranularFeatureGuard implements CanActivate {
  private readonly logger = new Logger(GranularFeatureGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly officeFeatureGroupService: OfficeFeatureGroupService,
    private readonly granularFeatureRegistry: GranularFeatureRegistryService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get granular feature metadata
    const granularFeatureMetadata = this.reflector.getAllAndOverride<{
      featureName: string;
      methodName?: string;
    }>(GRANULAR_FEATURE_KEY, [context.getHandler(), context.getClass()]);

    // If no granular feature is required, allow access
    if (!granularFeatureMetadata) {
      return true;
    }

    const { featureName, methodName } = granularFeatureMetadata;
    const request = context.switchToHttp().getRequest();
    const officeId = this.extractOfficeId(request);

    if (!officeId) {
      throw new ForbiddenException('Office ID is required for feature access');
    }

    // Check if the granular feature is registered
    const actualMethodName =
      methodName || this.getMethodNameFromContext(context);
    if (
      !this.granularFeatureRegistry.isGranularFeatureRegistered(
        featureName,
        actualMethodName,
      )
    ) {
      throw new ForbiddenException(
        `Granular feature '${featureName}:${actualMethodName}' is not registered`,
      );
    }

    // Check if the office has access to this specific feature
    try {
      const hasAccess =
        await this.officeFeatureGroupService.isFeatureActiveForOffice(
          officeId,
          featureName,
        );

      if (!hasAccess) {
        throw new ForbiddenException(
          `Feature '${featureName}' is not available for this office`,
        );
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error checking granular feature ${featureName} for office ${officeId}:`,
        error,
      );
      throw new ForbiddenException(
        `Feature '${featureName}' is not available for this office`,
      );
    }
  }

  private extractOfficeId(request: any): string | null {
    // Try to get officeId from different sources
    return (
      request.query?.officeId ||
      request.body?.officeId ||
      request.params?.officeId ||
      request.user?.officeId ||
      null
    );
  }

  private getMethodNameFromContext(context: ExecutionContext): string {
    const handler = context.getHandler();
    return handler.name;
  }
}
