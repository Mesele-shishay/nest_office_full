import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FeatureRegistryService {
  private readonly logger = new Logger(FeatureRegistryService.name);
  private featureServices = new Map<string, any>();

  /**
   * Register a feature service with the registry
   * @param featureName - The name of the feature (should match database feature name)
   * @param service - The service instance that implements the feature
   */
  registerFeature(featureName: string, service: any): void {
    this.featureServices.set(featureName, service);
    this.logger.log(`✅ Registered feature service: ${featureName}`);
  }

  /**
   * Get a feature service by name
   * @param featureName - The name of the feature
   * @returns The service instance or undefined if not found
   */
  getFeatureService(featureName: string): any {
    return this.featureServices.get(featureName);
  }

  /**
   * Execute a method on a feature service
   * @param featureName - The name of the feature
   * @param action - The method name to execute
   * @param args - Arguments to pass to the method
   * @returns The result of the method execution
   */
  async executeFeatureAction(
    featureName: string,
    action: string,
    ...args: any[]
  ): Promise<any> {
    const service = this.getFeatureService(featureName);

    if (!service) {
      throw new Error(`Feature service not found: ${featureName}`);
    }

    if (typeof service[action] !== 'function') {
      throw new Error(`Action ${action} not found for feature ${featureName}`);
    }

    try {
      return await service[action](...args);
    } catch (error) {
      this.logger.error(
        `Error executing ${action} on feature ${featureName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if a feature service is registered
   * @param featureName - The name of the feature
   * @returns True if the feature is registered
   */
  isFeatureRegistered(featureName: string): boolean {
    return this.featureServices.has(featureName);
  }

  /**
   * Get all registered feature names
   * @returns Array of registered feature names
   */
  getRegisteredFeatures(): string[] {
    return Array.from(this.featureServices.keys());
  }

  /**
   * Unregister a feature service
   * @param featureName - The name of the feature to unregister
   */
  unregisterFeature(featureName: string): void {
    if (this.featureServices.has(featureName)) {
      this.featureServices.delete(featureName);
      this.logger.log(`🗑️ Unregistered feature service: ${featureName}`);
    }
  }

  /**
   * Clear all registered features
   */
  clearAllFeatures(): void {
    this.featureServices.clear();
    this.logger.log('🧹 Cleared all feature services');
  }
}
