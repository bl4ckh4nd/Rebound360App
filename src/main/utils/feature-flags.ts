/**
 * Feature flag system for TypeORM migration rollout
 * Allows gradual migration with easy rollback
 */

export interface FeatureFlags {
  // TypeORM migration flags
  useTypeORMForSettings: boolean;
  useTypeORMForWorkflows: boolean;
  useTypeORMForCustomFields: boolean;
  useTypeORMForReasons: boolean;
  useTypeORMForReturns: boolean;
  useTypeORMForSuppliers: boolean;
  useTypeORMForOrders: boolean;
  useTypeORMForProcurement: boolean;
  useTypeORMForShipping: boolean;
  useTypeORMForDocuments: boolean;
  useTypeORMForReporting: boolean;
  
  // Performance and monitoring
  enablePerformanceLogging: boolean;
  enableTypeORMQueryLogging: boolean;
  enableHybridQueryComparison: boolean;
  
  // Rollout controls
  typeormRolloutPercentage: number;
  enableAutoFallback: boolean;
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private overrides: Partial<FeatureFlags> = {};

  constructor() {
    this.flags = this.getDefaultFlags();
    this.loadEnvironmentOverrides();
  }

  /**
   * Default feature flag configuration
   */
  private getDefaultFlags(): FeatureFlags {
    return {
      // Start with TypeORM disabled for production safety
      useTypeORMForSettings: false,
      useTypeORMForWorkflows: false,
      useTypeORMForCustomFields: false,
      useTypeORMForReasons: false,
      useTypeORMForReturns: false,
      useTypeORMForSuppliers: false,
      useTypeORMForOrders: false,
      useTypeORMForProcurement: false,
      useTypeORMForShipping: false,
      useTypeORMForDocuments: false,
      useTypeORMForReporting: false,
      
      // Enable monitoring in development
      enablePerformanceLogging: process.env.NODE_ENV === 'development',
      enableTypeORMQueryLogging: process.env.NODE_ENV === 'development',
      enableHybridQueryComparison: process.env.NODE_ENV === 'development',
      
      // Conservative rollout settings
      typeormRolloutPercentage: 0,
      enableAutoFallback: true
    };
  }

  /**
   * Load overrides from environment variables
   */
  private loadEnvironmentOverrides(): void {
    // TypeORM feature flags
    if (process.env.TYPEORM_SETTINGS === 'true') {
      this.overrides.useTypeORMForSettings = true;
    }
    if (process.env.TYPEORM_WORKFLOWS === 'true') {
      this.overrides.useTypeORMForWorkflows = true;
    }
    if (process.env.TYPEORM_CUSTOM_FIELDS === 'true') {
      this.overrides.useTypeORMForCustomFields = true;
    }
    if (process.env.TYPEORM_REASONS === 'true') {
      this.overrides.useTypeORMForReasons = true;
    }
    
    // Advanced features (typically disabled in production)
    if (process.env.TYPEORM_RETURNS === 'true') {
      this.overrides.useTypeORMForReturns = true;
    }
    if (process.env.TYPEORM_SUPPLIERS === 'true') {
      this.overrides.useTypeORMForSuppliers = true;
    }
    if (process.env.TYPEORM_ORDERS === 'true') {
      this.overrides.useTypeORMForOrders = true;
    }
    if (process.env.TYPEORM_PROCUREMENT === 'true') {
      this.overrides.useTypeORMForProcurement = true;
    }
    if (process.env.TYPEORM_SHIPPING === 'true') {
      this.overrides.useTypeORMForShipping = true;
    }
    if (process.env.TYPEORM_DOCUMENTS === 'true') {
      this.overrides.useTypeORMForDocuments = true;
    }
    
    // Monitoring flags
    if (process.env.ENABLE_PERFORMANCE_LOGGING === 'true') {
      this.overrides.enablePerformanceLogging = true;
    }
    if (process.env.ENABLE_TYPEORM_LOGGING === 'true') {
      this.overrides.enableTypeORMQueryLogging = true;
    }
    
    // Rollout percentage
    if (process.env.TYPEORM_ROLLOUT_PERCENTAGE) {
      const percentage = parseInt(process.env.TYPEORM_ROLLOUT_PERCENTAGE, 10);
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        this.overrides.typeormRolloutPercentage = percentage;
      }
    }
    
