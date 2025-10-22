import { SetMetadata } from '@nestjs/common';

export const GRANULAR_FEATURE_KEY = 'granularFeature';

/**
 * Decorator to mark a method as requiring a specific granular feature
 * @param featureName - The name of the granular feature (e.g., "Create Office")
 * @param methodName - The method name (optional, defaults to the decorated method name)
 *
 * @example
 * ```typescript
 * @RequireGranularFeature('Create Office')
 * async createOffice(dto: CreateOfficeDto) {
 *   // This method requires the "Create Office" feature
 * }
 *
 * @RequireGranularFeature('Update Office', 'updateOffice')
 * async updateOffice(id: string, dto: UpdateOfficeDto) {
 *   // This method requires the "Update Office" feature
 * }
 * ```
 */
export const RequireGranularFeature = (
  featureName: string,
  methodName?: string,
) => SetMetadata(GRANULAR_FEATURE_KEY, { featureName, methodName });
