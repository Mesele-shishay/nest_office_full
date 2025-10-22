import { Injectable, Logger } from '@nestjs/common';

export interface GranularFeature {
  featureName: string;
  methodName: string;
  service: any;
  description?: string;
}

@Injectable()
export class GranularFeatureRegistryService {
  private readonly logger = new Logger(GranularFeatureRegistryService.name);
  private readonly granularFeatures = new Map<string, GranularFeature>();

  /**
   * Register a granular feature (individual method)
   * @param featureName - The name of the feature (e.g., "Create Office")
   * @param methodName - The method name (e.g., "createOffice")
   * @param service - The service instance
   * @param description - Optional description
   */
  registerGranularFeature(
    featureName: string,
    methodName: string,
    service: any,
    description?: string,
  ): void {
    const key = `${featureName}:${methodName}`;
    this.granularFeatures.set(key, {
      featureName,
      methodName,
      service,
      description,
    });
    this.logger.log(
      `Registered granular feature: ${featureName} (${methodName})`,
    );
  }

  /**
   * Register multiple granular features from a service
   * @param serviceName - Name of the service
   * @param service - The service instance
   * @param featureMappings - Mapping of feature names to method names
   */
  registerServiceFeatures(
    serviceName: string,
    service: any,
    featureMappings: Record<string, string>,
  ): void {
    Object.entries(featureMappings).forEach(([featureName, methodName]) => {
      this.registerGranularFeature(featureName, methodName, service);
    });
  }

  /**
   * Execute a granular feature action
   * @param featureName - The name of the feature
   * @param methodName - The method name
   * @param args - Arguments to pass to the method
   * @returns The result of the method execution
   */
  async executeGranularFeature(
    featureName: string,
    methodName: string,
    ...args: any[]
  ): Promise<any> {
    const key = `${featureName}:${methodName}`;
    const granularFeature = this.granularFeatures.get(key);

    if (!granularFeature) {
      throw new Error(
        `Granular feature not found: ${featureName}:${methodName}`,
      );
    }

    if (typeof granularFeature.service[methodName] !== 'function') {
      throw new Error(
        `Method ${methodName} not found for feature ${featureName}`,
      );
    }

    try {
      return await granularFeature.service[methodName](...args);
    } catch (error) {
      this.logger.error(
        `Error executing ${methodName} on feature ${featureName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if a granular feature is registered
   * @param featureName - The name of the feature
   * @param methodName - The method name
   * @returns True if the granular feature is registered
   */
  isGranularFeatureRegistered(
    featureName: string,
    methodName: string,
  ): boolean {
    const key = `${featureName}:${methodName}`;
    return this.granularFeatures.has(key);
  }

  /**
   * Get all registered granular features
   * @returns Array of granular feature information
   */
  getRegisteredGranularFeatures(): GranularFeature[] {
    return Array.from(this.granularFeatures.values());
  }

  /**
   * Get granular features by service
   * @param serviceName - Name of the service
   * @returns Array of granular features for the service
   */
  getGranularFeaturesByService(serviceName: string): GranularFeature[] {
    return Array.from(this.granularFeatures.values()).filter(
      (feature) => feature.service.constructor.name === serviceName,
    );
  }

  /**
   * Unregister a granular feature
   * @param featureName - The name of the feature
   * @param methodName - The method name
   */
  unregisterGranularFeature(featureName: string, methodName: string): void {
    const key = `${featureName}:${methodName}`;
    this.granularFeatures.delete(key);
    this.logger.log(
      `Unregistered granular feature: ${featureName} (${methodName})`,
    );
  }

  /**
   * Clear all granular features
   */
  clearAllGranularFeatures(): void {
    this.granularFeatures.clear();
    this.logger.log('Cleared all granular features');
  }
}
