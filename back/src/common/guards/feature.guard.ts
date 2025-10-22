import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OfficeFeatureGroupService } from '../../office-features/services/office-feature-group.service';

export const REQUIRED_FEATURE_KEY = 'required-feature';

/**
 * Guard that checks if a required feature is active for the office
 * Usage: @RequireFeature('Office Management')
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  private readonly logger = new Logger(FeatureGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly officeFeatureGroupService: OfficeFeatureGroupService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(
      REQUIRED_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no feature is required, allow access
    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const officeId = this.extractOfficeId(request);

    if (!officeId) {
      this.logger.warn(
        `No office ID found for feature check: ${requiredFeature}`,
      );
      throw new ForbiddenException(
        'Office context required for feature access',
      );
    }

    try {
      const isFeatureActive =
        await this.officeFeatureGroupService.isFeatureActiveForOffice(
          officeId,
          requiredFeature,
        );

      if (!isFeatureActive) {
        this.logger.warn(
          `Feature ${requiredFeature} is not active for office ${officeId}`,
        );
        throw new ForbiddenException(
          `Feature '${requiredFeature}' is not available for this office`,
        );
      }

      this.logger.debug(
        `Feature ${requiredFeature} is active for office ${officeId}`,
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Error checking feature ${requiredFeature} for office ${officeId}:`,
        error,
      );
      throw new ForbiddenException('Unable to verify feature access');
    }
  }

  /**
   * Extract office ID from request
   * Checks query params, body, and params
   */
  private extractOfficeId(request: any): string | null {
    // Check query parameters
    if (request.query?.officeId) {
      return request.query.officeId;
    }

    // Check request body
    if (request.body?.officeId) {
      return request.body.officeId;
    }

    // Check route parameters
    if (request.params?.officeId) {
      return request.params.officeId;
    }

    // Check if user has office context
    if (request.user?.officeId) {
      return request.user.officeId;
    }

    return null;
  }
}