    // Auto fallback
    if (process.env.DISABLE_AUTO_FALLBACK === 'true') {
      this.overrides.enableAutoFallback = false;
    }
  }

  /**
   * Get a feature flag value
   */
  isEnabled(flag: keyof FeatureFlags): boolean | number {
    return this.overrides[flag] ?? this.flags[flag];
  }

  /**
   * Temporarily override a flag (for testing)
   */
  setOverride(flag: keyof FeatureFlags, value: boolean | number): void {
    this.overrides[flag] = value as any;
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides = {};
  }

  /**
   * Check if user should get TypeORM version based on rollout percentage
   */
  shouldUseTypeORM(userId?: string): boolean {
    const rolloutPercentage = this.isEnabled('typeormRolloutPercentage') as number;
    
    if (rolloutPercentage === 0) return false;
    if (rolloutPercentage === 100) return true;
    
    // Use deterministic hash for consistent user experience
    if (userId) {
      const hash = this.hashUserId(userId);
      return hash < rolloutPercentage;
    }
    
    // Fallback to random for anonymous users
    return Math.random() * 100 < rolloutPercentage;
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Get all current flag values (for debugging)
   */
  getAllFlags(): FeatureFlags {
    return {
      ...this.flags,
      ...this.overrides
    };
  }

  /**
   * Log current flag status
   */
  logStatus(): void {
    console.log('🚩 Feature Flags Status:');
    console.log('=' .repeat(30));
    
    const flags = this.getAllFlags();
    Object.entries(flags).forEach(([key, value]) => {
      const icon = value ? '✅' : '❌';
      const override = key in this.overrides ? ' (override)' : '';
      console.log(`${icon} ${key}: ${value}${override}`);
    });
    
    console.log('=' .repeat(30));
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience functions for common checks
export const useTypeORMForSettings = () => featureFlags.isEnabled('useTypeORMForSettings');
export const useTypeORMForWorkflows = () => featureFlags.isEnabled('useTypeORMForWorkflows');
export const useTypeORMForCustomFields = () => featureFlags.isEnabled('useTypeORMForCustomFields');
export const useTypeORMForReasons = () => featureFlags.isEnabled('useTypeORMForReasons');
export const useTypeORMForReturns = () => featureFlags.isEnabled('useTypeORMForReturns');
export const useTypeORMForSuppliers = () => featureFlags.isEnabled('useTypeORMForSuppliers');
export const useTypeORMForOrders = () => featureFlags.isEnabled('useTypeORMForOrders');
export const useTypeORMForProcurement = () => featureFlags.isEnabled('useTypeORMForProcurement');
export const useTypeORMForShipping = () => featureFlags.isEnabled('useTypeORMForShipping');
export const useTypeORMForDocuments = () => featureFlags.isEnabled('useTypeORMForDocuments');

export const enablePerformanceLogging = () => featureFlags.isEnabled('enablePerformanceLogging');
export const enableAutoFallback = () => featureFlags.isEnabled('enableAutoFallback');

/**
 * Wrapper function for gradual TypeORM rollout
 */
export async function withTypeORMFallback<T>(
  typeormOperation: () => Promise<T>,
  fallbackOperation: () => T | Promise<T>,
  operationName: string = 'unknown'
): Promise<T> {
  const shouldFallback = !featureFlags.isEnabled('enableAutoFallback');
  
  if (shouldFallback) {
    return await fallbackOperation();
  }

  try {
    const start = Date.now();
    const result = await typeormOperation();
    
    if (featureFlags.isEnabled('enablePerformanceLogging')) {
      console.log(`⚡ TypeORM ${operationName}: ${Date.now() - start}ms`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ TypeORM ${operationName} failed, falling back:`, error instanceof Error ? error.message : error);
    
    if (featureFlags.isEnabled('enableAutoFallback')) {
      return await fallbackOperation();
    } else {
      throw error;
    }
  }
}

/**
 * Development helper to quickly enable TypeORM features
 */
export function enableTypeORMForDevelopment(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  enableTypeORMForDevelopment() should only be used in development');
    return;
  }
  
  console.log('🚀 Enabling TypeORM features for development...');
  
  featureFlags.setOverride('useTypeORMForSettings', true);
  featureFlags.setOverride('useTypeORMForWorkflows', true);
  featureFlags.setOverride('useTypeORMForCustomFields', true);
  featureFlags.setOverride('useTypeORMForReasons', true);
  featureFlags.setOverride('enablePerformanceLogging', true);
  featureFlags.setOverride('enableTypeORMQueryLogging', true);
  
  featureFlags.logStatus();
}