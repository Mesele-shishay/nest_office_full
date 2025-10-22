import { SetMetadata } from '@nestjs/common';

export const REQUIRED_FEATURE_KEY = 'required-feature';

/**
 * Decorator to mark a controller method or class as requiring a specific feature
 * @param featureName - The name of the feature that must be active
 *
 * @example
 * ```typescript
 * @Controller('receipts')
 * @RequireFeature('Office Management')
 * export class ReceiptController {
 *   @Post()
 *   @RequireFeature('Office Management') // Can also be applied to individual methods
 *   async createReceipt(@Body() data: CreateReceiptDto) {
 *     // Implementation
 *   }
 * }
 * ```
 */
export const RequireFeature = (featureName: string) =>
  SetMetadata(REQUIRED_FEATURE_KEY, featureName);
